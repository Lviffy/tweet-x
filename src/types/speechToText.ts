
export interface SpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export interface SpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}
