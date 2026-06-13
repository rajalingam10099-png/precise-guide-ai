import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, X, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n";
import { getTtsProvider } from "@/services/tts";
import { askTutor } from "@/lib/tutor.functions";

type Msg = { role: "tutor" | "user"; text: string };

export function AiTutorWidget({ context }: { context?: string }) {
  const { t, lang } = useI18n();
  const ask = useServerFn(askTutor);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "tutor", text: t("tutor_hello") }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs((m) => (m.length <= 1 ? [{ role: "tutor", text: t("tutor_hello") }] : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs, open]);

  async function submit() {
    const q = input.trim();
    if (!q || busy) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { question: q, uiLang: lang, context } });
      setMsgs((m) => [...m, { role: "tutor", text: res.reply }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "tutor", text: (e as Error).message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          aria-label={t("ai_tutor")}
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-tutor text-tutor-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <header className="flex items-center justify-between border-b border-border bg-tutor px-4 py-3 text-tutor-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold">{t("ai_tutor")}</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </header>
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-foreground"
                  }
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.role === "tutor" && (
                    <button
                      onClick={() => void getTtsProvider().speak(m.text, lang === "hi" ? "hi-IN" : "ta-IN")}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-tutor"
                    >
                      <Volume2 className="h-3 w-3" /> {t("listen")}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="text-xs text-muted-foreground">…</div>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex items-center gap-2 border-t border-border bg-background p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("ask_placeholder")}
              className="flex-1 rounded-full border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              aria-label={t("send")}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
