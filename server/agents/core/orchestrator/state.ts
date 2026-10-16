import type { BaseAgent } from '../BaseAgent';
import type { AgentJob, AgentType } from '../types';
import type { DatabaseFailureCode } from '../../../database/failureClassification';

export const DEFAULT_PROCESSING_INTERVAL_MS = 1_000;
export const SYNC_INTERVAL_MS = 30_000;
export const MAX_SYNC_RETRY_DELAY_MS = 120_000;
export const SYNC_RETRY_JITTER_RATIO = 0.2;
export const MAX_ACTIVE_JOBS = 4;
export const MAX_RETRY_DELAY_MS = 30_000;

export interface OrchestratorState {
  agents: Map<AgentType, BaseAgent>;
  jobQueue: AgentJob[];
  activeJobs: Map<string, AgentJob>;
  isRunning: boolean;
  processingInterval: ReturnType<typeof setInterval> | null;
  isProcessingCycle: boolean;
  initialized: boolean;
  initializationPromise: Promise<void> | null;
  nextQueueSyncAt: number;
  lastQueueSyncAt: number | null;
  lastQueueSyncErrorCode: DatabaseFailureCode | null;
  queueSyncReadyLogged: boolean;
  consecutiveSyncFailures: number;
  queueSyncUnavailableSince: number | null;
}

export function createOrchestratorState(): OrchestratorState {
  return {
    agents: new Map(),
    jobQueue: [],
    activeJobs: new Map(),
    isRunning: false,
    processingInterval: null,
    isProcessingCycle: false,
    initialized: false,
    initializationPromise: null,
    nextQueueSyncAt: 0,
    lastQueueSyncAt: null,
    lastQueueSyncErrorCode: null,
    queueSyncReadyLogged: false,
    consecutiveSyncFailures: 0,
    queueSyncUnavailableSince: null,
  };
}
