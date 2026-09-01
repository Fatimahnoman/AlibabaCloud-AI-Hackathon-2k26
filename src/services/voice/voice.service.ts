export interface STTProvider {
  readonly name: string;
  transcribe(audio: Blob, options?: { language?: string }): Promise<STTResult>;
  isAvailable(): boolean;
  stop(): void;
}

export interface STTResult {
  text: string;
  confidence: number;
  language: string;
}

export interface TTSProvider {
  readonly name: string;
  synthesize(text: string, options?: { language?: string; voice?: string; rate?: number }): Promise<TTSResult>;
  isAvailable(): boolean;
  stop(): void;
}

export interface TTSResult {
  audioUrl: string;
  duration: number;
}

export class BrowserSTTProvider implements STTProvider {
  readonly name = 'browser';
  // eslint-disable-next-line
  private recognition: any = null;
  // eslint-disable-next-line
  private resolvePromise: ((value: STTResult) => void) | null = null;

  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as unknown as Record<string, unknown>;
    return 'SpeechRecognition' in w || 'webkitSpeechRecognition' in w;
  }

  async transcribe(
    _audio: Blob,
    options?: { language?: string }
  ): Promise<STTResult> {
    if (!this.isAvailable()) {
      throw new Error('Speech recognition not supported in this browser. Use Chrome or Edge.');
    }

    if (this.recognition) {
      this.stop();
      await new Promise((r) => setTimeout(r, 200));
    }

    return new Promise<STTResult>((resolve, reject) => {
      this.resolvePromise = resolve;

      const w = window as unknown as Record<string, unknown>;
      const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
      // eslint-disable-next-line
      const recognition = new (SpeechRecognitionAPI as any)();
      this.recognition = recognition;

      recognition.lang = this.mapLanguage(options?.language || 'auto');
      recognition.continuous = false;
      recognition.interimResults = false;

      // eslint-disable-next-line
      recognition.onresult = (event: any) => {
        const result = event.results[0];
        if (result && result[0]) {
          this.cleanup();
          resolve({
            text: result[0].transcript,
            confidence: result[0].confidence || 0.8,
            language: options?.language || 'en-US',
          });
        } else {
          this.cleanup();
          reject(new Error('No speech detected. Please try again.'));
        }
      };

      // eslint-disable-next-line
      recognition.onerror = (event: any) => {
        const error = event.error;
        this.cleanup();

        if (error === 'not-allowed') {
          reject(new Error('Microphone access denied. Please allow microphone in browser settings.'));
        } else if (error === 'no-speech') {
          reject(new Error('No speech detected. Please try again.'));
        } else if (error === 'audio-capture') {
          reject(new Error('No microphone found. Please connect a microphone.'));
        } else if (error === 'network') {
          reject(new Error('Network error. Check your internet connection.'));
        } else {
          reject(new Error(`Speech recognition error: ${error}`));
        }
      };

      recognition.onend = () => {
        if (this.resolvePromise) {
          this.cleanup();
          reject(new Error('Speech recognition ended without detecting speech. Please try again.'));
        }
      };

      try {
        recognition.start();
      } catch (e) {
        this.cleanup();
        reject(new Error('Failed to start speech recognition. Please try again.'));
      }
    });
  }

  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.cleanup();
    }
  }

  // eslint-disable-next-line
  private cleanup(): any {
    const oldResolve = this.resolvePromise;
    this.recognition = null;
    this.resolvePromise = null;
    return oldResolve;
  }

  private mapLanguage(lang: string): string {
    const map: Record<string, string> = {
      auto: 'en-US',
      english: 'en-US',
      urdu: 'ur-PK',
      roman_urdu: 'en-US',
      hindi: 'hi-IN',
    };
    return map[lang] || 'en-US';
  }
}

export class BrowserTTSProvider implements TTSProvider {
  readonly name = 'browser';

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  async synthesize(
    text: string,
    options?: { language?: string; voice?: string; rate?: number }
  ): Promise<TTSResult> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Speech synthesis not supported in this browser.'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.mapLanguage(options?.language || 'auto');
      utterance.rate = options?.rate || 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (options?.voice) {
        const voiceName = options.voice;
        const voice = voices.find(
          (v) => v.name === voiceName || v.lang.startsWith(voiceName)
        );
        if (voice) utterance.voice = voice;
      } else {
        const langVoice = voices.find((v) => v.lang.startsWith(utterance.lang.split('-')[0]));
        if (langVoice) utterance.voice = langVoice;
      }

      utterance.onend = () => {
        resolve({ audioUrl: '', duration: text.length * 50 });
      };

      // eslint-disable-next-line
      utterance.onerror = (event: any) => {
        reject(new Error(`TTS error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    window.speechSynthesis?.cancel();
  }

  private mapLanguage(lang: string): string {
    const map: Record<string, string> = {
      auto: 'en-US',
      english: 'en-US',
      urdu: 'ur-PK',
      roman_urdu: 'ur-PK',
      hindi: 'hi-IN',
    };
    return map[lang] || 'en-US';
  }
}

let sttInstance: STTProvider | null = null;
let ttsInstance: TTSProvider | null = null;

export function getSTTProvider(): STTProvider {
  if (sttInstance) return sttInstance;
  sttInstance = new BrowserSTTProvider();
  return sttInstance;
}

export function getTTSProvider(): TTSProvider {
  if (ttsInstance) return ttsInstance;
  ttsInstance = new BrowserTTSProvider();
  return ttsInstance;
}

export function isVoiceAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return getSTTProvider().isAvailable() || getTTSProvider().isAvailable();
}
