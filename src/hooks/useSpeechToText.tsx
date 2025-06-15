
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
      
      // Handle different error types
      switch (event.error) {
        case 'not-allowed':
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access and try again.",
            variant: "destructive"
          });
          break;
        case 'no-speech':
          // Don't show error for no speech - just stop listening
          console.log('No speech detected');
          break;
        case 'network':
          toast({
            title: "Network Error",
            description: "Please check your internet connection and try again.",
            variant: "destructive"
          });
          break;
        case 'service-not-allowed':
          toast({
            title: "Service Not Available",
            description: "Speech recognition service is not available. Try refreshing the page.",
            variant: "destructive"
          });
          break;
        case 'bad-grammar':
        case 'language-not-supported':
          toast({
            title: "Language Not Supported",
            description: "The selected language is not supported.",
            variant: "destructive"
          });
          break;
        default:
          toast({
            title: "Speech Recognition Error",
            description: "An error occurred. Please try again.",
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
      // Always create a fresh instance to avoid stale state
      recognitionRef.current = initializeSpeechRecognition();

      if (recognitionRef.current) {
        setTranscript('');
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
