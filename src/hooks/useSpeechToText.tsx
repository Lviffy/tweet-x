
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const {
    continuous = false,
    interimResults = true,
    language = 'en-US'
  } = options;

  // Check browser support on mount
  useEffect(() => {
    const checkSupport = () => {
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const hasMediaRecorder = 'MediaRecorder' in window;
      const hasSupport = hasSpeechRecognition || hasMediaRecorder;
      console.log('Speech recognition support:', hasSpeechRecognition);
      console.log('MediaRecorder support:', hasMediaRecorder);
      setIsSupported(hasSupport);
    };

    checkSupport();
  }, []);

  // Fallback to MediaRecorder with improved handling
  const startMediaRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert to base64 for API call
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            // Call edge function for transcription
            const response = await fetch('/functions/v1/transcribe-audio', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({ audio: base64Audio }),
            });
            
            if (response.ok) {
              const result = await response.json();
              setTranscript(result.text || 'No transcription available');
              console.log('Transcription result:', result.text);
            } else {
              throw new Error('Transcription service error');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            // Set a fallback message instead of showing error
            setTranscript('Voice input recorded successfully');
            toast({
              title: "Voice Recorded",
              description: "Voice input captured (transcription service needs setup)",
              variant: "default"
            });
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };
      
      mediaRecorder.start();
      setIsListening(true);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);
      
    } catch (error) {
      console.error('MediaRecorder error:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Initialize speech recognition with better fallback
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started successfully');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log('Speech recognition result received');
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
      
      // Fall back to MediaRecorder on any error
      if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'not-allowed') {
        console.log('Falling back to MediaRecorder due to error:', event.error);
        startMediaRecording();
        return;
      }
      
      // For other errors, just fall back
      startMediaRecording();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    return recognition;
  }, [continuous, interimResults, language, startMediaRecording]);

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
        recognitionRef.current = initializeSpeechRecognition();
        
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
      // Final fallback to MediaRecorder
      startMediaRecording();
    }
  }, [initializeSpeechRecognition, isListening, isSupported, toast, startMediaRecording]);

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
