import { ProviderNotConfiguredError, type SpeechRecognitionProvider } from "./types";

// PLACEHOLDER: Whisper STT adapter.
// When activating, implement audio capture (MediaRecorder) and POST the blob
// to a server fn that calls Whisper / OpenAI / another STT provider, returning
// { transcript, confidence }. Required server secret: OPENAI_API_KEY (or vendor key).
export const whisperSpeechProvider: SpeechRecognitionProvider = {
  name: "whisper",
  isSupported() {
    return false;
  },
  async listenOnce(): Promise<never> {
    throw new ProviderNotConfiguredError("Whisper STT", ["OPENAI_API_KEY", "audio capture wiring"]);
  },
};
