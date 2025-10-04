"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { VoiceInterface } from "../../../../components/voice/VoiceInterface";
import { Button } from "../../../../components/ui/button";
import { useAuth } from "../../../../appwrite/AuthProvider";
import { useToast } from "../../../../lib/useToast";

// Mock session interface (will be replaced with Appwrite integration)
interface VoiceSession {
  id: string;
  sessionName: string;
  researchTarget: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  duration: number;
  createdAt: string;
  completedAt?: string;
  transcriptFileId?: string;
  livekitWsUrl?: string;
}

const BackIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function VoiceSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  useEffect(() => {
    if (!sessionId || !user) return;

    // Mock session loading (will be replaced with Appwrite query)
    const loadSession = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock session data
        const mockSession: VoiceSession = {
          id: sessionId as string,
          sessionName: "Demo call with Acme Corp",
          researchTarget: "Acme Corporation", 
          status: "active",
          duration: 0,
          createdAt: new Date().toISOString(),
          livekitWsUrl: "wss://mock-livekit-instance.com",
        };

        setSession(mockSession);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load voice session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, user]);

  // Handle ending session
  const handleEndSession = async () => {
    if (!session) return;

    try {
      // TODO: Call API to end session and save transcript
      console.log('Ending session:', session.id);
      
      // Update session status
      setSession(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : null);
      
      toast.success('Voice session ended successfully');
      
      // Navigate back to voice dashboard
      setTimeout(() => {
        router.push('/dashboard/voice');
      }, 2000);
      
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error('Failed to end session properly');
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-[70vh] container max-w-7xl py-12">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="h-8 w-8 bg-white/20 rounded-full mx-auto"></div>
            </div>
            <div className="text-white/60">Loading voice session...</div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <main className="min-h-[70vh] container max-w-7xl py-12">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="glass p-8 rounded-xl max-w-md">
            <div className="text-red-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Session Not Found</h3>
            <p className="text-white/60 text-sm mb-4">
              {error || 'The voice session could not be found or you do not have access to it.'}
            </p>
            <Button onClick={() => router.push('/dashboard/voice')} variant="secondary" className="w-full">
              <BackIcon />
              Back to Voice Dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Session completed state
  if (session.status === 'completed') {
    return (
      <main className="min-h-[70vh] container max-w-7xl py-12">
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/dashboard/voice')} 
            variant="ghost" 
            className="text-white/70 hover:text-white"
          >
            <BackIcon />
            Back to Voice Dashboard
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="glass p-8 rounded-xl max-w-md">
            <div className="text-green-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Session Completed</h3>
            <p className="text-white/60 text-sm mb-6">
              Your voice session &quot;{session.sessionName}&quot; has been completed successfully.
            </p>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full">
                Download Transcript
              </Button>
              <Button onClick={() => router.push('/dashboard/voice')} className="w-full">
                <BackIcon />
                Back to Voice Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Active session state
  return (
    <main className="min-h-[70vh] container max-w-7xl py-12">
      {/* Header with back button */}
      <div className="mb-6">
        <Button 
          onClick={() => router.push('/dashboard/voice')} 
          variant="ghost" 
          className="text-white/70 hover:text-white"
        >
          <BackIcon />
          Back to Voice Dashboard
        </Button>
      </div>

      {/* Voice Interface */}
      <VoiceInterface
        sessionId={session.id}
        sessionName={session.sessionName}
        wsUrl={session.livekitWsUrl}
        onEndSession={handleEndSession}
      />

      {/* Session Info */}
      <div className="mt-8 p-4 rounded-lg border border-white/15 bg-neutral-900/60">
        <div className="text-center text-sm text-white/60">
          <p>Research Target: <span className="text-white">{session.researchTarget}</span></p>
          <p className="mt-1">
            Session started at {new Date(session.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </main>
  );
}