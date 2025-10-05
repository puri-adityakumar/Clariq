'use client';

import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';

interface TranscriptCaptureProps {
  sessionId: string;
}

interface TranscriptEntry {
  timestamp: string;
  participant: string;
  text: string;
}

export function TranscriptCapture({ sessionId }: TranscriptCaptureProps) {
  const room = useRoomContext();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  useEffect(() => {
    if (!room) return;

    // For now, we'll implement a simple timer-based transcript capture
    // In a real implementation, this would listen to actual LiveKit transcription events
    const transcriptTimer = setInterval(() => {
      // This is a placeholder - real implementation would capture actual conversation
      if (Math.random() > 0.8) {
        const mockEntry: TranscriptEntry = {
          timestamp: new Date().toISOString(),
          participant: Math.random() > 0.5 ? 'User' : 'Agent',
          text: 'Sample conversation transcript will be captured here...',
        };
        setTranscript(prev => [...prev, mockEntry]);
      }
    }, 10000);

    return () => {
      clearInterval(transcriptTimer);
    };
  }, [room]);

  // Auto-save transcript when session ends or component unmounts
  useEffect(() => {
    return () => {
      if (transcript.length > 0) {
        saveTranscript(sessionId, transcript);
      }
    };
  }, [sessionId, transcript]);

  return null; // This component doesn't render anything visible
}

async function saveTranscript(sessionId: string, transcript: TranscriptEntry[]) {
  try {
    const transcriptText = transcript
      .map(entry => `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.participant}: ${entry.text}`)
      .join('\n');

    // Save to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/voice/sessions/${sessionId}/transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: transcriptText,
      }),
    });

    if (response.ok) {
      console.log('✅ Transcript saved successfully');
    } else {
      console.error('❌ Failed to save transcript');
    }
  } catch (error) {
    console.error('Error saving transcript:', error);
  }
}

export default TranscriptCapture;