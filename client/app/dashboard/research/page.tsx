"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResearchModal } from "../../../components/research/ResearchModal";
import { Button } from "../../../components/ui/button";
import StatusBadge, { ResearchStatus } from "../../../components/research/StatusBadge";
import { useAuth } from "../../../appwrite/AuthProvider";
import { cn } from "../../../lib/utils";

interface MockResearchJob {
  id: string;
  target: string;
  status: ResearchStatus;
  created_at: string;
  agents: string[];
}

// Placeholder until Appwrite integration (Phase 3)
const mockData: MockResearchJob[] = [];

const statusOrder: Record<ResearchStatus, number> = {
  pending: 1,
  processing: 2,
  failed: 3,
  completed: 4,
};

export default function ResearchDashboardPage() {
  // Auth context reserved for future permission checks (user-specific queries in Phase 3)
  useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<MockResearchJob[]>(mockData);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("newest");

  // Simulate polling placeholder (Phase 3 will replace)
  useEffect(() => {
    const interval = setInterval(() => {
      // no-op until real fetch
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = jobs.filter(j => {
    if (filter === "all") return true;
    if (filter === "completed") return j.status === "completed";
    if (filter === "processing") return j.status === "processing" || j.status === "pending";
    return true;
  }).sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "status") return statusOrder[a.status] - statusOrder[b.status];
    return 0;
  });

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
                <tr key={job.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white/90">{job.target}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3 text-white/60 text-xs">{new Date(job.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/60 text-[11px]">{job.agents.map(a => a.replace(/_/g,' ')).join(', ')}</td>
                  <td className="px-4 py-3">
                    {job.status === "completed" ? (
                      <Button size="sm" variant="secondary" onClick={() => router.push(`/dashboard/research/${job.id}`)}>View Report</Button>
                    ) : job.status === "failed" ? (
                      <Button size="sm" variant="secondary">Retry</Button>
                    ) : (
                      <span className="text-xs text-white/40">Processing…</span>
                    )}
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
        onSubmit={async (payload) => {
          // For now push mock row; Phase 3 will call Appwrite
          const now = new Date().toISOString();
          const newJob: MockResearchJob = {
            id: Math.random().toString(36).slice(2),
            target: payload.target,
            status: "pending",
            created_at: now,
            agents: payload.enabledAgents
          };
          setJobs(j => [newJob, ...j]);
        }}
      />
    </main>
  );
}
