"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceSessionCardProps {
  session: {
    id: string;
    sessionName: string;
    researchTarget: string;
    status: 'pending' | 'ready' | 'active' | 'completed' | 'failed';
    duration?: number;
    createdAt: string;
    completedAt?: string;
  };
  onViewTranscript?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

const DownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const VoiceSessionCard: React.FC<VoiceSessionCardProps> = ({
  session,
  onViewTranscript,
  onDelete,
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Creating...' },
      ready: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Ready' },
      active: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Active' },
      completed: { color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Completed' },
      failed: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
    };

    const { color, bg, label } = config[status as keyof typeof config] || config.pending;

    return (
      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", bg, color)}>
        <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))} />
        {label}
      </div>
    );
  };

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-semibold text-white truncate">
            {session.sessionName}
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Research Target: {session.researchTarget}
          </p>
          <p className="text-xs text-white/40 mt-1">
            Created: {new Date(session.createdAt).toLocaleDateString()} at{' '}
            {new Date(session.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(session.status)}
          {session.duration && (
            <div className="text-xs text-white/60">
              Duration: {formatDuration(session.duration)}
            </div>
          )}
        </div>
      </div>

      {/* Join Voice Session */}
      {(session.status === 'ready' || session.status === 'active') && (
        <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-green-400">Voice Agent Ready</span>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Your AI voice agent is ready for conversation. Click below to start talking.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.href = `/dashboard/voice/${session.id}`}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Join Voice Session
            </Button>
          </div>
        </div>
      )}

      {/* Status-specific content */}
      {session.status === 'pending' && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-400">Creating Agent</span>
          </div>
          <p className="text-xs text-white/60">
            Setting up your voice agent with research context. This usually takes 30-60 seconds.
          </p>
        </div>
      )}

      {session.status === 'failed' && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-sm font-medium text-red-400">Creation Failed</span>
          </div>
          <p className="text-xs text-white/60">
            Failed to create voice agent. Please try creating a new one.
          </p>
        </div>
      )}

      {session.status === 'completed' && (
        <div className="mb-4 p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-400">Session Completed</span>
          </div>
          <p className="text-xs text-white/60">
            Conversation finished. Transcript is available for download.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        {session.status === 'completed' && onViewTranscript && (
          <Button
            onClick={() => onViewTranscript(session.id)}
            variant="secondary"
            size="sm"
          >
            <DownloadIcon />
            View Transcript
          </Button>
        )}
        
        {onDelete && (
          <Button
            onClick={() => onDelete(session.id)}
            variant="ghost"
            size="sm"
            className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceSessionCard;