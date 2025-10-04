"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { VoiceSalesModal } from "../../../components/voice/VoiceSalesModal";
import type { VoiceSessionData } from "../../../components/voice/VoiceSalesModal";
import { VoiceSessionCard } from "../../../components/voice/VoiceSessionCard";
import { useAuth } from "../../../appwrite/AuthProvider";
import { useToast } from "../../../lib/useToast";

// Mock voice session interface (will be replaced with Appwrite integration)
interface VoiceSession {
  id: string;
  sessionName: string;
  researchTarget: string;
  status: 'pending' | 'ready' | 'active' | 'completed' | 'failed';
  voiceAgentUrl?: string;
  duration: number;
  createdAt: string;
  completedAt?: string;
  transcriptFileId?: string;
}

// Mock data for demonstration
const mockSessions: VoiceSession[] = [
  {
    id: "vs_001",
    sessionName: "Demo call with Acme Corp",
    researchTarget: "Acme Corporation",
    status: "completed",
    duration: 1845, // 30:45
    createdAt: "2024-10-04T10:30:00Z",
    completedAt: "2024-10-04T11:00:45Z",
    transcriptFileId: "transcript_001",
  },
  {
    id: "vs_002", 
    sessionName: "Sales presentation prep",
    researchTarget: "TechStart Inc",
    status: "ready",
    voiceAgentUrl: "https://backend.clariq.com/voice-agent/vs_002",
    duration: 920, // 15:20
    createdAt: "2024-10-03T14:15:00Z",
    transcriptFileId: "transcript_002",
  },
  {
    id: "vs_003",
    sessionName: "Follow-up discussion",
    researchTarget: "Global Solutions Ltd",
    status: "pending",
    duration: 0,
    createdAt: "2024-10-02T09:00:00Z",
  },
];

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
  const [sessions, setSessions] = useState<VoiceSession[]>(mockSessions);
  const [loading, setLoading] = useState(false);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle creating new voice session
  const handleCreateSession = async (data: VoiceSessionData) => {
    if (!user) {
      toast.error("Please sign in to create voice sessions");
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call to create voice session
      const newSession: VoiceSession = {
        id: `vs_${Date.now()}`,
        sessionName: data.sessionName,
        researchTarget: data.researchTarget,
        status: 'active',
        duration: 0,
        createdAt: new Date().toISOString(),
      };

      // Add to sessions list
      setSessions(prev => [newSession, ...prev]);
      
      // Navigate to voice interface
      router.push(`/dashboard/voice/${newSession.id}`);
      
    } catch (error) {
      console.error('Error creating voice session:', error);
      toast.error('Failed to create voice session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing transcript
  const handleViewTranscript = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      toast.success(`Opening transcript for "${session.sessionName}"`);
      // TODO: Implement transcript viewer or download
    }
  };

  // Handle deleting session
  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the voice session "${sessionName}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Voice session deleted successfully");
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
              onClick={() => setSessions([...mockSessions])}
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
              {sessions.reduce((total, s) => total + s.duration, 0) > 0 
                ? formatDuration(sessions.reduce((total, s) => total + s.duration, 0))
                : '00:00'
              }
            </div>
            <div className="text-xs text-white/60">Total Time</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
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
              session={session}
              onViewTranscript={handleViewTranscript}
              onDelete={(sessionId) => handleDeleteSession(sessionId, session.sessionName)}
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