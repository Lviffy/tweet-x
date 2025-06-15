
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

  // Show a disabled button if not supported, so users know the feature exists
  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className={className}
        title="Speech recognition not supported in this browser"
      >
        <Mic className="w-4 h-4 mr-2" />
        Speak
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
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
