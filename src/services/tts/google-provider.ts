import { ProviderNotConfiguredError } from "../speech/types";
import type { TextToSpeechProvider } from "./types";

// PLACEHOLDER: Google Cloud Text-to-Speech adapter.
// When activating, implement a server fn that calls Google Cloud TTS REST API
// using GOOGLE_TTS_API_KEY, returns base64 audio bytes, and have this provider
// play the returned audio via HTMLAudioElement.
// Required server secret: GOOGLE_TTS_API_KEY.
export const googleTtsProvider: TextToSpeechProvider = {
  name: "google-tts",
  isSupported() {
    return false;
  },
  async speak(): Promise<never> {
    throw new ProviderNotConfiguredError("Google TTS", ["GOOGLE_TTS_API_KEY", "audio playback wiring"]);
  },
  cancel() {},
};
