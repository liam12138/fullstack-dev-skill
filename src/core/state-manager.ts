import { SessionState, ConfirmationState, Stage } from '../core/types';
import { STAGES } from '../core';

export interface StateManagerConfig {
  storageType: 'memory' | 'file';
  storagePath?: string;
  autoSave: boolean;
}

export class StateManager {
  private sessions: Map<string, SessionState> = new Map();
  private config: StateManagerConfig;

  constructor(config: Partial<StateManagerConfig> = {}) {
    this.config = {
      storageType: config.storageType || 'memory',
      autoSave: config.autoSave ?? true,
      ...config,
    };
  }

  createSession(projectId: string): SessionState {
    const sessionId = this.generateId();
    const now = new Date().toISOString();
    
    const session: SessionState = {
      sessionId,
      projectId,
      currentStage: STAGES.INIT,
      currentStep: 'start',
      confirmationHistory: [],
      collectedData: {},
      createdAt: now,
      updatedAt: now,
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByProject(projectId: string): SessionState | undefined {
    for (const session of this.sessions.values()) {
      if (session.projectId === projectId) {
        return session;
      }
    }
    return undefined;
  }

  updateSession(sessionId: string, updates: Partial<SessionState>): SessionState | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  addConfirmation(sessionId: string, confirmation: Omit<ConfirmationState, 'confirmedAt'>): SessionState | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const confirmationState: ConfirmationState = {
      ...confirmation,
      confirmedAt: confirmation.confirmed ? new Date().toISOString() : undefined,
    };
    
    session.confirmationHistory.push(confirmationState);
    session.updatedAt = new Date().toISOString();
    
    this.sessions.set(sessionId, session);
    return session;
  }

  updateCollectedData(sessionId: string, key: string, value: unknown): SessionState | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    session.collectedData[key] = value;
    session.updatedAt = new Date().toISOString();
    
    this.sessions.set(sessionId, session);
    return session;
  }

  getCollectedData<T>(sessionId: string, key: string): T | undefined {
    const session = this.sessions.get(sessionId);
    return session?.collectedData[key] as T | undefined;
  }

  setCurrentStage(sessionId: string, stage: Stage, step: string): SessionState | undefined {
    return this.updateSession(sessionId, {
      currentStage: stage,
      currentStep: step,
    });
  }

  canRollback(sessionId: string, targetStage: Stage, targetStep: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    const stageOrder = Object.values(STAGES);
    const currentIndex = stageOrder.indexOf(session.currentStage);
    const targetIndex = stageOrder.indexOf(targetStage);
    
    if (targetIndex < currentIndex) return true;
    if (targetIndex === currentIndex) {
      return true;
    }
    
    return false;
  }

  rollback(sessionId: string, targetStage: Stage, targetStep: string): SessionState | undefined {
    const session = this.sessions.get(sessionId);
    if (!session || !this.canRollback(sessionId, targetStage, targetStep)) {
      return undefined;
    }
    
    const filteredHistory = session.confirmationHistory.filter(c => {
      const stageOrder = Object.values(STAGES);
      const confirmationIndex = stageOrder.indexOf(c.stage);
      const targetIndex = stageOrder.indexOf(targetStage);
      return confirmationIndex < targetIndex;
    });
    
    return this.updateSession(sessionId, {
      currentStage: targetStage,
      currentStep: targetStep,
      confirmationHistory: filteredHistory,
    });
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  clearAllSessions(): void {
    this.sessions.clear();
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const stateManager = new StateManager();
