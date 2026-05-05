import { StateManager, stateManager } from './core/state-manager';
import { qaEngine, initializeQaEngine } from './qa-engine';
import { documentGenerator } from './doc-generator';
import {
  ProjectConfig,
  SessionState,
  Stage,
} from './core/types';
import {
  STAGES,
  STAGE_NAMES,
  ArchitectureType,
  ProjectType,
} from './core';
import { RequirementSpec, TechSolution, TechRecommendation } from './core/specs';

export interface FullstackDevSkill {
  stateManager: StateManager;
  qaEngine: typeof qaEngine;
  documentGenerator: typeof documentGenerator;

  init(): void;
  startProject(): SessionState;
  getCurrentStage(sessionId: string): string;
  processUserInput(sessionId: string, input: string): SkillResponse;
  generateRequirementsDocument(sessionId: string): string | null;
  generateTechSpecDocument(sessionId: string): string | null;
  confirmStage(sessionId: string): boolean;
  rollback(sessionId: string, targetStage: Stage): boolean;
  getExistingSessions(): SessionState[];
  resumeSession(sessionId: string): SkillResponse;
}

export interface SkillResponse {
  type: 'question' | 'info' | 'document' | 'confirmation' | 'error' | 'resume-options';
  content: string;
  data?: unknown;
  nextAction?: string;
}

class FullstackDevSkillImpl implements FullstackDevSkill {
  stateManager: StateManager;
  qaEngine: typeof qaEngine;
  documentGenerator: typeof documentGenerator;

  constructor() {
    this.stateManager = stateManager;
    this.qaEngine = qaEngine;
    this.documentGenerator = documentGenerator;
  }

  init(): void {
    initializeQaEngine();
    if (this.stateManager.isFileStorage()) {
      this.stateManager.loadFromFile();
      this.qaEngine.loadFromFile();
    }
  }

  startProject(): SessionState {
    const projectId = `project_${Date.now()}`;
    const session = this.stateManager.createSession(projectId);
    this.qaEngine.startQuestionnaire('project-init');
    return session;
  }

  getCurrentStage(sessionId: string): string {
    const session = this.stateManager.getSession(sessionId);
    if (!session) return '';
    return STAGE_NAMES[session.currentStage] || session.currentStage;
  }

  getExistingSessions(): SessionState[] {
    return this.stateManager.getAllSessions();
  }

  resumeSession(sessionId: string): SkillResponse {
    const session = this.stateManager.getSession(sessionId);
    if (!session) {
      return {
        type: 'error',
        content: '会话不存在，无法恢复',
      };
    }

    if (session.completedAt) {
      return {
        type: 'info',
        content: '该会话已完成所有阶段，无需恢复',
      };
    }

    const flowId = this.getFlowIdForStage(session.currentStage);
    if (flowId) {
      const hasActiveState = this.qaEngine.hasActiveState(flowId);
      if (!hasActiveState) {
        this.qaEngine.startQuestionnaire(flowId);
      }
    }

    const currentQuestion = flowId ? this.qaEngine.getCurrentQuestion(flowId) : null;

    if (currentQuestion) {
      const progress = this.qaEngine.getProgress(flowId!);
      return {
        type: 'question',
        content: `已恢复会话 (${STAGE_NAMES[session.currentStage]} - 进度 ${progress.percentage}%)

${currentQuestion.title}`,
        data: {
          session,
          question: currentQuestion,
          progress,
        },
        nextAction: 'continue',
      };
    }

    return {
      type: 'info',
      content: `已恢复会话，当前阶段: ${STAGE_NAMES[session.currentStage]}`,
      data: { session },
      nextAction: 'continue-stage',
    };
  }

  processUserInput(sessionId: string, input: string): SkillResponse {
    const session = this.stateManager.getSession(sessionId);
    if (!session) {
      return {
        type: 'error',
        content: '会话不存在，请重新开始',
      };
    }

    switch (session.currentStage) {
      case STAGES.INIT:
        return this.handleInitStage(sessionId, input);
      case STAGES.REQUIREMENTS:
        return this.handleRequirementsStage(sessionId, input);
      case STAGES.TECH_SPEC:
        return this.handleTechSpecStage(sessionId, input);
      case STAGES.CODE_GEN:
        return this.handleCodeGenStage(sessionId, input);
      case STAGES.DELIVERY:
        return this.handleDeliveryStage(sessionId, input);
      default:
        return {
          type: 'error',
          content: '未知的阶段',
        };
    }
  }

  generateRequirementsDocument(sessionId: string): string | null {
    const session = this.stateManager.getSession(sessionId);
    if (!session) return null;

    const spec = this.stateManager.getCollectedData<RequirementSpec>(sessionId, 'requirementSpec');
    if (!spec) return null;

    return this.documentGenerator.generateRequirementsDocument(spec);
  }

  generateTechSpecDocument(sessionId: string): string | null {
    const session = this.stateManager.getSession(sessionId);
    if (!session) return null;

    const solution = this.stateManager.getCollectedData<TechSolution>(sessionId, 'techSolution');
    const projectConfig = this.stateManager.getCollectedData<ProjectConfig>(sessionId, 'projectConfig');

    if (!solution || !projectConfig) return null;

    return this.documentGenerator.generateTechSpecDocument(solution, projectConfig);
  }

  confirmStage(sessionId: string): boolean {
    const session = this.stateManager.getSession(sessionId);
    if (!session) return false;

    const stages = Object.values(STAGES);
    const currentIndex = stages.indexOf(session.currentStage);

    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];

      const currentFlowId = this.getFlowIdForStage(session.currentStage);
      if (currentFlowId) {
        this.qaEngine.reset(currentFlowId);
      }

      this.stateManager.setCurrentStage(sessionId, nextStage, 'start');

      const nextFlowId = this.getFlowIdForStage(nextStage);
      if (nextFlowId) {
        this.qaEngine.startQuestionnaire(nextFlowId);
      }

      return true;
    }

    return false;
  }

  rollback(sessionId: string, targetStage: Stage): boolean {
    return this.stateManager.rollback(sessionId, targetStage, 'start') !== null;
  }

  private getFlowIdForStage(stage: Stage): string | null {
    switch (stage) {
      case STAGES.INIT:
        return 'project-init';
      case STAGES.REQUIREMENTS:
        return 'requirements';
      default:
        return null;
    }
  }

  private handleInitStage(sessionId: string, input: string): SkillResponse {
    const currentQuestion = this.qaEngine.getCurrentQuestion('project-init');

    if (currentQuestion) {
      const result = this.qaEngine.answerQuestion('project-init', input);

      if (!result.success) {
        return {
          type: 'error',
          content: result.errors.join('\n'),
          data: { question: currentQuestion },
        };
      }

      if (result.isComplete) {
        const answers = this.qaEngine.getAnswers('project-init');
        this.createProjectConfig(sessionId, answers);

        return {
          type: 'confirmation',
          content: '项目初始化信息已收集完成，是否继续进行需求收集？',
          data: { projectConfig: this.stateManager.getCollectedData(sessionId, 'projectConfig') },
          nextAction: 'confirm-init',
        };
      }

      return {
        type: 'question',
        content: result.nextQuestion?.title || '',
        data: { question: result.nextQuestion },
      };
    }

    return {
      type: 'info',
      content: '项目初始化已完成',
    };
  }

  private handleRequirementsStage(sessionId: string, input: string): SkillResponse {
    const currentQuestion = this.qaEngine.getCurrentQuestion('requirements');

    if (currentQuestion) {
      const result = this.qaEngine.answerQuestion('requirements', input);

      if (!result.success) {
        return {
          type: 'error',
          content: result.errors.join('\n'),
          data: { question: currentQuestion },
        };
      }

      if (result.isComplete) {
        const answers = this.qaEngine.getAnswers('requirements');
        this.createRequirementSpec(sessionId, answers);

        return {
          type: 'confirmation',
          content: '需求信息已收集完成，是否生成需求文档？',
          data: { requirementSpec: this.stateManager.getCollectedData(sessionId, 'requirementSpec') },
          nextAction: 'confirm-requirements',
        };
      }

      return {
        type: 'question',
        content: result.nextQuestion?.title || '',
        data: { question: result.nextQuestion },
      };
    }

    return {
      type: 'info',
      content: '需求收集已完成',
    };
  }

  private handleTechSpecStage(sessionId: string, input: string): SkillResponse {
    return {
      type: 'info',
      content: '技术方案阶段处理中...',
    };
  }

  private handleCodeGenStage(sessionId: string, input: string): SkillResponse {
    return {
      type: 'info',
      content: '代码生成阶段处理中...',
    };
  }

  private handleDeliveryStage(sessionId: string, input: string): SkillResponse {
    return {
      type: 'info',
      content: '项目交付阶段处理中...',
    };
  }

  private createProjectConfig(sessionId: string, answers: Record<string, unknown>): void {
    const projectConfig: ProjectConfig = {
      id: `proj_${Date.now()}`,
      name: answers['project-name'] as string || 'unnamed-project',
      description: answers['project-description'] as string || '',
      type: answers['project-type'] as ProjectType || 'web',
      architectureType: answers['architecture-type'] as ArchitectureType || 'monolithic',
      directory: `./${answers['project-name'] || 'project'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      techStack: {},
      metadata: {},
    };

    this.stateManager.updateCollectedData(sessionId, 'projectConfig', projectConfig);
  }

  private createRequirementSpec(sessionId: string, answers: Record<string, unknown>): void {
    const projectConfig = this.stateManager.getCollectedData<ProjectConfig>(sessionId, 'projectConfig');

    const spec: RequirementSpec = {
      id: `req_${Date.now()}`,
      projectId: projectConfig?.id || '',
      overview: {
        name: projectConfig?.name || '',
        description: projectConfig?.description || '',
        goals: [],
        targetUsers: (answers['target-users'] as string || '').split('\n').filter(Boolean),
      },
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      userRoles: [],
      dataEntities: [],
      constraints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.stateManager.updateCollectedData(sessionId, 'requirementSpec', spec);
  }
}

export const fullstackDevSkill = new FullstackDevSkillImpl();

export function createSkill(): FullstackDevSkill {
  const skill = new FullstackDevSkillImpl();
  skill.init();
  return skill;
}

export default fullstackDevSkill;
