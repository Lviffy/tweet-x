
import { RECORDING_DURATION } from './speechToTextConstants';

export const createMediaRecorder = async (
  onTranscript: (transcript: string) => void,
  onError: (error: string) => void,
  onStart: () => void,
  onStop: () => void
) => {
  try {
    console.log('Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    console.log('Microphone access granted, creating MediaRecorder...');
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('Audio chunk received, size:', event.data.size);
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      console.log('MediaRecorder stopped, processing audio...');
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log('Audio blob created, size:', audioBlob.size);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        console.log('Audio converted to base64, length:', base64Audio?.length);
        
        try {
          console.log('Sending audio to transcription service...');
          const response = await fetch('/functions/v1/transcribe-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHpicGh5d3VyYWdxdnFxZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTIzMzEsImV4cCI6MjA2NTQ4ODMzMX0.lPbYz5o6N-BKJrWbQ1MEenOtSdgV2XKufuTEJmS9wQ0`
            },
            body: JSON.stringify({ audio: base64Audio }),
          });
          
          console.log('Transcription response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Transcription result:', result);
            onTranscript(result.text || 'Voice input recorded successfully');
          } else {
            console.error('Transcription service error, status:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            onTranscript('Voice input recorded but transcription failed');
          }
        } catch (error) {
          console.error('Transcription request error:', error);
          onTranscript('Voice input recorded successfully');
        }
      };
      
      reader.readAsDataURL(audioBlob);
      onStop();
    };
    
    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      onError('Recording failed');
    };
    
    console.log('Starting MediaRecorder...');
    mediaRecorder.start();
    onStart();
    
    // Auto-stop after specified duration
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        console.log('Auto-stopping recording after timeout');
        mediaRecorder.stop();
      }
    }, RECORDING_DURATION);
    
    return { mediaRecorder, stream };
    
  } catch (error) {
    console.error('MediaRecorder setup error:', error);
    onError('Could not access microphone. Please check permissions.');
    return null;
  }
};
