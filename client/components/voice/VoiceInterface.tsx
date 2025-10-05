// ❌ REMOVED: Old VoiceInterface component
// This file has been removed as part of the refactor to use LiveKit directly
// New VoiceAgentRoom component will replace this functionality

// This component was using mock WebSocket connections and fake UI
// The new approach uses @livekit/components-react for real connections

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const MicIcon = ({ active }: { active: boolean }) => (
  <svg className={cn("h-6 w-6", active ? "text-red-400" : "text-white")} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  sessionName,
  wsUrl,
  onEndSession,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState('');
  
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Format duration in MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start duration timer
  const startDurationTimer = () => {
    if (durationInterval.current) clearInterval(durationInterval.current);
    durationInterval.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  // Stop duration timer
  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  // Initialize WebSocket connection (mock for now)
  useEffect(() => {
    if (!wsUrl) return;

    setConnectionStatus('connecting');
    const currentWs = wsRef.current;
    
    // Mock connection simulation
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
      startDurationTimer();
      
      // Mock some initial transcript
      setTranscript([
        "AI Agent: Hello! I'm your AI voice assistant. I have access to research data about your target. How can I help you today?"
      ]);
    }, 2000);

    return () => {
      clearTimeout(timer);
      stopDurationTimer();
      if (currentWs) {
        currentWs.close();
      }
    };
  }, [wsUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTimer();
    };
  }, []);

  const handleStartRecording = () => {
    if (connectionStatus !== 'connected') return;
    setIsRecording(true);
    setCurrentUserInput('');
    
    // Mock voice recognition
    setTimeout(() => {
      setCurrentUserInput('User is speaking...');
    }, 500);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Mock processing and response
    setTimeout(() => {
      const userMessage = "Tell me about the company's recent performance.";
      const aiResponse = "Based on the research data, the company has shown strong growth in Q3 with revenue increasing by 23% compared to the previous quarter. Their main growth drivers include...";
      
      setTranscript(prev => [
        ...prev,
        `You: ${userMessage}`,
        `AI Agent: ${aiResponse}`
      ]);
      setCurrentUserInput('');
      
      // Mock AI speaking
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 1500);
  };

  const handleEndSession = async () => {
    stopDurationTimer();
    setConnectionStatus('disconnected');
    await onEndSession();
  };

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-400' };
      case 'connected':
        return { text: 'Connected', color: 'text-green-400' };
      case 'error':
        return { text: 'Connection Error', color: 'text-red-400' };
      default:
        return { text: 'Disconnected', color: 'text-gray-400' };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-white mb-2">
          {sessionName}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", 
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
              'bg-gray-400'
            )} />
            <span className={statusDisplay.color}>{statusDisplay.text}</span>
          </div>
          <div className="text-white/60">
            Duration: {formatDuration(duration)}
          </div>
        </div>
      </div>

      {/* Voice Interface */}
      <div className="glass p-8 rounded-xl">
        <div className="text-center space-y-6">
          {/* AI Status */}
          {isSpeaking && (
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm">AI is speaking...</span>
              </div>
            </div>
          )}

          {/* Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={connectionStatus !== 'connected'}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 border-2",
                isRecording 
                  ? "bg-red-500 border-red-400 hover:bg-red-600 scale-110" 
                  : "bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50",
                connectionStatus !== 'connected' && "opacity-50 cursor-not-allowed"
              )}
            >
              <MicIcon active={isRecording} />
            </button>
          </div>

          {/* Status Text */}
          <div className="space-y-2">
            {connectionStatus === 'connecting' && (
              <p className="text-white/60 text-sm">Connecting to voice agent...</p>
            )}
            {connectionStatus === 'connected' && !isRecording && !isSpeaking && (
              <p className="text-white/60 text-sm">Click the microphone to start speaking</p>
            )}
            {isRecording && (
              <p className="text-red-400 text-sm font-medium">Recording... Release to send</p>
            )}
            {currentUserInput && (
              <p className="text-white/80 text-sm italic">{currentUserInput}</p>
            )}
          </div>

          {/* End Session Button */}
          <div className="pt-4">
            <Button
              onClick={handleEndSession}
              variant="secondary"
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              disabled={connectionStatus === 'connecting'}
            >
              <PhoneIcon />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="glass p-6 rounded-xl">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">
            Conversation Transcript
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transcript.map((message, index) => {
              const isUser = message.startsWith('You:');
              const content = message.substring(message.indexOf(':') + 1).trim();
              const speaker = message.substring(0, message.indexOf(':'));
              
              return (
                <div key={index} className={cn(
                  "p-3 rounded-lg",
                  isUser ? "bg-blue-500/10 border border-blue-500/20" : "bg-neutral-800/60"
                )}>
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isUser ? "text-blue-400" : "text-green-400"
                  )}>
                    {speaker}
                  </div>
                  <div className="text-white/90 text-sm">
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection Info */}
      {connectionStatus === 'error' && (
        <div className="glass p-4 rounded-xl border border-red-500/20 bg-red-500/10">
          <div className="text-center">
            <div className="text-red-400 mb-2">
              <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-red-400 font-medium mb-1">Connection Error</h3>
            <p className="text-white/60 text-sm">
              Failed to connect to the voice agent. Please try refreshing the page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;