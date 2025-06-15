
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
  const retryCountRef = useRef(0);
  const maxRetries = 2;
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
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      retryCountRef.current = 0; // Reset retry count on successful start
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
        retryCountRef.current = 0; // Reset retry count on successful result
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Handle different error types with retry logic
      switch (event.error) {
        case 'network':
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            console.log(`Network error, retrying... (${retryCountRef.current}/${maxRetries})`);
            
            // Retry after a short delay
            setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.error('Error during retry:', error);
                }
              }
            }, 1000);
          } else {
            toast({
              title: "Network Connection Issue",
              description: "Unable to connect to speech recognition service. Please check your internet connection and try again.",
              variant: "destructive"
            });
            retryCountRef.current = 0;
          }
          break;
        case 'not-allowed':
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings and try again.",
            variant: "destructive"
          });
          break;
        case 'no-speech':
          // Don't show error for no speech - just stop listening
          console.log('No speech detected');
          break;
        case 'service-not-allowed':
          toast({
            title: "Service Unavailable",
            description: "Speech recognition service is temporarily unavailable. Please try again later.",
            variant: "destructive"
          });
          break;
        case 'bad-grammar':
        case 'language-not-supported':
          toast({
            title: "Language Not Supported",
            description: "The selected language is not supported for speech recognition.",
            variant: "destructive"
          });
          break;
        case 'audio-capture':
          toast({
            title: "Microphone Error",
            description: "Unable to access your microphone. Please check your device settings.",
            variant: "destructive"
          });
          break;
        default:
          toast({
            title: "Speech Recognition Error",
            description: `An error occurred: ${event.error}. Please try again.`,
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
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      console.log('Already listening');
      return;
    }

    // Check if we're on HTTPS or localhost (required for speech recognition)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      toast({
        title: "HTTPS Required",
        description: "Speech recognition requires a secure connection (HTTPS).",
        variant: "destructive"
      });
      return;
    }

    try {
      // Stop any existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping previous recognition:', error);
        }
      }

      // Create fresh instance
      recognitionRef.current = initializeSpeechRecognition();

      if (recognitionRef.current) {
        setTranscript('');
        retryCountRef.current = 0;
        recognitionRef.current.start();
        console.log('Speech recognition start requested');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      toast({
        title: "Unable to Start",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive"
      });
    }
  }, [initializeSpeechRecognition, isListening, isSupported, toast]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    retryCountRef.current = maxRetries; // Prevent retries when manually stopping
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
    };
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
