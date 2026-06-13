import { browserSpeechProvider } from "./browser-provider";
import { whisperSpeechProvider } from "./whisper-provider";
import type { SpeechRecognitionProvider } from "./types";

export type { SpeechRecognitionProvider, RecognitionResult } from "./types";
export { ProviderNotConfiguredError } from "./types";

// Provider registry. Switch active provider here to enable Whisper later.
const providers = {
  browser: browserSpeechProvider,
  whisper: whisperSpeechProvider,
} as const;

let active: SpeechRecognitionProvider = providers.browser;

export function getSpeechProvider(): SpeechRecognitionProvider {
  return active;
}

export function setSpeechProvider(name: keyof typeof providers) {
  active = providers[name];
}
