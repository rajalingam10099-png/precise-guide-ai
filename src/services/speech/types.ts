// Speech Recognition (STT) provider interface.
// Swap implementations (browser, Whisper, etc.) without touching screens.

export type RecognitionResult = {
  transcript: string;
  confidence: number;
  audioBlob?: Blob;
};

export interface SpeechRecognitionProvider {
  readonly name: string;
  isSupported(): boolean;
  listenOnce(lang: string): Promise<RecognitionResult>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string, missing: string[]) {
    super(`${provider} is not configured. Missing: ${missing.join(", ")}`);
    this.name = "ProviderNotConfiguredError";
  }
}
