/**
 * Voice Session Management - Frontend-only with Appwrite
 * 
 * This module handles all voice session operations directly through Appwrite,
 * without requiring backend API calls. All authentication and database operations
 * are performed client-side using Appwrite SDK.
 */

import { databases, account } from '@/appwrite/config';
import { ID, Query, Permission, Role } from 'appwrite';

// Database configuration
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'clariq_research';
const VOICE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_VOICE_COLLECTION_ID || 'voice_sales_sessions';

// LiveKit configuration
const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://clariq-zu4nagv7.livekit.cloud';

// Voice session interfaces
export interface VoiceSession {
  id: string;
  user_id: string;
  session_name: string;
  room_name: string;
  status: 'pending' | 'ready' | 'active' | 'completed' | 'failed';
  duration_seconds: number;
  created_at: string;
  completed_at?: string;
  transcript_file_id?: string;
}

export interface CreateVoiceSessionResponse {
  session_id: string;
  room_name: string;
  status: string;
  message: string;
  token?: string; // LiveKit token for immediate connection
  ws_url?: string; // LiveKit WebSocket URL
  session_name?: string; // Session name for reference
  user_id?: string; // User ID for saving later
}

export interface VoiceSessionListResponse {
  sessions: VoiceSession[];
  total: number;
}

export interface LiveKitConnectionInfo {
  token: string;
  ws_url: string;
  room_name: string;
}

/**
 * Generate LiveKit access token for a room
 * This calls a Next.js API route that safely generates tokens server-side
 */
export const generateLiveKitToken = async (
  roomName: string,
  participantName: string,
  agentName?: string
): Promise<string> => {
  try {
    const response = await fetch('/api/livekit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName,
        participantName,
        agentName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate LiveKit token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    throw error;
  }
};

/**
 * Create a new voice session - simplified to match agent-starter-react pattern
 * No database needed upfront - just generate room name and token
 * Session will be saved to database AFTER it completes (with transcript)
 */
export const createVoiceSession = async (
  sessionName: string
): Promise<CreateVoiceSessionResponse> => {
  try {
    // Get current user for participant name
    const user = await account.get();
    
    // Generate unique room name (like agent-starter-react)
    const sessionId = ID.unique();
    const roomName = `voice-session-${sessionId.substring(0, 8)}`;
    const participantName = user.name || `User-${user.$id.substring(0, 8)}`;

    // Generate LiveKit token with agent configuration
    // Use default voice agent if available in your LiveKit project
    const agentName = process.env.NEXT_PUBLIC_LIVEKIT_AGENT_NAME || undefined;
    const token = await generateLiveKitToken(roomName, participantName, agentName);

    return {
      session_id: sessionId,
      room_name: roomName,
      status: 'ready', // Ready to connect (not pending in database)
      message: 'Voice session ready',
      token,
      ws_url: LIVEKIT_WS_URL,
      session_name: sessionName,
      user_id: user.$id,
    };
  } catch (error) {
    console.error('Error creating voice session:', error);
    throw error;
  }
};

/**
 * Get LiveKit connection token for a session
 * @deprecated Use createVoiceSession which returns token directly
 * This function is kept for backward compatibility but may be removed
 */
export const getVoiceConnectionToken = async (
  sessionId: string
): Promise<LiveKitConnectionInfo> => {
  console.warn('getVoiceConnectionToken is deprecated. Use createVoiceSession instead.');
  
  try {
    // For backward compatibility, generate a new token
    const user = await account.get();
    const roomName = `voice-session-${sessionId.substring(0, 8)}`;
    const participantName = user.name || `User-${user.$id.substring(0, 8)}`;
    const token = await generateLiveKitToken(roomName, participantName);

    return {
      token,
      ws_url: LIVEKIT_WS_URL,
      room_name: roomName,
    };
  } catch (error) {
    console.error('Error getting connection token:', error);
    throw error;
  }
};

/**
 * Get voice sessions for the current user
 */
export const getVoiceSessions = async (
  limit = 20,
  offset = 0
): Promise<VoiceSessionListResponse> => {
  try {
    // Get current user
    const user = await account.get();

    // Query sessions for this user
    const response = await databases.listDocuments(
      DATABASE_ID,
      VOICE_COLLECTION_ID,
      [
        Query.equal('user_id', user.$id),
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt'),
      ]
    );

    const sessions: VoiceSession[] = response.documents.map((doc) => ({
      id: doc.$id,
      user_id: doc.user_id as string,
      session_name: doc.session_name as string,
      room_name: doc.room_name as string,
      status: doc.status as VoiceSession['status'],
      duration_seconds: (doc.duration_seconds as number) || 0,
      created_at: (doc.created_at as string) || doc.$createdAt,
      completed_at: doc.completed_at as string | undefined,
      transcript_file_id: doc.transcript_file_id as string | undefined,
    }));

    return {
      sessions,
      total: response.total,
    };
  } catch (error) {
    console.error('Error fetching voice sessions:', error);
    throw error;
  }
};

/**
 * Get specific voice session details
 */
export const getVoiceSession = async (sessionId: string): Promise<VoiceSession> => {
  try {
    // Get current user
    const user = await account.get();

    // Get session
    const doc = await databases.getDocument(
      DATABASE_ID,
      VOICE_COLLECTION_ID,
      sessionId
    );

    // Verify ownership
    if (doc.user_id !== user.$id) {
      throw new Error('Access denied: You do not own this session');
    }

    return {
      id: doc.$id,
      user_id: doc.user_id,
      session_name: doc.session_name,
      room_name: doc.room_name,
      status: doc.status,
      duration_seconds: doc.duration_seconds || 0,
      created_at: doc.created_at || doc.$createdAt,
      completed_at: doc.completed_at,
      transcript_file_id: doc.transcript_file_id,
    };
  } catch (error) {
    console.error('Error fetching voice session:', error);
    throw error;
  }
};

/**
 * Update session status
 */
export const updateSessionStatus = async (
  sessionId: string,
  status: VoiceSession['status'],
  additionalData?: Partial<VoiceSession>
): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      status,
      ...additionalData,
    };

    if (status === 'completed' && !additionalData?.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    await databases.updateDocument(
      DATABASE_ID,
      VOICE_COLLECTION_ID,
      sessionId,
      updateData
    );
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

/**
 * Save completed session to database with transcript
 * Called AFTER session ends - this is when we create the database record
 */
export const saveCompletedSession = async (
  sessionId: string,
  sessionName: string,
  roomName: string,
  transcript: string,
  durationSeconds: number
): Promise<void> => {
  try {
    const user = await account.get();
    const now = new Date().toISOString();

    // Create the session document NOW (after session completes)
    await databases.createDocument(
      DATABASE_ID,
      VOICE_COLLECTION_ID,
      sessionId,
      {
        user_id: user.$id,
        session_name: sessionName,
        room_name: roomName,
        status: 'completed',
        duration_seconds: durationSeconds,
        created_at: now, // Created = when we save it
        completed_at: now,
        // transcript will be stored in Phase 2
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id))
      ]
    );

    console.log('✅ Session saved to database:', sessionId);
    console.log(`📝 Transcript length: ${transcript.length} characters`);
  } catch (error) {
    console.error('❌ Error saving completed session:', error);
    throw error;
  }
};

/**
 * Save transcript for a session
 * @deprecated Use saveCompletedSession instead
 */
export const saveTranscript = async (
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _transcript: string
): Promise<void> => {
  console.warn('saveTranscript is deprecated. Use saveCompletedSession instead.');
  // For backward compatibility, just log
  console.log('Session completed:', sessionId);
};

/**
 * Delete a voice session
 */
export const deleteVoiceSession = async (sessionId: string): Promise<void> => {
  try {
    // Verify ownership
    const user = await account.get();
    const session = await databases.getDocument(
      DATABASE_ID,
      VOICE_COLLECTION_ID,
      sessionId
    );

    if (session.user_id !== user.$id) {
      throw new Error('Access denied: You do not own this session');
    }

    // Delete the document
    await databases.deleteDocument(
      DATABASE_ID,
      VOICE_COLLECTION_ID,
      sessionId
    );
  } catch (error) {
    console.error('Error deleting voice session:', error);
    throw error;
  }
};

/**
 * Format duration seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return 'Invalid date';
  }
};