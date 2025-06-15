
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SpeechToTextOptions, SpeechToTextReturn } from '@/types/speechToText';
import { SPEECH_TO_TEXT_DEFAULTS } from '@/utils/speechToTextConstants';
import { checkSpeechRecognitionSupport, createSpeechRecognition } from '@/utils/speechRecognitionUtils';
import { createMediaRecorder } from '@/utils/mediaRecorderUtils';

export const useSpeechToText = (options: SpeechToTextOptions = {}): SpeechToTextReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const {
    continuous = SPEECH_TO_TEXT_DEFAULTS.continuous,
    interimResults = SPEECH_TO_TEXT_DEFAULTS.interimResults,
    language = SPEECH_TO_TEXT_DEFAULTS.language
  } = options;

  // Check browser support on mount
  useEffect(() => {
    setIsSupported(checkSpeechRecognitionSupport());
  }, []);

  const startMediaRecording = useCallback(async () => {
    const result = await createMediaRecorder(
      setTranscript,
      (error) => {
        toast({
          title: "Microphone Error",
          description: error,
          variant: "destructive"
        });
      },
      () => setIsListening(true),
      () => setIsListening(false)
    );

    if (result) {
      mediaRecorderRef.current = result.mediaRecorder;
      streamRef.current = result.stream;
    }
  }, [toast]);

  const startListening = useCallback(() => {
    console.log('Starting speech recognition...');
    
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

    try {
      // Try Speech Recognition first
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognitionRef.current = createSpeechRecognition(
          continuous,
          interimResults,
          language,
          () => setIsListening(true),
          setTranscript,
          () => {
            setIsListening(false);
            startMediaRecording();
          },
          () => setIsListening(false)
        );
        
        if (recognitionRef.current) {
          setTranscript('');
          recognitionRef.current.start();
          return;
        }
      }
      
      // Fall back to MediaRecorder
      startMediaRecording();
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      startMediaRecording();
    }
  }, [continuous, interimResults, language, isListening, isSupported, toast, startMediaRecording]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
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
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up media recorder:', error);
        }
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
