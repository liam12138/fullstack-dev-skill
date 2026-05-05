import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SessionState, ConfirmationState, Stage } from '../core/types';
import { STAGES } from '../core';

export interface StateManagerConfig {
  storageType: 'memory' | 'file';
  storagePath?: string;
  autoSave: boolean;
}

interface PersistedSessionsData {
  sessions: Record<string, SessionState>;
}

function defaultStoragePath(): string {
  return path.join(os.homedir(), '.claude', 'fullstack-dev', 'sessions.json');
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
    if (this.config.storageType === 'file') {
      this.loadFromFile();
    }
  }

  get storagePath(): string {
    return this.config.storagePath || defaultStoragePath();
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
    this.tryAutoSave();
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

  getAllSessions(): SessionState[] {
    return Array.from(this.sessions.values());
  }

  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
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
    this.tryAutoSave();
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
    this.tryAutoSave();
    return session;
  }

  updateCollectedData(sessionId: string, key: string, value: unknown): SessionState | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    session.collectedData[key] = value;
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.tryAutoSave();
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
    const result = this.sessions.delete(sessionId);
    if (result) {
      this.tryAutoSave();
    }
    return result;
  }

  isFileStorage(): boolean {
    return this.config.storageType === 'file';
  }

  clearAllSessions(): void {
    this.sessions.clear();
    this.tryAutoSave();
  }

  saveToFile(): boolean {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const sessionsObj: Record<string, SessionState> = {};
      for (const [id, session] of this.sessions) {
        sessionsObj[id] = session;
      }

      const data: PersistedSessionsData = { sessions: sessionsObj };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to save sessions to file:', error);
      return false;
    }
  }

  loadFromFile(): boolean {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return false;
      }

      const content = fs.readFileSync(this.storagePath, 'utf-8');
      const data: PersistedSessionsData = JSON.parse(content);

      this.sessions.clear();
      for (const [id, session] of Object.entries(data.sessions)) {
        this.sessions.set(id, session);
      }
      return true;
    } catch (error) {
      console.error('Failed to load sessions from file:', error);
      return false;
    }
  }

  private tryAutoSave(): void {
    if (this.config.storageType === 'file' && this.config.autoSave) {
      this.saveToFile();
    }
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const stateManager = new StateManager({ storageType: 'file' });
