
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Wifi, WifiOff } from 'lucide-react';
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
    console.log('Transcript updated:', transcript);
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  const handleToggleListening = () => {
    console.log('Button clicked, isListening:', isListening);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Check if we're on a secure connection
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

  // Show different states based on support and connection
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
        Speech Not Supported
      </Button>
    );
  }

  if (!isSecure) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className={className}
        title="Speech recognition requires HTTPS"
      >
        <WifiOff className="w-4 h-4 mr-2" />
        HTTPS Required
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
