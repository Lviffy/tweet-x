
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '@/hooks/useSpeechToText';

interface SpeechToTextButtonProps {
  onTranscriptChange: (transcript: string) => void;
  className?: string;
}

const SpeechToTextButton = ({ onTranscriptChange, className }: SpeechToTextButtonProps) => {
  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechToText({
    continuous: false,
    interimResults: true,
    language: 'en-US'
  });

  React.useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Don't show the button if speech recognition is not supported
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggleListening}
      className={className}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4 mr-2" />
          Stop
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 mr-2" />
          Speak
        </>
      )}
    </Button>
  );
};

export default SpeechToTextButton;
