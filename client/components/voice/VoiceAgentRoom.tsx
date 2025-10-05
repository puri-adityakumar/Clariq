'use client';

import { useState } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { TranscriptCapture } from './TranscriptCapture';

interface VoiceAgentRoomProps {
  sessionId: string;
  sessionName: string;
  serverUrl: string;
  token: string;
  onDisconnect: () => void;
}

export function VoiceAgentRoom({
  sessionId,
  sessionName,
  serverUrl,
  token,
  onDisconnect,
}: VoiceAgentRoomProps) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black">
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
        onConnected={() => {
          console.log('✅ Connected to LiveKit room');
          setConnected(true);
          setError(null);
        }}
        onDisconnected={(reason) => {
          console.log('❌ Disconnected from room:', reason);
          setConnected(false);
          onDisconnect();
        }}
        onError={(error) => {
          console.error('❌ LiveKit error:', error);
          setError(error.message || 'Connection error occurred');
        }}
        className="h-full"
      >
        {/* Audio renderer for agent's voice */}
        <RoomAudioRenderer />
        
        {/* Transcript capture (invisible) */}
        <TranscriptCapture sessionId={sessionId} />
        
        {/* Main UI */}
        <VoiceAssistantUI 
          connected={connected}
          error={error}
          sessionName={sessionName}
          sessionId={sessionId}
          onDisconnect={onDisconnect}
        />
      </LiveKitRoom>
    </div>
  );
}

function VoiceAssistantUI({ 
  connected, 
  error,
  sessionName, 
  sessionId,
  onDisconnect 
}: { 
  connected: boolean;
  error: string | null;
  sessionName: string; 
  sessionId: string;
  onDisconnect: () => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();

  const getStateDisplay = () => {
    switch (state) {
      case 'initializing':
        return { emoji: '⏳', text: 'Initializing...', color: 'text-yellow-400' };
      case 'listening':
        return { emoji: '👂', text: 'Listening', color: 'text-green-400' };
      case 'thinking':
        return { emoji: '🤔', text: 'Thinking', color: 'text-blue-400' };
      case 'speaking':
        return { emoji: '🗣️', text: 'Speaking', color: 'text-purple-400' };
      default:
        return { emoji: '⚪', text: 'Idle', color: 'text-gray-400' };
    }
  };

  const currentState = getStateDisplay();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🎙️ {sessionName}
        </h1>
        
        {/* Connection Status */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
          error 
            ? 'bg-red-500/20 border-red-500/30'
            : connected 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-yellow-500/20 border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            error
              ? 'bg-red-400'
              : connected 
                ? 'bg-green-400 animate-pulse' 
                : 'bg-yellow-400'
          }`} />
          <span className={`text-sm font-medium ${
            error 
              ? 'text-red-400'
              : connected ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {error ? 'Connection Error' : connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 text-center text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* Audio Visualizer */}
        <div className="h-64 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
          <BarVisualizer
            state={state}
            barCount={5}
            trackRef={audioTrack}
            className="h-full max-w-md"
          />
        </div>

        {/* Agent State */}
        <div className="text-center space-y-4">
          <div className={`text-6xl ${currentState.color}`}>
            {currentState.emoji}
          </div>
          <div className={`text-2xl font-bold ${currentState.color}`}>
            {currentState.text}
          </div>
        </div>

        {/* Instructions */}
        {connected && state === 'listening' && (
          <div className="text-center text-white/60 text-sm space-y-2">
            <p>🎤 Start speaking to begin your conversation</p>
            <p>The AI agent will respond intelligently to your questions</p>
          </div>
        )}

        {/* Agent Thinking Indicator */}
        {state === 'thinking' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-blue-400">AI is processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <VoiceAssistantControlBar 
          controls={{ 
            leave: false, // Disable default leave button
          }} 
        />
        
        {/* Custom disconnect button */}
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Session Info */}
      <div className="text-center text-xs text-white/40 mt-4 space-y-1">
        <p>Session ID: {sessionId}</p>
        <p>Using LiveKit for real-time voice communication</p>
      </div>
    </div>
  );
}

export default VoiceAgentRoom;