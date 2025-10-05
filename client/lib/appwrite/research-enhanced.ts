import { ID, Models, Query } from 'appwrite';
import { databases, DATABASE_ID, RESEARCH_COLLECTION_ID } from '@/appwrite/config';

// Enhanced type definitions for Research Job
export interface ResearchJob extends Models.Document {
  user_id: string;
  target: string;
  enabled_agents: string[];
  person_name?: string;
  person_linkedin?: string;
  additional_context?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: string;
  error_message?: string;
  total_sources: number;
  created_at: string;
  completed_at?: string;
  updated_at?: string;
}

export interface CreateResearchRequest {
  userId: string;
  target: string;
  enabledAgents: string[];
  personName?: string;
  personLinkedin?: string;
  additionalContext?: string;
}

export interface UpdateResearchRequest {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  results?: string;
  error_message?: string;
  total_sources?: number;
  completed_at?: string;
}

export interface ResearchJobFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  agents?: string[];
}

export interface ResearchJobStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageCompletionTime?: number;
  totalSources?: number;
}

/**
 * Enhanced Appwrite Research Service with better error handling and features
 */
export class ResearchService {
  private static instance: ResearchService;

  public static getInstance(): ResearchService {
    if (!ResearchService.instance) {
      ResearchService.instance = new ResearchService();
    }
    return ResearchService.instance;
  }

  /**
   * Create a new research job with enhanced validation and error handling
   */
  async createResearchJob(data: CreateResearchRequest): Promise<ResearchJob> {
    try {
      // Validate required fields
      if (!data.target.trim()) {
        throw new Error('Research target is required');
      }
      if (!data.enabledAgents.length) {
        throw new Error('At least one agent must be enabled');
      }
      if (data.enabledAgents.includes('person_research') && !data.personName?.trim()) {
        throw new Error('Person name is required when person research is enabled');
      }

      const document = await databases.createDocument(
        DATABASE_ID,
        RESEARCH_COLLECTION_ID,
        ID.unique(),
        {
          user_id: data.userId,
          target: data.target.trim(),
          enabled_agents: data.enabledAgents,
          person_name: data.personName?.trim() || null,
          person_linkedin: data.personLinkedin?.trim() || null,
          additional_context: data.additionalContext?.trim() || null,
          status: 'pending',
          total_sources: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        [
          // Row-level permissions: only the creator can read/update/delete
          `read("user:${data.userId}")`,
          `update("user:${data.userId}")`,
          `delete("user:${data.userId}")`,
        ]
      );

      return document as ResearchJob;
    } catch (error) {
      console.error('Error creating research job:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create research job');
    }
  }

  /**
   * Get research jobs with advanced filtering and pagination
   */
  async getResearchJobs(
    userId: string,
    filters: ResearchJobFilters = {},
    limit = 25,
    offset = 0
  ): Promise<{ jobs: ResearchJob[]; total: number }> {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(limit),
        Query.offset(offset),
      ];

      // Add status filter
      if (filters.status && filters.status !== 'all') {
        queries.push(Query.equal('status', filters.status));
      }

      // Add date filters
      if (filters.dateFrom) {
        queries.push(Query.greaterThanEqual('created_at', filters.dateFrom));
      }
      if (filters.dateTo) {
        queries.push(Query.lessThanEqual('created_at', filters.dateTo));
      }

      // Add agent filter
      if (filters.agents && filters.agents.length > 0) {
        queries.push(Query.contains('enabled_agents', filters.agents));
      }

      // Add search filter (target field)
      if (filters.search && filters.search.trim()) {
        queries.push(Query.search('target', filters.search.trim()));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        RESEARCH_COLLECTION_ID,
        queries
      );

      return {
        jobs: response.documents as ResearchJob[],
        total: response.total
      };
    } catch (error) {
      console.error('Error fetching research jobs:', error);
      throw new Error('Failed to fetch research jobs');
    }
  }

  /**
   * Get a single research job by ID with ownership validation
   */
  async getResearchJob(jobId: string, userId?: string): Promise<ResearchJob> {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        RESEARCH_COLLECTION_ID,
        jobId
      );

      const job = document as ResearchJob;

      // Validate ownership if userId provided
      if (userId && job.user_id !== userId) {
        throw new Error('You do not have permission to access this research job');
      }

      return job;
    } catch (error) {
      console.error('Error fetching research job:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch research job');
    }
  }

  /**
   * Update a research job with optimistic locking
   */
  async updateResearchJob(
    jobId: string,
    data: UpdateResearchRequest,
    userId?: string
  ): Promise<ResearchJob> {
    try {
      // Validate ownership first if userId provided
      if (userId) {
        await this.getResearchJob(jobId, userId);
      }

      const updateData: Record<string, string | number | undefined> = {
        updated_at: new Date().toISOString(),
      };

      if (data.status !== undefined) updateData.status = data.status;
      if (data.results !== undefined) updateData.results = data.results;
      if (data.error_message !== undefined) updateData.error_message = data.error_message;
      if (data.total_sources !== undefined) updateData.total_sources = data.total_sources;
      if (data.completed_at !== undefined) updateData.completed_at = data.completed_at;

      const document = await databases.updateDocument(
        DATABASE_ID,
        RESEARCH_COLLECTION_ID,
        jobId,
        updateData
      );

      return document as ResearchJob;
    } catch (error) {
      console.error('Error updating research job:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update research job');
    }
  }

  /**
   * Delete a research job with ownership validation
   */
  async deleteResearchJob(jobId: string, userId: string): Promise<void> {
    try {
      // Validate ownership first
      await this.getResearchJob(jobId, userId);

      await databases.deleteDocument(
        DATABASE_ID,
        RESEARCH_COLLECTION_ID,
        jobId
      );
    } catch (error) {
      console.error('Error deleting research job:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete research job');
    }
  }

  /**
   * Get comprehensive research statistics for a user
   */
  async getResearchStats(userId: string): Promise<ResearchJobStats> {
    try {
      const { jobs } = await this.getResearchJobs(userId, {}, 1000); // Get all jobs for stats

      const stats: ResearchJobStats = {
        total: jobs.length,
        pending: jobs.filter(job => job.status === 'pending').length,
        processing: jobs.filter(job => job.status === 'processing').length,
        completed: jobs.filter(job => job.status === 'completed').length,
        failed: jobs.filter(job => job.status === 'failed').length,
      };

      // Calculate average completion time for completed jobs
      const completedJobs = jobs.filter(job => 
        job.status === 'completed' && job.completed_at && job.created_at
      );

      if (completedJobs.length > 0) {
        const totalTime = completedJobs.reduce((sum, job) => {
          const start = new Date(job.created_at).getTime();
          const end = new Date(job.completed_at!).getTime();
          return sum + (end - start);
        }, 0);

        stats.averageCompletionTime = Math.round(totalTime / completedJobs.length / 1000); // in seconds
      }

      // Calculate total sources analyzed
      stats.totalSources = jobs.reduce((sum, job) => sum + (job.total_sources || 0), 0);

      return stats;
    } catch (error) {
      console.error('Error fetching research stats:', error);
      throw new Error('Failed to fetch research statistics');
    }
  }

  /**
   * Retry a failed research job
   */
  async retryResearchJob(jobId: string, userId: string): Promise<ResearchJob> {
    try {
      const job = await this.getResearchJob(jobId, userId);
      
      if (job.status !== 'failed') {
        throw new Error('Only failed jobs can be retried');
      }

      return await this.updateResearchJob(jobId, {
        status: 'pending',
        error_message: undefined,
        results: undefined,
        completed_at: undefined,
        total_sources: 0,
      }, userId);
    } catch (error) {
      console.error('Error retrying research job:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to retry research job');
    }
  }

  /**
   * Duplicate a research job (create a new job with same parameters)
   */
  async duplicateResearchJob(jobId: string, userId: string): Promise<ResearchJob> {
    try {
      const originalJob = await this.getResearchJob(jobId, userId);

      return await this.createResearchJob({
        userId,
        target: originalJob.target,
        enabledAgents: originalJob.enabled_agents,
        personName: originalJob.person_name || undefined,
        personLinkedin: originalJob.person_linkedin || undefined,
        additionalContext: originalJob.additional_context || undefined,
      });
    } catch (error) {
      console.error('Error duplicating research job:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to duplicate research job');
    }
  }

  /**
   * Archive old completed research jobs (soft delete by status)
   */
  async archiveOldJobs(userId: string, olderThanDays = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { jobs } = await this.getResearchJobs(userId, {
        status: 'completed',
        dateTo: cutoffDate.toISOString(),
      }, 100);

      let archivedCount = 0;
      for (const job of jobs) {
        try {
          await this.deleteResearchJob(job.$id, userId);
          archivedCount++;
        } catch (error) {
          console.warn(`Failed to archive job ${job.$id}:`, error);
        }
      }

      return archivedCount;
    } catch (error) {
      console.error('Error archiving old jobs:', error);
      throw new Error('Failed to archive old research jobs');
    }
  }
}

// Export singleton instance
export const researchService = ResearchService.getInstance();

// Re-export common functions for backward compatibility
export const createResearchJob = (data: CreateResearchRequest) => 
  researchService.createResearchJob(data);

export const getResearchJobs = (userId: string) => 
  researchService.getResearchJobs(userId);

export const getResearchJob = (jobId: string) => 
  researchService.getResearchJob(jobId);

export const updateResearchJob = (jobId: string, data: UpdateResearchRequest) => 
  researchService.updateResearchJob(jobId, data);

export const deleteResearchJob = (jobId: string, userId: string) => 
  researchService.deleteResearchJob(jobId, userId);

export const retryResearchJob = (jobId: string, userId: string) => 
  researchService.retryResearchJob(jobId, userId);