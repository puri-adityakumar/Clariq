import { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';

interface UseDebugModeOptions {
  enabled?: boolean;
}

/**
 * Debug hook for development - logs LiveKit room events
 * Ported from agent-starter-react
 */
export function useDebugMode({ enabled = false }: UseDebugModeOptions = {}) {
  const room = useRoomContext();

  useEffect(() => {
    if (!enabled || !room) return;

    const handleRoomEvent = (event: string) => {
      return (...args: unknown[]) => {
        console.log(`[LiveKit Debug] ${event}:`, ...args);
      };
    };

    // Subscribe to common room events for debugging
    const events = [
      'participantConnected',
      'participantDisconnected',
      'trackSubscribed',
      'trackUnsubscribed',
      'dataReceived',
      'connectionStateChanged',
      'mediaDevicesError',
    ];

    events.forEach((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      room.on(event as any, handleRoomEvent(event));
    });

    console.log('[LiveKit Debug] Debug mode enabled for room:', room.name);

    return () => {
      events.forEach((event) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        room.off(event as any, handleRoomEvent(event));
      });
    };
  }, [enabled, room]);
}
