import { ID, Models, Query } from 'appwrite';
import { databases, DATABASE_ID, RESEARCH_COLLECTION_ID } from '@/appwrite/config';

// Type definitions for Research Job
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

/**
 * Create a new research job with status="pending"
 */
export async function createResearchJob(data: CreateResearchRequest): Promise<ResearchJob> {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      ID.unique(),
      {
        user_id: data.userId,
        target: data.target,
        enabled_agents: data.enabledAgents,
        person_name: data.personName || null,
        person_linkedin: data.personLinkedin || null,
        additional_context: data.additionalContext || null,
        status: 'pending',
        total_sources: 0,
        created_at: new Date().toISOString(),
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
    throw new Error('Failed to create research job');
  }
}

/**
 * Get all research jobs for a specific user
 */
export async function getResearchJobs(userId: string): Promise<ResearchJob[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(100), // Reasonable limit for user's jobs
      ]
    );

    return response.documents as ResearchJob[];
  } catch (error) {
    console.error('Error fetching research jobs:', error);
    throw new Error('Failed to fetch research jobs');
  }
}

/**
 * Get a single research job by ID
 */
export async function getResearchJob(jobId: string): Promise<ResearchJob> {
  try {
    const document = await databases.getDocument(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      jobId
    );

    return document as ResearchJob;
  } catch (error) {
    console.error('Error fetching research job:', error);
    throw new Error('Failed to fetch research job');
  }
}

/**
 * Update a research job (typically used by backend)
 */
export async function updateResearchJob(
  jobId: string, 
  data: UpdateResearchRequest
): Promise<ResearchJob> {
  try {
    const updateData: Record<string, string | number> = {};

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
    throw new Error('Failed to update research job');
  }
}

/**
 * Delete a research job
 */
export async function deleteResearchJob(jobId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      jobId
    );
  } catch (error) {
    console.error('Error deleting research job:', error);
    throw new Error('Failed to delete research job');
  }
}

/**
 * Get research jobs with specific status for a user
 */
export async function getResearchJobsByStatus(
  userId: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<ResearchJob[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.equal('status', status),
        Query.orderDesc('created_at'),
        Query.limit(50),
      ]
    );

    return response.documents as ResearchJob[];
  } catch (error) {
    console.error('Error fetching research jobs by status:', error);
    throw new Error('Failed to fetch research jobs by status');
  }
}

/**
 * Get research jobs count for a user by status
 */
export async function getResearchJobsCount(userId: string): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  try {
    // Get all jobs for the user
    const allJobs = await databases.listDocuments(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.limit(1000), // High limit to get accurate counts
      ]
    );

    const jobs = allJobs.documents as ResearchJob[];
    
    return {
      total: jobs.length,
      pending: jobs.filter(job => job.status === 'pending').length,
      processing: jobs.filter(job => job.status === 'processing').length,
      completed: jobs.filter(job => job.status === 'completed').length,
      failed: jobs.filter(job => job.status === 'failed').length,
    };
  } catch (error) {
    console.error('Error getting research jobs count:', error);
    throw new Error('Failed to get research jobs count');
  }
}

/**
 * Check if user owns a research job (for security)
 */
export async function isJobOwner(jobId: string, userId: string): Promise<boolean> {
  try {
    const job = await getResearchJob(jobId);
    return job.user_id === userId;
  } catch {
    // If we can't fetch the job, assume no access
    return false;
  }
}

/**
 * Retry a failed research job by resetting its status to pending
 */
export async function retryResearchJob(jobId: string): Promise<ResearchJob> {
  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      RESEARCH_COLLECTION_ID,
      jobId,
      {
        status: 'pending',
        error_message: null,
        results: null,
        completed_at: null,
        total_sources: 0,
      }
    );

    return document as ResearchJob;
  } catch (error) {
    console.error('Error retrying research job:', error);
    throw new Error('Failed to retry research job');
  }
}