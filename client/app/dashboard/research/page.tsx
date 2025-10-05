"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ResearchModal } from "@/components/research/ResearchModal";
import { Button } from "@/components/ui/button";
import StatusBadge, { ResearchStatus } from "@/components/research/StatusBadge";
import { useAuth } from "@/appwrite/AuthProvider";
import { useAutoRefreshJobs } from "@/lib/appwrite/useResearch-enhanced";
import { ResearchDashboardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/useToast";
import { cn } from "@/lib/utils";

// Enhanced icons for better UI consistency
const FilterIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const SortIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Removed StatsIcon and "Show Stats" toggle per request

const statusOrder: Record<ResearchStatus, number> = {
  pending: 1,
  processing: 2,
  failed: 3,
  completed: 4,
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Jobs', color: 'text-white/70' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { value: 'processing', label: 'Processing', color: 'text-blue-400' },
  { value: 'completed', label: 'Completed', color: 'text-green-400' },
  { value: 'failed', label: 'Failed', color: 'text-red-400' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
  { value: 'target', label: 'By Target' },
];

export default function ResearchDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Modal and UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  // Removed showStats toggle
  
  // Job operation states
  const [operatingJobs, setOperatingJobs] = useState<Set<string>>(new Set());

  // Enhanced research jobs hook with auto-refresh
  const {
    jobs,
    loading,
    error,
    stats,
    refresh,
    deleteJob,
    retryJob,
    duplicateJob,
  } = useAutoRefreshJobs(user?.$id || null, 30000);

  // Apply local filtering and sorting
  const filteredAndSortedJobs = React.useMemo(() => {
    let filtered = jobs;

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(job => job.status === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.target.toLowerCase().includes(query) ||
        job.enabled_agents.some(agent => agent.toLowerCase().includes(query)) ||
        (job.person_name && job.person_name.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'status':
          return statusOrder[a.status as ResearchStatus] - statusOrder[b.status as ResearchStatus];
        case 'target':
          return a.target.localeCompare(b.target);
        default:
          return 0;
      }
    });

    return sorted;
  }, [jobs, selectedFilter, searchQuery, selectedSort]);

  // Job operation handlers
  const handleJobOperation = async (
    jobId: string,
    operation: () => Promise<void>,
    successMessage: string,
    errorMessage: string
  ) => {
    setOperatingJobs(prev => new Set(prev).add(jobId));
    
    try {
      await operation();
      toast.success(successMessage);
    } catch (err) {
      console.error(`Error with job operation:`, err);
      toast.error(errorMessage);
    } finally {
      setOperatingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleRetry = (jobId: string) => 
    handleJobOperation(
      jobId,
      () => retryJob(jobId),
      "Research job restarted successfully",
      "Failed to retry research job"
    );

  const handleDelete = (jobId: string, target: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the research job for "${target}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    
    handleJobOperation(
      jobId,
      () => deleteJob(jobId),
      "Research job deleted successfully",
      "Failed to delete research job"
    );
  };

  const handleDuplicate = (jobId: string) =>
    handleJobOperation(
      jobId,
      () => duplicateJob(jobId),
      "Research job duplicated successfully",
      "Failed to duplicate research job"
    );

  // Loading state
  if (loading && jobs.length === 0) {
    return (
      <main className="min-h-[70vh] container max-w-7xl py-12">
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">
                Market Research
              </h1>
              <p className="mt-1 text-sm text-white/60">
                Launch and monitor multi-agent market & people research jobs.
              </p>
            </div>
            <Button disabled size="lg" className="font-heading font-semibold tracking-tight">
              Start Market Research
            </Button>
          </div>
        </div>
        <ResearchDashboardSkeleton />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-[70vh] container max-w-7xl py-12">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="glass p-8 rounded-xl max-w-md">
            <div className="text-red-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Research Jobs</h3>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <Button onClick={refresh} variant="secondary" className="w-full">
              <RefreshIcon />
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] container max-w-7xl py-12">
      {/* Header with Stats */}
      <div className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">
              Market Research
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Launch and monitor multi-agent market & people research jobs.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={refresh}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="text-white/70 hover:text-white"
            >
              <RefreshIcon />
              Refresh
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              size="lg"
              className="font-heading font-semibold tracking-tight"
            >
              Start Market Research
            </Button>
          </div>
        </div>


        {/* Quick Stats Bar */}
        {stats && (
          <div className="glass p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/60">Total Jobs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{stats.completed}</div>
                <div className="text-xs text-white/60">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{stats.processing + stats.pending}</div>
                <div className="text-xs text-white/60">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{stats.failed}</div>
                <div className="text-xs text-white/60">Failed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalSources || 0}</div>
                <div className="text-xs text-white/60">Total Sources</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search and Filters */}
        <div className="glass p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by target, agent, or person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800/60 border border-white/10 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
              />
              <div className="absolute left-3 top-2.5 text-white/40">
                <SearchIcon />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon />
              <span className="text-xs text-white/50">Filter:</span>
              <div className="flex gap-1">
                {FILTER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full transition",
                      selectedFilter === option.value
                        ? "bg-white text-black font-medium"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortIcon />
              <span className="text-xs text-white/50">Sort:</span>
              <div className="flex gap-1">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSort(option.value)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full transition",
                      selectedSort === option.value
                        ? "bg-white text-black font-medium"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Jobs List */}
      {filteredAndSortedJobs.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="text-white/30 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-heading text-lg font-medium tracking-tight text-white mb-2">
            {jobs.length === 0 ? "No research yet" : "No jobs match your filters"}
          </h3>
          <p className="text-sm text-white/60 max-w-sm mx-auto mb-6">
            {jobs.length === 0 
              ? "Start your first research to generate a comprehensive market & company insight report."
              : "Try adjusting your search or filter criteria to find what you're looking for."
            }
          </p>
          {jobs.length === 0 ? (
            <Button onClick={() => setModalOpen(true)}>Start Market Research</Button>
          ) : (
            <Button onClick={() => { setSearchQuery(""); setSelectedFilter("all"); }} variant="secondary">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-white/60 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Target</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Agents</th>
                  <th className="px-6 py-4 font-medium">Sources</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedJobs.map((job, index) => (
                  <tr 
                    key={job.$id} 
                    className={cn(
                      "border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors",
                      index % 2 === 0 ? "bg-white/[0.02]" : ""
                    )}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white/90">{job.target}</div>
                        {job.person_name && (
                          <div className="text-xs text-white/50">Person: {job.person_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status as ResearchStatus} />
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      <div>{new Date(job.created_at).toLocaleDateString()}</div>
                      <div className="text-white/40">{new Date(job.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {job.enabled_agents.map(agent => (
                          <span 
                            key={agent}
                            className="px-2 py-1 bg-white/10 rounded text-xs"
                          >
                            {agent.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      {job.total_sources || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {job.status === "completed" ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => router.push(`/dashboard/research/${job.$id}`)}
                            >
                              View Report
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicate(job.$id)}
                              disabled={operatingJobs.has(job.$id)}
                              className="text-white/60 hover:text-white"
                            >
                              Duplicate
                            </Button>
                          </>
                        ) : job.status === "failed" ? (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => handleRetry(job.$id)}
                            disabled={operatingJobs.has(job.$id)}
                          >
                            {operatingJobs.has(job.$id) ? "Retrying..." : "Retry"}
                          </Button>
                        ) : (
                          <span className="text-xs text-white/40">Processing…</span>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(job.$id, job.target)}
                          disabled={operatingJobs.has(job.$id)}
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                        >
                          {operatingJobs.has(job.$id) ? "..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Research Modal */}
      <ResearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async () => {
          await refresh();
        }}
      />
    </main>
  );
}
