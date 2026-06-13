// Text-to-Speech (TTS) provider interface.
// Swap implementations (browser SpeechSynthesis, Google Cloud TTS) without touching screens.

export interface TextToSpeechProvider {
  readonly name: string;
  isSupported(): boolean;
  speak(text: string, lang?: string, voice?: string): Promise<void>;
  cancel(): void;
}
