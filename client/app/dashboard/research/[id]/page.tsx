"use client";
import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../../../../components/ui/button";
import StatusBadge from "../../../../components/research/StatusBadge";
import { useResearchJob } from "../../../../lib/appwrite/useResearch";
import { useAuth } from "../../../../appwrite/AuthProvider";
import { cn } from "../../../../lib/utils";

export default function ResearchReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;
  
  // Use the research job hook to fetch and manage the job
  const { job, loading, error } = useResearchJob(id);

  const durationMinutes = useMemo(() => {
    if (!job?.completed_at) return null;
    const start = new Date(job.created_at).getTime();
    const end = new Date(job.completed_at).getTime();
    return Math.max(1, Math.round((end - start) / 60000));
  }, [job]);

  // Security check: Ensure user owns the job
  const canAccess = useMemo(() => {
    if (!user || !job) return false;
    return job.user_id === user.$id;
  }, [user, job]);

  const handleCopy = () => {
    if (!job?.results) return;
    navigator.clipboard.writeText(job.results).catch(() => {});
  };

  const handleDownload = () => {
    if (!job?.results) return;
    const blob = new Blob([job.results], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-${job.$id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-[70vh] container max-w-5xl py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/dashboard/research')} className="px-2 text-sm">← Back</Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-white">Research Report</h1>
        </div>
        {job && <StatusBadge status={job.status} />}
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
      {!loading && !error && job && !canAccess && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          You don&apos;t have permission to view this research report.
        </div>
      )}
      {!loading && !error && job && canAccess && (
        <div className="space-y-8">
          <header className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-white font-heading">{job.target}</h2>
            <p className="text-sm text-white/60">Generated at {new Date(job.completed_at || job.created_at).toLocaleString()} • {job.total_sources ?? 0} sources analyzed {durationMinutes && `• Duration ~${durationMinutes}m`}</p>
          </header>

          {job.status === 'failed' && (
            <div className="rounded-md border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
              <p className="font-medium">Research Failed</p>
              <p className="mt-1 text-red-300/80">{job.error_message || 'Unknown error'}</p>
            </div>
          )}

          {job.status !== 'failed' && (
            <div className="prose prose-invert max-w-none text-white prose-headings:font-heading prose-headings:tracking-tight prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white prose-code:text-white/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const content = String(children);
                    const isMultiline = /\n/.test(content);
                    const base = "rounded-lg border border-white/10 bg-neutral-900/80 p-4 text-xs overflow-x-auto";
                    if (isMultiline) {
                      return (
                        <pre className={cn(base, className)}>
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    }
                    return <code className={cn("rounded bg-white/10 px-1.5 py-0.5 text-[11px]", className)} {...props}>{children}</code>;
                  }
                } as Components}
              >
                {job.results || '*No results yet. Processing...*'}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={handleDownload} variant="secondary" disabled={!job.results}>Download Markdown</Button>
            <Button onClick={handleCopy} variant="secondary" disabled={!job.results}>Copy to Clipboard</Button>
            <Button variant="secondary" disabled>Export PDF (Soon)</Button>
          </div>

          <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
            <p>Research ID: {job.$id}</p>
          </footer>
        </div>
      )}
    </main>
  );
}
