import type { SpeechRecognitionProvider, RecognitionResult } from "./types";

type SR = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: { results: Array<Array<{ transcript: string; confidence: number }>> }) => void;
  onerror: (e: { error?: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

function getCtor(): (new () => SR) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const browserSpeechProvider: SpeechRecognitionProvider = {
  name: "browser-web-speech",
  isSupported() {
    return Boolean(getCtor());
  },
  listenOnce(lang: string): Promise<RecognitionResult> {
    return new Promise((resolve, reject) => {
      const Ctor = getCtor();
      if (!Ctor) return reject(new Error("Speech recognition unsupported in this browser."));
      const rec = new Ctor();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const r = e.results[0]?.[0];
        resolve({ transcript: r?.transcript ?? "", confidence: r?.confidence ?? 0 });
      };
      rec.onerror = (e) => reject(new Error(e.error ?? "speech-error"));
      rec.onend = () => {};
      rec.start();
    });
  },
};
