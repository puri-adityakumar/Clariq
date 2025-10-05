"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { VoiceSalesModal } from "../../../components/voice/VoiceSalesModal";
import type { VoiceSessionData } from "../../../components/voice/VoiceSalesModal";
import { VoiceSessionCard } from "../../../components/voice/VoiceSessionCard";
import { useAuth } from "../../../appwrite/AuthProvider";
import { useToast } from "../../../lib/useToast";
import { 
  createVoiceSession, 
  getVoiceSessions, 
  downloadTranscript,
  formatDuration,
  type VoiceSession 
} from "../../../lib/appwrite/voice";

// Mock voice session interface removed - using the real one from voice.ts

// No mock data - using real API calls

const VoiceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function VoiceDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const loadVoiceSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await getVoiceSessions();
      setSessions(response.sessions);
    } catch (error) {
      console.error('Error loading voice sessions:', error);
      toast.error('Failed to load voice sessions');
    } finally {
      setLoadingSessions(false);
    }
  }, [toast]);

  // Load voice sessions on component mount
  useEffect(() => {
    if (user) {
      loadVoiceSessions();
    }
  }, [user, loadVoiceSessions]);

  // Handle creating new voice session
  const handleCreateSession = async (data: VoiceSessionData) => {
    if (!user) {
      toast.error("Please sign in to create voice sessions");
      return;
    }

    setLoading(true);
    
    try {
      const response = await createVoiceSession(data.sessionName);
      
      // Refresh sessions list
      await loadVoiceSessions();
      
      toast.success('Voice session created successfully!');
      
      // Navigate to the new session
      router.push(`/dashboard/voice/${response.session_id}`);
      
    } catch (error) {
      console.error('Error creating voice session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create voice session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing transcript
  const handleViewTranscript = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      toast.error('Session not found');
      return;
    }
    
    try {
      await downloadTranscript(sessionId, session.session_name);
      toast.success('Transcript downloaded successfully');
    } catch (error) {
      console.error('Error downloading transcript:', error);
      toast.error('Failed to download transcript. It may not be available yet.');
    }
  };

  // Handle deleting session
  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the voice session "${sessionName}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        // TODO: Implement delete API call when backend supports it
        // await deleteVoiceSession(sessionId);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast.success("Voice session deleted successfully");
      } catch (error) {
        console.error('Error deleting session:', error);
        toast.error('Failed to delete session');
      }
    }
  };

  // Get status badge component
  // Moved to VoiceSessionCard component

  return (
    <main className="min-h-[70vh] container max-w-7xl py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">
              Voice Sales Agents
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Create AI voice agents using your research data for sales conversations.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={loadVoiceSessions}
              variant="ghost"
              size="sm"
              disabled={loadingSessions || loading}
              className="text-white/70 hover:text-white"
            >
              <RefreshIcon />
              Refresh
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              size="lg"
              className="font-heading font-semibold tracking-tight"
              disabled={loading}
            >
              <VoiceIcon className="h-4 w-4" />
              Create Voice Agent
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-white">{sessions.length}</div>
            <div className="text-xs text-white/60">Total Sessions</div>
          </div>
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-white/60">Completed</div>
          </div>
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-400">
              {sessions.filter(s => s.status === 'ready' || s.status === 'active').length}
            </div>
            <div className="text-xs text-white/60">Ready/Active</div>
          </div>
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-white">
              {sessions.reduce((total, s) => total + s.duration_seconds, 0) > 0 
                ? formatDuration(sessions.reduce((total, s) => total + s.duration_seconds, 0))
                : '00:00'
              }
            </div>
            <div className="text-xs text-white/60">Total Time</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {loadingSessions ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="text-white/60 mb-4">Loading voice sessions...</div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="text-white/30 mb-4">
            <div className="h-16 w-16 mx-auto">
              <VoiceIcon />
            </div>
          </div>
          <h3 className="font-heading text-lg font-medium tracking-tight text-white mb-2">
            No voice agents yet
          </h3>
          <p className="text-sm text-white/60 max-w-sm mx-auto mb-6">
            Create your first AI voice agent using your research data for sales conversations.
          </p>
          <Button onClick={() => setModalOpen(true)}>
            <VoiceIcon className="h-4 w-4" />
            Create Voice Agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <VoiceSessionCard
              key={session.id}
              session={{
                id: session.id,
                sessionName: session.session_name,
                researchTarget: 'AI Voice Agent', // Generic target since no research job
                status: session.status,
                duration: session.duration_seconds,
                createdAt: session.created_at,
                completedAt: session.completed_at,
              }}
              onViewTranscript={handleViewTranscript}
              onDelete={(sessionId) => handleDeleteSession(sessionId, session.session_name)}
            />
          ))}
        </div>
      )}

      {/* Voice Sales Modal */}
      <VoiceSalesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateSession}
      />
    </main>
  );
}