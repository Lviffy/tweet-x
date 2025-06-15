
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

  const cleanupResources = useCallback(() => {
    console.log('Cleaning up speech recognition resources...');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
    mediaRecorderRef.current = null;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped media track:', track.kind);
      });
      streamRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  const startMediaRecording = useCallback(async () => {
    console.log('Starting MediaRecorder fallback...');
    cleanupResources();
    
    const result = await createMediaRecorder(
      (transcript) => {
        console.log('MediaRecorder transcript received:', transcript);
        setTranscript(transcript);
      },
      (error) => {
        console.error('MediaRecorder error:', error);
        toast({
          title: "Microphone Error",
          description: error,
          variant: "destructive"
        });
        setIsListening(false);
      },
      () => {
        console.log('MediaRecorder started');
        setIsListening(true);
      },
      () => {
        console.log('MediaRecorder stopped');
        setIsListening(false);
      }
    );

    if (result) {
      mediaRecorderRef.current = result.mediaRecorder;
      streamRef.current = result.stream;
    }
  }, [toast, cleanupResources]);

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

    // Clean up any existing resources first
    cleanupResources();

    try {
      // Try Web Speech API first
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Attempting to use Web Speech API...');
        
        recognitionRef.current = createSpeechRecognition(
          continuous,
          interimResults,
          language,
          () => {
            console.log('Web Speech API started');
            setIsListening(true);
          },
          (transcript) => {
            console.log('Web Speech API transcript:', transcript);
            setTranscript(transcript);
          },
          (error) => {
            console.log('Web Speech API error, falling back to MediaRecorder:', error);
            if (error === 'fallback') {
              // Fallback to MediaRecorder
              startMediaRecording();
            } else {
              setIsListening(false);
              toast({
                title: "Speech Recognition Error",
                description: "Falling back to audio recording...",
                variant: "default"
              });
              // Still try MediaRecorder as fallback
              setTimeout(() => startMediaRecording(), 500);
            }
          },
          () => {
            console.log('Web Speech API ended');
            setIsListening(false);
          }
        );
        
        if (recognitionRef.current) {
          setTranscript('');
          recognitionRef.current.start();
          return;
        }
      }
      
      // Fallback to MediaRecorder if Web Speech API not available
      console.log('Web Speech API not available, using MediaRecorder...');
      startMediaRecording();
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      startMediaRecording();
    }
  }, [continuous, interimResults, language, isListening, isSupported, toast, startMediaRecording, cleanupResources]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    cleanupResources();
  }, [cleanupResources]);

  const resetTranscript = useCallback(() => {
    console.log('Resetting transcript');
    setTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useSpeechToText hook unmounting, cleaning up...');
      cleanupResources();
    };
  }, [cleanupResources]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};
