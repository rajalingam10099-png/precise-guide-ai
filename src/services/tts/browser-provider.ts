import type { TextToSpeechProvider } from "./types";

export const browserTtsProvider: TextToSpeechProvider = {
  name: "browser-speech-synthesis",
  isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  },
  speak(text, lang = "ta-IN") {
    return new Promise((resolve) => {
      if (!this.isSupported()) return resolve();
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.85;
        u.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find((vv) => vv.lang?.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
          ?? voices.find((vv) => vv.lang === lang);
        if (v) u.voice = v;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      } catch {
        resolve();
      }
    });
  },
  cancel() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  },
};
