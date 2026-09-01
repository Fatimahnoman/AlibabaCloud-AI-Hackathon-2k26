export type VoiceProvider = 'whisper' | 'elevenlabs' | 'google' | 'azure';

export interface SpeechToTextRequest {
  audio: Blob | File;
  language?: string;
}

export interface SpeechToTextResponse {
  text: string;
  confidence: number;
  language: string;
  duration: number;
}

export interface TextToSpeechRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
  format: string;
}
