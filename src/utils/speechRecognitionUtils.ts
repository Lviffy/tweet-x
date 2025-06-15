
export const checkSpeechRecognitionSupport = () => {
  const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const hasMediaRecorder = 'MediaRecorder' in window;
  console.log('Speech recognition support:', hasSpeechRecognition);
  console.log('MediaRecorder support:', hasMediaRecorder);
  return hasSpeechRecognition || hasMediaRecorder;
};

export const createSpeechRecognition = (
  continuous: boolean,
  interimResults: boolean,
  language: string,
  onStart: () => void,
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) => {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.log('Speech Recognition not available');
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
    onStart();
  };

  recognition.onresult = (event) => {
    console.log('Speech recognition result received');
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      
      if (result.isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Use final transcript if available, otherwise use interim
    const resultTranscript = finalTranscript || interimTranscript;
    if (resultTranscript.trim()) {
      console.log('Transcript result:', resultTranscript);
      onResult(resultTranscript);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    
    // Handle network errors by falling back to MediaRecorder
    if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      console.log('Falling back to MediaRecorder due to error:', event.error);
      onError('fallback');
    } else {
      onError(event.error);
    }
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
    onEnd();
  };

  return recognition;
};
