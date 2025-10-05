"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/appwrite/AuthProvider";
import { generateLiveKitToken } from "@/lib/appwrite/voice";
import { VoiceAgentRoom } from "@/components/voice/VoiceAgentRoom";

// Voice session interface (simplified for active sessions)
interface ConnectionInfo {
  token: string;
  ws_url: string;
  room_name: string;
}

const BackIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://clariq-zu4nagv7.livekit.cloud';

export default function VoiceSessionPage() {
  const { sessionId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session name from URL params
  const sessionName = searchParams.get('name') || 'Voice Session';

  // Generate connection token on mount
  useEffect(() => {
    if (!sessionId || !user) return;

    const setupConnection = async () => {
      try {
        setLoading(true);
        
        // Generate room name and token (like agent-starter-react)
        const roomName = `voice-session-${(sessionId as string).substring(0, 8)}`;
        const participantName = user.name || `User-${user.$id.substring(0, 8)}`;
        
        // Pass agent name if configured
        const agentName = process.env.NEXT_PUBLIC_LIVEKIT_AGENT_NAME || undefined;
        const token = await generateLiveKitToken(roomName, participantName, agentName);

        setConnectionInfo({
          token,
          ws_url: LIVEKIT_WS_URL,
          room_name: roomName,
        });

      } catch (err) {
        console.error('Error setting up connection:', err);
        setError(err instanceof Error ? err.message : 'Failed to set up voice connection');
      } finally {
        setLoading(false);
      }
    };

    setupConnection();
  }, [sessionId, user]);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-[70vh] container max-w-7xl py-12">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="h-8 w-8 bg-white/20 rounded-full mx-auto"></div>
            </div>
            <div className="text-white/60">Connecting to voice session...</div>
          </div>
        </div>
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
            <h3 className="text-lg font-medium text-white mb-2">Connection Failed</h3>
            <p className="text-white/60 text-sm mb-4">
              {error}
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

  // Connected state - render the LiveKit voice room
  if (connectionInfo) {
    return (
      <VoiceAgentRoom
        sessionId={sessionId as string}
        sessionName={sessionName}
        roomName={connectionInfo.room_name}
        serverUrl={connectionInfo.ws_url}
        token={connectionInfo.token}
        onDisconnect={() => router.push('/dashboard/voice')}
      />
    );
  }

  // Fallback state (shouldn't reach here)
  return null;
}