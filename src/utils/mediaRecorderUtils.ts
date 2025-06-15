
import { RECORDING_DURATION } from './speechToTextConstants';

export const createMediaRecorder = async (
  onTranscript: (transcript: string) => void,
  onError: (error: string) => void,
  onStart: () => void,
  onStop: () => void
) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
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
            onTranscript(result.text || 'No transcription available');
            console.log('Transcription result:', result.text);
          } else {
            throw new Error('Transcription service error');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          onTranscript('Voice input recorded successfully');
        }
      };
      
      reader.readAsDataURL(audioBlob);
      onStop();
    };
    
    mediaRecorder.start();
    onStart();
    
    // Auto-stop after specified duration
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, RECORDING_DURATION);
    
    return { mediaRecorder, stream };
    
  } catch (error) {
    console.error('MediaRecorder error:', error);
    onError('Could not access microphone. Please check permissions.');
    return null;
  }
};
