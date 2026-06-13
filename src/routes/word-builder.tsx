import { createFileRoute } from "@tanstack/react-router";
import { Check, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { wordPuzzles } from "@/data/tamil";
import { useI18n } from "@/lib/i18n";
import { speak } from "@/lib/speech";

// Module 3: Word Builder. Flow per spec — display letters, user combines, validate, display correct word.
export const Route = createFileRoute("/word-builder")({
  head: () => ({
    meta: [
      { title: "Word Builder — Kural AI" },
      { name: "description", content: "Combine Tamil letters to form words. Practice word formation." },
    ],
  }),
  component: WordBuilderScreen,
});

function WordBuilderScreen() {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const puzzle = wordPuzzles[idx];
  const shuffled = useMemo(() => [...puzzle.parts].sort(() => Math.random() - 0.5), [puzzle.id]);
  const [picked, setPicked] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");

  const builtWord = picked.map((i) => shuffled[i]).join("");

  function pick(i: number) {
    if (picked.includes(i)) return;
    setPicked([...picked, i]);
    setStatus("idle");
  }

  function reset() {
    setPicked([]);
    setStatus("idle");
  }

  function check() {
    if (builtWord === puzzle.answer) {
      setStatus("right");
      speak(puzzle.answer);
    } else {
      setStatus("wrong");
    }
  }

  function nextPuzzle() {
    setIdx((i) => (i + 1) % wordPuzzles.length);
    setPicked([]);
    setStatus("idle");
  }

  return (
    <AppShell title={t("word_builder")} context={`Word builder target: ${puzzle.answer} (${puzzle.english})`}>
      <p className="mb-4 text-sm font-bold text-muted-foreground">{t("build_word")}</p>
      <article className="rounded-3xl border-2 border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="grid place-items-center rounded-2xl bg-muted p-6 text-7xl">{puzzle.emoji}</div>
        <p className="mt-3 text-center text-sm font-bold text-muted-foreground">
          {puzzle.english} · <span className="hindi">{puzzle.hindi}</span>
        </p>

        <div className="mt-5 min-h-16 rounded-2xl border-2 border-dashed border-border bg-background p-4 text-center text-4xl tamil">
          {builtWord || <span className="text-muted-foreground">_</span>}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {shuffled.map((p, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={picked.includes(i)}
              className="rounded-2xl border-2 border-border bg-secondary px-5 py-3 text-3xl tamil shadow-[var(--shadow-soft)] disabled:opacity-30"
            >
              {p}
            </button>
          ))}
        </div>

        {status === "right" && (
          <div className="mt-4 rounded-2xl bg-success/20 p-4 text-center font-bold">{t("correct")}</div>
        )}
        {status === "wrong" && (
          <div className="mt-4 rounded-2xl bg-destructive/15 p-4 text-center font-bold">
            {t("wrong")} <span className="tamil">{puzzle.answer}</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold">
            <RotateCcw className="h-4 w-4" /> {t("reset")}
          </button>
          {status !== "right" ? (
            <button onClick={check} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              <Check className="h-4 w-4" /> {t("check")}
            </button>
          ) : (
            <button onClick={nextPuzzle} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              {t("next")}
            </button>
          )}
        </div>
      </article>
    </AppShell>
  );
}
