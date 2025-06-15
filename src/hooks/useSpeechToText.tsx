
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export const useSpeechToText = (options: SpeechToTextOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const {
    continuous = false,
    interimResults = true,
    language = 'en-US'
  } = options;

  // Check browser support on mount
  useEffect(() => {
    const checkSupport = () => {
      const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      console.log('Speech recognition support:', hasSupport);
      setIsSupported(hasSupport);
    };

    checkSupport();
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSupported) {
      console.log('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log('Speech recognition result:', event);
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        console.log('Final transcript:', finalTranscript);
        setTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use speech-to-text.",
          variant: "destructive"
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    return recognition;
  }, [continuous, interimResults, language, toast, isSupported]);

  const startListening = useCallback(() => {
    console.log('Attempting to start listening...');
    
    if (!isSupported) {
      console.log('Speech recognition not supported');
      return;
    }

    if (isListening) {
      console.log('Already listening');
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }

      if (recognitionRef.current) {
        setTranscript('');
        recognitionRef.current.start();
        console.log('Speech recognition start requested');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Speech Recognition Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive"
      });
    }
  }, [initializeSpeechRecognition, isListening, isSupported, toast]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};
