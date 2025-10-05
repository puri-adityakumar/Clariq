"use client";
import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import remarkGfm from "remark-gfm";
import ReactMarkdown, { Components } from "react-markdown";
import { Clipboard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/research/StatusBadge";
import { useResearchJob } from "@/lib/appwrite/useResearch";
import { useAuth } from "@/appwrite/AuthProvider";
import { ReportViewerSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/useToast";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ResearchReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Restore handleCopy and handleDownload
  const handleCopy = async () => {
    if (!job?.results) {
      toast.error("No content to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(job.results);
      toast.success("Report copied to clipboard");
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!job?.results) {
      toast.error("No content to download");
      return;
    }
    try {
      const blob = new Blob([job.results], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${job.target.replace(/\s+/g, '-').toLowerCase()}-report.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded successfully");
    } catch (err) {
      console.error('Failed to download:', err);
      toast.error("Failed to download");
    }
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

      {loading && <ReportViewerSkeleton />}
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

          {job.status === 'pending' && (
            <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-6 text-center">
              <div className="inline-flex items-center gap-2 text-blue-300">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent"></div>
                <span className="font-medium">Research job queued</span>
              </div>
              <p className="mt-2 text-sm text-blue-300/80">Your research will start processing shortly. This usually takes 10-15 minutes.</p>
            </div>
          )}

          {job.status === 'processing' && (
            <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-6 text-center">
              <div className="inline-flex items-center gap-2 text-blue-300">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent"></div>
                <span className="font-medium">Research in progress</span>
              </div>
              <p className="mt-2 text-sm text-blue-300/80">Our AI agents are analyzing sources and gathering insights. Please check back in a few minutes.</p>
            </div>
          )}

          {job.status === 'completed' && job.results && (
            <div className="glass rounded-xl border border-white/10 p-6">
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy to clipboard">
                  <Clipboard className="h-4 w-4 text-white/80 hover:text-white" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download Markdown">
                  <Download className="h-4 w-4 text-white/80 hover:text-white" />
                </Button>
              </div>
              <div className="prose prose-invert prose-xl max-w-none text-white/90 prose-headings:font-heading prose-headings:tracking-tight prose-headings:text-white prose-a:text-blue-400 prose-a:hover:text-blue-300 prose-blockquote:border-l-4 prose-blockquote:border-blue-500/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white/80 prose-pre:bg-neutral-900/50 prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none prose-li:marker:text-white/60">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const content = String(children).trim();
                      const isMultiline = content.includes('\n');
                      if (isMultiline) {
                        const match = /language-(\w+)/.exec(className || '');
                        return (
                          <SyntaxHighlighter language={match ? match[1] : 'text'} style={oneDark} className="rounded-lg overflow-x-auto text-sm">
                            {content}
                          </SyntaxHighlighter>
                        );
                      }
                      return <code className={cn("rounded bg-white/10 px-1.5 py-0.5 text-sm", className)} {...props}>{children}</code>;
                    }
                  } as Components}
                >
                  {job.results}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {job.status === 'completed' && !job.results && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
              <p className="font-medium">Report completed but no content available</p>
              <p className="mt-1 text-yellow-300/80">The research job completed successfully, but no report content was generated.</p>
            </div>
          )}

          {/* Actions moved to the editor header when completed */}

          {(job.status === 'pending' || job.status === 'processing') && (
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={() => router.push('/dashboard/research')}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Status
              </Button>
            </div>
          )}

          <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
            <p>Research ID: {job.$id}</p>
          </footer>
        </div>
      )}
    </main>
  );
}
