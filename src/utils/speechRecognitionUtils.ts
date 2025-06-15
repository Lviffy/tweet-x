
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

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      console.log('Final transcript:', finalTranscript);
      onResult(finalTranscript);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
    onEnd();
  };

  return recognition;
};
