'use client';

import { useState } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  StartAudio,
  type ReceivedChatMessage,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { TranscriptCapture } from './TranscriptCapture';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';

interface VoiceAgentRoomProps {
  sessionId: string;
  sessionName: string;
  roomName: string;
  serverUrl: string;
  token: string;
  onDisconnect: () => void;
}

export function VoiceAgentRoom({
  sessionId,
  sessionName,
  roomName,
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
        onMediaDeviceFailure={(failure) => {
          console.error('❌ Media device error:', failure);
          setError('Media device error - please check microphone permissions');
        }}
        className="h-full"
      >
        {/* Audio renderer for agent's voice */}
        <RoomAudioRenderer />
        
        {/* Start audio context - required for audio playback */}
        <StartAudio label="Click to enable audio" />
        
        {/* Transcript capture (invisible) - saves to database on disconnect */}
        <TranscriptCapture 
          sessionId={sessionId}
          sessionName={sessionName}
          roomName={roomName}
        />
        
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
  const { messages } = useChatAndTranscription();
  const [showTranscript, setShowTranscript] = useState(false);

  // Enable debug mode in development
  useDebugMode({ enabled: process.env.NODE_ENV !== 'production' });

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

      {/* Transcript Toggle Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all",
            showTranscript 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-white/10 hover:bg-white/20 text-white/80"
          )}
        >
          {showTranscript ? '📝 Hide Transcript' : '📝 Show Transcript'}
          {messages.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Real-time Transcript Display */}
      {showTranscript && messages.length > 0 && (
        <div className="glass p-6 rounded-xl mb-6 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-white mb-4 sticky top-0 bg-neutral-900/80 backdrop-blur-sm pb-2">
            Live Transcript
          </h3>
          <div className="space-y-3">
            {messages.map((message: ReceivedChatMessage) => {
              const isAgent = message.from?.identity !== 'user';
              return (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg",
                    isAgent 
                      ? "bg-neutral-800/60 border border-neutral-700/50" 
                      : "bg-blue-500/10 border border-blue-500/20"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isAgent ? "text-green-400" : "text-blue-400"
                  )}>
                    {isAgent ? '🤖 AI Agent' : '👤 You'}
                  </div>
                  <div className="text-white/90 text-sm whitespace-pre-wrap">
                    {message.message}
                  </div>
                  <div className="text-xs text-white/30 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No messages yet indicator */}
      {showTranscript && messages.length === 0 && (
        <div className="glass p-6 rounded-xl mb-6 text-center">
          <div className="text-white/40 text-sm">
            <p>Start speaking to see the transcript appear here in real-time</p>
          </div>
        </div>
      )}

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
        {messages.length > 0 && (
          <p>Transcript: {messages.length} message{messages.length !== 1 ? 's' : ''} captured</p>
        )}
      </div>
    </div>
  );
}

export default VoiceAgentRoom;