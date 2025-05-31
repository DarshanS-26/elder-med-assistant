
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeech';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, className = '' }) => {
  const { isListening, transcript, isSupported, startListening, resetTranscript } = useSpeechRecognition();

  React.useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className={`elder-button-secondary flex items-center justify-center gap-3 ${
        isListening ? 'voice-pulse' : ''
      } ${className}`}
      aria-label={isListening ? 'Listening...' : 'Click to speak'}
    >
      {isListening ? (
        <>
          <MicOff size={28} />
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic size={28} />
          <span>Speak</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
