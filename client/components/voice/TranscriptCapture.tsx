'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { saveCompletedSession } from '@/lib/appwrite/voice';

interface TranscriptCaptureProps {
  sessionId: string;
  sessionName: string;
  roomName: string;
}

/**
 * TranscriptCapture Component - Phase 1 Implementation
 * 
 * This component:
 * 1. Captures real-time transcript data from LiveKit using useChatAndTranscription hook
 * 2. Listens for room disconnect event
 * 3. Automatically saves the complete session to Appwrite database when the session ends
 * 
 * The component is invisible (renders null) but works in the background
 */
export function TranscriptCapture({ sessionId, sessionName, roomName }: TranscriptCaptureProps) {
  const room = useRoomContext();
  const { messages } = useChatAndTranscription();
  const savedRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!room) return;

    const handleDisconnect = async () => {
      // Only save once
      if (savedRef.current || messages.length === 0) return;
      savedRef.current = true;

      // Calculate duration in seconds
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

      console.log(`📝 Session ended. Saving ${messages.length} transcript messages...`);

      try {
        // Format transcript as text
        const transcriptText = messages
          .map((msg) => {
            const speaker = msg.from?.identity === 'user' ? 'You' : 'AI Agent';
            const time = new Date(msg.timestamp).toLocaleTimeString();
            return `[${time}] ${speaker}: ${msg.message}`;
          })
          .join('\n');

        // Save completed session to database
        await saveCompletedSession(
          sessionId,
          sessionName,
          roomName,
          transcriptText,
          durationSeconds
        );
        console.log('✅ Session saved to database successfully');
      } catch (error) {
        console.error('❌ Error saving session:', error);
      }
    };

    // Listen for room disconnect
    room.on(RoomEvent.Disconnected, handleDisconnect);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnect);
    };
  }, [room, messages, sessionId, sessionName, roomName]);

  // Also save on component unmount (backup)
  useEffect(() => {
    const startTime = startTimeRef.current; // Capture for cleanup
    return () => {
      if (!savedRef.current && messages.length > 0) {
        savedRef.current = true;
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        const transcriptText = messages
          .map((msg) => {
            const speaker = msg.from?.identity === 'user' ? 'You' : 'AI Agent';
            const time = new Date(msg.timestamp).toLocaleTimeString();
            return `[${time}] ${speaker}: ${msg.message}`;
          })
          .join('\n');

        saveCompletedSession(
          sessionId,
          sessionName,
          roomName,
          transcriptText,
          durationSeconds
        ).catch((error) => {
          console.error('❌ Error saving session on unmount:', error);
        });
      }
    };
  }, [messages, sessionId, sessionName, roomName]);

  return null; // This component doesn't render anything visible
}

export default TranscriptCapture;