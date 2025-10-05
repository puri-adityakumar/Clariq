"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { useAuth } from "../../../../appwrite/AuthProvider";
import { getVoiceSession, getVoiceConnectionToken, type VoiceSession } from "../../../../lib/appwrite/voice";
import { VoiceAgentRoom } from "../../../../components/voice/VoiceAgentRoom";

// Voice session interface (now using the real one from voice.ts)
interface ConnectionInfo {
  token: string;
  ws_url: string;
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
  
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  useEffect(() => {
    if (!sessionId || !user) return;

    const loadSessionAndConnect = async () => {
      try {
        setLoading(true);
        
        // Get session details
        const sessionData = await getVoiceSession(sessionId as string);
        setSession(sessionData);

        // Get LiveKit connection token
        const connInfo = await getVoiceConnectionToken(sessionId as string);
        setConnectionInfo(connInfo);

      } catch (err) {
        console.error('Error loading session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load voice session');
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndConnect();
  }, [sessionId, user]);

  // Handle ending session

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
              Your voice session &quot;{session.session_name}&quot; has been completed successfully.
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

  // Active session state - use VoiceAgentRoom if we have connection info
  if (session.status === 'ready' || session.status === 'active') {
    if (!connectionInfo) {
      return (
        <main className="min-h-[70vh] container max-w-7xl py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <div className="h-8 w-8 bg-white/20 rounded-full mx-auto"></div>
              </div>
              <div className="text-white/60">Getting connection token...</div>
            </div>
          </div>
        </main>
      );
    }

    // Render the actual LiveKit voice room
    return (
      <VoiceAgentRoom
        sessionId={session.id}
        sessionName={session.session_name}
        serverUrl={connectionInfo.ws_url}
        token={connectionInfo.token}
        onDisconnect={() => router.push('/dashboard/voice')}
      />
    );
  }

  // Pending or other states
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

      {/* Status display for non-active sessions */}
      <div className="glass p-8 rounded-xl text-center">
        {session.status === 'pending' && (
          <>
            <div className="text-yellow-400 mb-4">
              <svg className="h-16 w-16 mx-auto animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-medium tracking-tight text-white mb-2">
              Setting Up Voice Agent
            </h3>
            <p className="text-sm text-white/60 max-w-sm mx-auto mb-6">
              Your AI voice agent is being prepared. This usually takes 30-60 seconds.
            </p>
          </>
        )}
        
        {session.status === 'failed' && (
          <>
            <div className="text-red-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-medium tracking-tight text-white mb-2">
              Voice Agent Failed
            </h3>
            <p className="text-sm text-white/60 max-w-sm mx-auto mb-6">
              Failed to set up the voice agent. Please try creating a new session.
            </p>
            <Button onClick={() => router.push('/dashboard/voice')}>
              Back to Dashboard
            </Button>
          </>
        )}

        <div className="space-y-2 text-xs text-white/40 mt-6">
          <p>Session: {session.session_name}</p>
          <p>Status: {session.status}</p>
          <p>Created: {new Date(session.created_at).toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}