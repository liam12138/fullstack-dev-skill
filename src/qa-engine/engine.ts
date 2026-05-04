import {
  Question,
  QuestionGroup,
  QuestionFlow,
  QuestionnaireState,
  Answer,
  QuestionnaireResult,
  validateAnswer,
  evaluateQuestionCondition,
} from './types';

export class QaEngine {
  private flows: Map<string, QuestionFlow> = new Map();
  private states: Map<string, QuestionnaireState> = new Map();

  registerFlow(flow: QuestionFlow): void {
    this.flows.set(flow.id, flow);
  }

  getFlow(flowId: string): QuestionFlow | undefined {
    return this.flows.get(flowId);
  }

  startQuestionnaire(flowId: string): QuestionnaireState | null {
    const flow = this.flows.get(flowId);
    if (!flow || flow.groups.length === 0) return null;

    const firstGroup = flow.groups[0];
    const firstQuestion = firstGroup.questions[0];

    const state: QuestionnaireState = {
      flowId,
      currentGroupId: firstGroup.id,
      currentQuestionId: firstQuestion.id,
      answers: new Map(),
      history: [],
      startedAt: new Date().toISOString(),
    };

    this.states.set(this.getStateKey(flowId), state);
    return state;
  }

  getCurrentQuestion(flowId: string): Question | null {
    const state = this.states.get(this.getStateKey(flowId));
    if (!state) return null;

    const flow = this.flows.get(flowId);
    if (!flow) return null;

    const group = flow.groups.find(g => g.id === state.currentGroupId);
    if (!group) return null;

    return group.questions.find(q => q.id === state.currentQuestionId) || null;
  }

  answerQuestion(flowId: string, value: unknown): {
    success: boolean;
    errors: string[];
    nextQuestion: Question | null;
    isComplete: boolean;
  } {
    const state = this.states.get(this.getStateKey(flowId));
    if (!state) {
      return { success: false, errors: ['问卷状态不存在'], nextQuestion: null, isComplete: false };
    }

    const currentQuestion = this.getCurrentQuestion(flowId);
    if (!currentQuestion) {
      return { success: false, errors: ['当前问题不存在'], nextQuestion: null, isComplete: false };
    }

    const validation = validateAnswer(currentQuestion, value);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors, nextQuestion: null, isComplete: false };
    }

    const answer: Answer = {
      questionId: currentQuestion.id,
      value,
      timestamp: new Date().toISOString(),
      isValid: true,
    };

    state.answers.set(currentQuestion.id, answer);
    state.history.push({
      groupId: state.currentGroupId,
      questionId: state.currentQuestionId,
      direction: 'forward',
      timestamp: new Date().toISOString(),
    });

    const nextResult = this.findNextQuestion(flowId);
    if (nextResult.question) {
      state.currentGroupId = nextResult.groupId;
      state.currentQuestionId = nextResult.question.id;
    } else {
      state.completedAt = new Date().toISOString();
    }

    return {
      success: true,
      errors: [],
      nextQuestion: nextResult.question,
      isComplete: nextResult.isComplete,
    };
  }

  goBack(flowId: string): Question | null {
    const state = this.states.get(this.getStateKey(flowId));
    if (!state || state.history.length === 0) return null;

    const lastEntry = state.history.pop();
    if (!lastEntry) return null;

    state.currentGroupId = lastEntry.groupId;
    state.currentQuestionId = lastEntry.questionId;

    state.history.push({
      groupId: lastEntry.groupId,
      questionId: lastEntry.questionId,
      direction: 'backward',
      timestamp: new Date().toISOString(),
    });

    return this.getCurrentQuestion(flowId);
  }

  getProgress(flowId: string): {
    current: number;
    total: number;
    percentage: number;
    groupName: string;
  } {
    const state = this.states.get(this.getStateKey(flowId));
    const flow = this.flows.get(flowId);
    if (!state || !flow) {
      return { current: 0, total: 0, percentage: 0, groupName: '' };
    }

    let total = 0;
    let current = 0;
    let currentGroupName = '';
    let foundCurrent = false;

    for (const group of flow.groups) {
      if (group.condition && !evaluateQuestionCondition(group.condition, state.answers)) {
        continue;
      }

      for (const question of group.questions) {
        if (question.condition && !evaluateQuestionCondition(question.condition, state.answers)) {
          continue;
        }
        total++;

        if (!foundCurrent) {
          current++;
          if (question.id === state.currentQuestionId) {
            foundCurrent = true;
            currentGroupName = group.title;
          }
        }
      }
    }

    return {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
      groupName: currentGroupName,
    };
  }

  getAnswers(flowId: string): Record<string, unknown> {
    const state = this.states.get(this.getStateKey(flowId));
    if (!state) return {};

    const result: Record<string, unknown> = {};
    state.answers.forEach((answer, questionId) => {
      result[questionId] = answer.value;
    });
    return result;
  }

  getResult(flowId: string): QuestionnaireResult | null {
    const state = this.states.get(this.getStateKey(flowId));
    if (!state || !state.completedAt) return null;

    const answers = this.getAnswers(flowId);
    const startedAt = new Date(state.startedAt).getTime();
    const completedAt = new Date(state.completedAt).getTime();

    return {
      flowId,
      answers,
      completedAt: state.completedAt,
      duration: completedAt - startedAt,
    };
  }

  reset(flowId: string): void {
    this.states.delete(this.getStateKey(flowId));
  }

  private findNextQuestion(flowId: string): {
    question: Question | null;
    groupId: string;
    isComplete: boolean;
  } {
    const state = this.states.get(this.getStateKey(flowId));
    const flow = this.flows.get(flowId);
    if (!state || !flow) {
      return { question: null, groupId: '', isComplete: true };
    }

    const currentGroupIndex = flow.groups.findIndex(g => g.id === state.currentGroupId);
    const currentGroup = flow.groups[currentGroupIndex];
    const currentQuestionIndex = currentGroup.questions.findIndex(
      q => q.id === state.currentQuestionId
    );

    for (let i = currentQuestionIndex + 1; i < currentGroup.questions.length; i++) {
      const question = currentGroup.questions[i];
      if (!question.condition || evaluateQuestionCondition(question.condition, state.answers)) {
        return { question, groupId: currentGroup.id, isComplete: false };
      }
    }

    for (let g = currentGroupIndex + 1; g < flow.groups.length; g++) {
      const group = flow.groups[g];
      if (group.condition && !evaluateQuestionCondition(group.condition, state.answers)) {
        continue;
      }

      for (const question of group.questions) {
        if (!question.condition || evaluateQuestionCondition(question.condition, state.answers)) {
          return { question, groupId: group.id, isComplete: false };
        }
      }
    }

    return { question: null, groupId: '', isComplete: true };
  }

  private getStateKey(flowId: string): string {
    return flowId;
  }
}

export const qaEngine = new QaEngine();
