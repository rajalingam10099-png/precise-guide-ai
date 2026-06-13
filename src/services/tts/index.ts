import { browserTtsProvider } from "./browser-provider";
import { googleTtsProvider } from "./google-provider";
import type { TextToSpeechProvider } from "./types";

export type { TextToSpeechProvider } from "./types";

const providers = {
  browser: browserTtsProvider,
  google: googleTtsProvider,
} as const;

let active: TextToSpeechProvider = providers.browser;

export function getTtsProvider(): TextToSpeechProvider {
  return active;
}

export function setTtsProvider(name: keyof typeof providers) {
  active = providers[name];
}
