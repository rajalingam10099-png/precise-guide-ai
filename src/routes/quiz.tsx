import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getQuizPool, type Difficulty, type LessonItem } from "@/data/tamil";
import { useI18n } from "@/lib/i18n";
import { recordQuizScore } from "@/lib/progress";

// Screen 6 + Module 6: Quiz Mode. Easy/Medium/Hard. Flow: image -> question
// -> options -> select -> validate -> result.
export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — Kural AI" },
      { name: "description", content: "Test your Tamil with picture quizzes. Easy, medium and hard levels." },
    ],
  }),
  component: QuizScreen,
});

const QUIZ_LEN = 5;

function QuizScreen() {
  const { t, lang } = useI18n();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [seed, setSeed] = useState(0);

  if (!difficulty) {
    return (
      <AppShell title={t("quiz")}>
        <h2 className="mb-2 text-2xl font-black">{t("difficulty")}</h2>
        <p className="mb-5 text-sm font-semibold text-muted-foreground">{t("start_quiz")}</p>
        <div className="grid gap-3">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="flex items-center justify-between rounded-3xl border-2 border-border bg-card p-5 text-left shadow-[var(--shadow-soft)]"
            >
              <span className="text-xl font-black capitalize">{t(d)}</span>
              <span className="text-2xl">{d === "easy" ? "🌱" : d === "medium" ? "🌿" : "🌳"}</span>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("quiz")}>
      <QuizRound
        key={seed}
        difficulty={difficulty}
        lang={lang}
        onExit={() => setDifficulty(null)}
        onRestart={() => setSeed((s) => s + 1)}
      />
    </AppShell>
  );
}

function QuizRound({ difficulty, lang, onExit, onRestart }: { difficulty: Difficulty; lang: "en" | "hi"; onExit: () => void; onRestart: () => void }) {
  const { t } = useI18n();
  const questions = useMemo(() => buildQuestions(difficulty), [difficulty]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[i];

  function choose(opt: LessonItem) {
    if (selected) return;
    setSelected(opt.id);
    if (opt.id === q.answer.id) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= questions.length) {
      recordQuizScore(difficulty, score, questions.length);
      setDone(true);
      return;
    }
    setI(i + 1);
    setSelected(null);
  }

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="text-5xl">🏆</p>
        <h2 className="mt-2 text-2xl font-black">{t("finish")}</h2>
        <p className="mt-1 text-4xl font-black">{score} / {questions.length}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={onExit} className="rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold">{t("back")}</button>
          <button onClick={onRestart} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{t("try_again")}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="uppercase">{t(difficulty)}</span>
        <span>{i + 1} / {questions.length}</span>
      </div>
      <article className="rounded-3xl border-2 border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="grid place-items-center rounded-2xl p-8 text-8xl" style={{ background: "var(--gradient-sky)" }}>
          {q.answer.emoji}
        </div>
        <p className="mt-3 text-center text-sm font-bold uppercase tracking-wide text-muted-foreground">{t("what_image")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {q.options.map((opt) => {
            const isCorrect = opt.id === q.answer.id;
            const picked = selected === opt.id;
            const reveal = selected !== null;
            return (
              <button
                key={opt.id}
                onClick={() => choose(opt)}
                disabled={selected !== null}
                className={
                  "rounded-2xl border-2 p-4 text-center shadow-[var(--shadow-soft)] " +
                  (reveal && isCorrect
                    ? "border-success bg-success/20"
                    : reveal && picked
                    ? "border-destructive bg-destructive/15"
                    : "border-border bg-card")
                }
              >
                <p className="text-3xl tamil font-black">{opt.word}</p>
                <p className={"mt-1 text-xs font-semibold text-muted-foreground " + (lang === "hi" ? "hindi" : "")}>
                  {lang === "hi" ? opt.hindi : opt.english}
                </p>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 flex justify-end">
            <button onClick={next} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              {i + 1 >= questions.length ? t("finish") : t("next")}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}

function buildQuestions(difficulty: Difficulty) {
  const pool = getQuizPool(difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, QUIZ_LEN);
  return shuffled.map((answer) => {
    const distractors = pool
      .filter((p) => p.id !== answer.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
    return { answer, options };
  });
}
