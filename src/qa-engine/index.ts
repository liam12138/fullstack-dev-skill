export * from './types';
export * from './engine';
export * from './questions';

import { qaEngine } from './engine';
import { getQuestionFlows } from './questions';

export function initializeQaEngine(): void {
  const flows = getQuestionFlows();
  for (const flow of flows) {
    qaEngine.registerFlow(flow);
  }
}

export { qaEngine };
