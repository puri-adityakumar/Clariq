"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ResearchModal } from "../../../components/research/ResearchModal";
import { Button } from "../../../components/ui/button";
import StatusBadge, { ResearchStatus } from "../../../components/research/StatusBadge";
import { useAuth } from "../../../appwrite/AuthProvider";
import { useAutoRefreshJobs } from "../../../lib/appwrite/useResearch";
import { ResearchDashboardSkeleton } from "../../../components/ui/Skeleton";
import { retryResearchJob, deleteResearchJob } from "../../../lib/appwrite/research";
import { useToast } from "../../../lib/useToast";
import { IntegrationTestRunner } from "../../../components/testing/IntegrationTestRunner";
import { cn } from "../../../lib/utils";

const statusOrder: Record<ResearchStatus, number> = {
  pending: 1,
  processing: 2,
  failed: 3,
  completed: 4,
};

export default function ResearchDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("newest");
  const [retryingJobs, setRetryingJobs] = useState<Set<string>>(new Set());
  const [deletingJobs, setDeletingJobs] = useState<Set<string>>(new Set());

  // Use the auto-refresh hook to fetch and update research jobs
  const { jobs, loading, error, refresh } = useAutoRefreshJobs(user?.$id || null, 30000);

  const handleRetry = async (jobId: string) => {
    if (!user) return;
    
    setRetryingJobs(prev => new Set(prev).add(jobId));
    
    try {
      await retryResearchJob(jobId);
      toast.success("Research job restarted successfully");
      await refresh();
    } catch (err) {
      console.error("Error retrying job:", err);
      toast.error("Failed to retry research job");
    } finally {
      setRetryingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleDelete = async (jobId: string, target: string) => {
    if (!user) return;
    
    const confirmDelete = confirm(`Are you sure you want to delete the research job for "${target}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    setDeletingJobs(prev => new Set(prev).add(jobId));
    
    try {
      await deleteResearchJob(jobId);
      toast.success("Research job deleted successfully");
      await refresh();
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete research job");
    } finally {
      setDeletingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const filtered = jobs.filter(j => {
    if (filter === "all") return true;
    if (filter === "completed") return j.status === "completed";
    if (filter === "processing") return j.status === "processing" || j.status === "pending";
    return true;
  }).sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "status") return statusOrder[a.status as ResearchStatus] - statusOrder[b.status as ResearchStatus];
    return 0;
  });

  // Show loading state
  if (loading && jobs.length === 0) {
    return (
      <main className="min-h-[70vh] container max-w-6xl py-12">
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">Market Research</h1>
              <p className="mt-1 text-sm text-white/60">Launch and monitor multi-agent market & people research jobs.</p>
            </div>
            <Button disabled size="lg" className="font-heading font-semibold tracking-tight">Start Market Research</Button>
          </div>
        </div>
        <ResearchDashboardSkeleton />
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-[70vh] container max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-red-400">Error loading research jobs</p>
          <p className="text-white/60 text-sm mt-1">{error}</p>
          <Button onClick={refresh} className="mt-4" variant="secondary">
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] container max-w-6xl py-12">
      <div className="mb-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">Market Research</h1>
            <p className="mt-1 text-sm text-white/60">Launch and monitor multi-agent market & people research jobs.</p>
          </div>
          <Button onClick={() => setOpen(true)} size="lg" className="font-heading font-semibold tracking-tight">Start Market Research</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-white/50">Filter:</span>
            { ["all","completed","processing"] .map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1", filter === f ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20")}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            )) }
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/50">Sort:</span>
            { ["newest","oldest","status"].map(s => (
              <button key={s} onClick={() => setSort(s)} className={cn("rounded-full px-3 py-1", sort === s ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20")}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
            )) }
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 py-24 text-center">
          <h3 className="font-heading text-lg font-medium tracking-tight text-white">No research yet</h3>
          <p className="mt-2 max-w-sm text-sm text-white/60">Start your first research to generate a comprehensive market & company insight report.</p>
          <Button onClick={() => setOpen(true)} className="mt-6">Start Market Research</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-neutral-900/60">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Agents</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.$id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white/90">{job.target}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status as ResearchStatus} /></td>
                  <td className="px-4 py-3 text-white/60 text-xs">{new Date(job.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/60 text-[11px]">{job.enabled_agents.map((a: string) => a.replace(/_/g,' ')).join(', ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {job.status === "completed" ? (
                        <Button size="sm" variant="secondary" onClick={() => router.push(`/dashboard/research/${job.$id}`)}>View Report</Button>
                      ) : job.status === "failed" ? (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => handleRetry(job.$id)}
                          disabled={retryingJobs.has(job.$id)}
                        >
                          {retryingJobs.has(job.$id) ? "Retrying..." : "Retry"}
                        </Button>
                      ) : (
                        <span className="text-xs text-white/40">Processing…</span>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(job.$id, job.target)}
                        disabled={deletingJobs.has(job.$id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        {deletingJobs.has(job.$id) ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ResearchModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async () => {
          // The modal now handles Appwrite integration internally
          // Refresh the jobs list after successful submission
          await refresh();
        }}
      />

      {/* Integration Test Runner (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 border-t border-white/10 pt-8">
          <IntegrationTestRunner />
        </div>
      )}
    </main>
  );
}
