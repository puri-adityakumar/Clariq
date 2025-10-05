import { useState, useEffect, useCallback } from 'react';
import { 
  ResearchJob, 
  CreateResearchRequest,
  createResearchJob,
  getResearchJobs,
  getResearchJob,
  deleteResearchJob
} from './research';

export interface UseResearchJobsResult {
  jobs: ResearchJob[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createJob: (data: CreateResearchRequest) => Promise<ResearchJob>;
  deleteJob: (jobId: string) => Promise<void>;
  filterByStatus: (status?: string) => ResearchJob[];
}

/**
 * Hook for managing research jobs
 */
export function useResearchJobs(userId: string | null): UseResearchJobsResult {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedJobs = await getResearchJobs(userId);
      setJobs(fetchedJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching research jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createJob = useCallback(async (data: CreateResearchRequest): Promise<ResearchJob> => {
    try {
      setError(null);
      const newJob = await createResearchJob(data);
      setJobs(prevJobs => [newJob, ...prevJobs]);
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    try {
      setError(null);
      await deleteResearchJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job.$id !== jobId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const filterByStatus = useCallback((status?: string): ResearchJob[] => {
    if (!status || status === 'all') {
      return jobs;
    }
    return jobs.filter(job => job.status === status);
  }, [jobs]);

  // Fetch jobs when userId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    jobs,
    loading,
    error,
    refresh,
    createJob,
    deleteJob,
    filterByStatus,
  };
}

export interface UseResearchJobResult {
  job: ResearchJob | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing a single research job
 */
export function useResearchJob(jobId: string | null): UseResearchJobResult {
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedJob = await getResearchJob(jobId);
      setJob(fetchedJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
      console.error('Error fetching research job:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Fetch job when jobId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    job,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for auto-refreshing research jobs (useful for status updates)
 */
export function useAutoRefreshJobs(
  userId: string | null, 
  intervalMs: number = 30000
): UseResearchJobsResult {
  const result = useResearchJobs(userId);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      // Only refresh if there are pending or processing jobs
      const hasActiveJobs = result.jobs.some(job => 
        job.status === 'pending' || job.status === 'processing'
      );

      if (hasActiveJobs) {
        result.refresh();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [userId, intervalMs, result]);

  return result;
}