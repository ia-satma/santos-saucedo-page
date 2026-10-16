import type { BaseAgent } from '../BaseAgent';
import type { AgentJob, AgentType, JobPriority } from '../types';
import { classifyDatabaseFailure, type DatabaseFailureCode } from '../../../database/failureClassification';
import type { OrchestratorDependencies } from './dependencies';
import {
  countActiveJobsForAgent,
  insertJobByPriority,
  mapPersistedJob,
  sortJobsByPriority,
} from './mappers';
import type { OrchestratorOutcomeService } from './outcomeService';
import {
  MAX_SYNC_RETRY_DELAY_MS,
  SYNC_INTERVAL_MS,
  SYNC_RETRY_JITTER_RATIO,
  type OrchestratorState,
} from './state';

export type QueueSyncResult =
  | { ok: true; addedCount: number }
  | { ok: false; code: DatabaseFailureCode; retryable: boolean; retryInMs: number };

export class OrchestratorQueueService {
  constructor(
    private readonly state: OrchestratorState,
    private readonly dependencies: OrchestratorDependencies,
    private readonly outcomes: OrchestratorOutcomeService,
  ) {}

  async initialize(): Promise<void> {
    if (this.state.initialized) return;
    if (this.state.initializationPromise) return this.state.initializationPromise;

    this.state.initializationPromise = this.performInitialization();
    try {
      await this.state.initializationPromise;
      this.state.initialized = true;
    } finally {
      this.state.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    this.dependencies.logger.log('[Orchestrator] Initializing agent system...');
    await this.dependencies.knowledge.initialize();
    await this.dependencies.knowledge.addLegalGlossary();
    await this.dependencies.knowledge.addSocialCopyGuide();
    await this.dependencies.knowledge.addEditorialVoiceGuide();
    await this.dependencies.evolution.initialize();

    await this.loadPendingJobsFromDatabase();

    this.dependencies.logger.log('[Orchestrator] Agent system initialized');
  }

  private async loadPendingJobsFromDatabase(): Promise<void> {
    try {
      const resetCount = await this.dependencies.persistence.resetInProgressJobsToPending();
      if (resetCount > 0) {
        this.dependencies.logger.log(
          `[Orchestrator] Reset ${resetCount} in_progress jobs to pending for retry`,
        );
      }

      const pendingJobs = await this.dependencies.persistence.getPendingJobs();
      this.dependencies.logger.log(
        `[Orchestrator] Loading ${pendingJobs.length} pending jobs from database`,
      );

      const jobs = pendingJobs.map((job) => (
        mapPersistedJob(job, this.dependencies.clock.now)
      ));
      sortJobsByPriority(jobs);
      this.state.jobQueue.push(...jobs);

      const failedJobs = await this.dependencies.persistence.getFailedJobs(20);
      if (failedJobs.length > 0) {
        this.dependencies.logger.log(
          `[Orchestrator] ${failedJobs.length} failed jobs available for monitoring`,
        );
      }

      this.dependencies.logger.log(
        `[Orchestrator] Loaded ${this.state.jobQueue.length} jobs into queue`,
      );
      this.recordSyncSuccess();
    } catch (error) {
      this.recordSyncFailure(error);
    }
  }

  async syncQueueWithDatabase(): Promise<QueueSyncResult> {
    try {
      const pendingJobs = await this.dependencies.persistence.getPendingJobs();
      const existingJobIds = new Set(this.state.jobQueue.map((job) => job.id));
      const activeJobIds = new Set(this.state.activeJobs.keys());
      let addedCount = 0;

      for (const persistedJob of pendingJobs) {
        if (existingJobIds.has(persistedJob.id) || activeJobIds.has(persistedJob.id)) {
          continue;
        }

        const job = mapPersistedJob(persistedJob, this.dependencies.clock.now);
        insertJobByPriority(this.state.jobQueue, job);
        addedCount++;
      }

      if (addedCount > 0) {
        this.dependencies.logger.log(
          `[Orchestrator] Synced ${addedCount} new jobs from database to in-memory queue`,
        );
      }

      this.recordSyncSuccess();
      return { ok: true, addedCount };
    } catch (error) {
      return this.recordSyncFailure(error);
    }
  }

  private recordSyncSuccess(): void {
    const now = this.dependencies.clock.nowMs();
    const failedAttempts = this.state.consecutiveSyncFailures;
    const pool = this.dependencies.getDatabasePoolMetrics();
    if (this.state.consecutiveSyncFailures > 0) {
      this.dependencies.logger.log('[Orchestrator] Database queue sync recovered', {
        failedAttempts,
        unavailableMs: this.state.queueSyncUnavailableSince === null
          ? 0
          : Math.max(0, now - this.state.queueSyncUnavailableSince),
        pool,
      });
    } else if (!this.state.queueSyncReadyLogged) {
      this.dependencies.logger.log('[Orchestrator] Database queue sync ready', { pool });
    }
    this.state.queueSyncReadyLogged = true;
    this.state.lastQueueSyncAt = now;
    this.state.lastQueueSyncErrorCode = null;
    this.state.consecutiveSyncFailures = 0;
    this.state.queueSyncUnavailableSince = null;
    this.state.nextQueueSyncAt = now + SYNC_INTERVAL_MS;
  }

  private recordSyncFailure(error: unknown): Extract<QueueSyncResult, { ok: false }> {
    const now = this.dependencies.clock.nowMs();
    const failure = classifyDatabaseFailure(error, 'query');
    this.state.consecutiveSyncFailures += 1;
    this.state.lastQueueSyncErrorCode = failure.code;
    this.state.queueSyncUnavailableSince ??= now;

    const nominalDelay = failure.retryable
      ? Math.min(
        MAX_SYNC_RETRY_DELAY_MS,
        SYNC_INTERVAL_MS * 2 ** (this.state.consecutiveSyncFailures - 1),
      )
      : MAX_SYNC_RETRY_DELAY_MS;
    const random = Math.min(1, Math.max(0, this.dependencies.random()));
    const jitter = 1 - SYNC_RETRY_JITTER_RATIO + random * SYNC_RETRY_JITTER_RATIO * 2;
    const retryInMs = failure.retryable
      ? Math.min(MAX_SYNC_RETRY_DELAY_MS, Math.round(nominalDelay * jitter))
      : MAX_SYNC_RETRY_DELAY_MS;
    this.state.nextQueueSyncAt = now + retryInMs;

    this.dependencies.logger.error('[Orchestrator] Database queue sync unavailable', {
      code: failure.code,
      retryable: failure.retryable,
      failedAttempts: this.state.consecutiveSyncFailures,
      retryInMs,
      pool: this.dependencies.getDatabasePoolMetrics(),
    });

    return { ok: false, ...failure, retryInMs };
  }

  async getFailedJobs(limit = 50): Promise<AgentJob[]> {
    const jobs = await this.dependencies.persistence.getFailedJobs(limit);
    return jobs.map((job) => mapPersistedJob(job, this.dependencies.clock.now));
  }

  registerAgent(agent: BaseAgent): void {
    if (this.state.agents.has(agent.agentType)) {
      throw new Error(`[Orchestrator] Agent already registered: ${agent.agentType}`);
    }
    this.state.agents.set(agent.agentType, agent);
    this.dependencies.logger.log(
      `[Orchestrator] Registered agent: ${agent.name} `
        + `(enabled=${agent.enabled}, concurrency=${agent.concurrency})`,
    );
  }

  getAgent(agentType: AgentType): BaseAgent | undefined {
    return this.state.agents.get(agentType);
  }

  async enqueueJob(
    agentType: AgentType,
    payload: Record<string, unknown>,
    options?: {
      priority?: JobPriority;
      parentJobId?: string;
      maxRetries?: number;
    },
  ): Promise<AgentJob> {
    const agent = this.state.agents.get(agentType);
    if (!agent) throw new Error(`Agent ${agentType} is not registered`);
    if (!agent.enabled) throw new Error(`Agent ${agentType} is disabled`);

    const parsedPayload = this.dependencies.parsePayload(agentType, payload);
    if (!parsedPayload.success) {
      throw new Error(`Invalid payload for ${agentType}: ${parsedPayload.error}`);
    }

    const priority = options?.priority || 'normal';
    const maxRetries = options?.maxRetries ?? agent.retryPolicy.maxRetries;
    const persistedJob = await this.dependencies.persistence.createJob({
      agentType,
      status: 'pending',
      priority,
      payload: parsedPayload.data,
      retryCount: 0,
      maxRetries,
      parentJobId: options?.parentJobId,
    });

    const job: AgentJob = {
      id: persistedJob.id,
      agentType,
      status: 'pending',
      priority,
      payload: parsedPayload.data,
      retryCount: 0,
      maxRetries,
      createdAt: persistedJob.createdAt || this.dependencies.clock.now(),
      parentJobId: options?.parentJobId,
    };

    insertJobByPriority(this.state.jobQueue, job);
    await this.outcomes.addEvent(
      job.id,
      agentType,
      'start',
      `Job enqueued for ${agentType}`,
      { priority: job.priority },
    );
    return job;
  }

  async createImmediateJob(
    agentType: AgentType,
    payload: Record<string, unknown>,
    options?: {
      priority?: JobPriority;
      parentJobId?: string;
      maxRetries?: number;
    },
  ): Promise<AgentJob & { startedAt: Date }> {
    const agent = this.state.agents.get(agentType);
    if (!agent) throw new Error(`Agent ${agentType} is not registered`);
    if (!agent.enabled) throw new Error(`Agent ${agentType} is disabled`);

    const parsedPayload = this.dependencies.parsePayload(agentType, payload);
    if (!parsedPayload.success) {
      throw new Error(`Invalid payload for ${agentType}: ${parsedPayload.error}`);
    }

    const priority = options?.priority || 'high';
    const maxRetries = options?.maxRetries ?? agent.retryPolicy.maxRetries;
    const startedAt = this.dependencies.clock.now();
    const persistedJob = await this.dependencies.persistence.createJob({
      agentType,
      status: 'in_progress',
      priority,
      payload: parsedPayload.data,
      retryCount: 0,
      maxRetries,
      parentJobId: options?.parentJobId,
      startedAt,
    });

    const job: AgentJob & { startedAt: Date } = {
      id: persistedJob.id,
      agentType,
      status: 'in_progress',
      priority,
      payload: parsedPayload.data,
      retryCount: 0,
      maxRetries,
      createdAt: persistedJob.createdAt || startedAt,
      startedAt,
      parentJobId: options?.parentJobId,
    };

    await this.outcomes.addEvent(
      job.id,
      agentType,
      'start',
      `Job enqueued for ${agentType}`,
      { priority: job.priority },
    );
    return job;
  }

  takeNextRunnableJob(): AgentJob | undefined {
    const index = this.state.jobQueue.findIndex((queuedJob) => {
      const agent = this.state.agents.get(queuedJob.agentType);
      if (!agent || !agent.enabled) return true;
      return countActiveJobsForAgent(this.state.activeJobs, queuedJob.agentType) < agent.concurrency;
    });

    if (index < 0) return undefined;
    return this.state.jobQueue.splice(index, 1)[0];
  }
}
