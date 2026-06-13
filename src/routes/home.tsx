import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";

// Screen 3: Home. Per spec must show Uyir, Mei, Word Builder, Pronunciation, Quiz, Progress.
export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Kural AI" },
      { name: "description", content: "Pick a Tamil learning module: vowels, consonants, word builder, pronunciation, quiz or progress." },
    ],
  }),
  component: HomeScreen,
});

function HomeScreen() {
  const { t } = useI18n();
  const tiles = [
    { to: "/lesson/uyir", title: t("uyir"), desc: t("uyir_desc"), emoji: "அ", bg: "bg-primary/30" },
    { to: "/lesson/mei", title: t("mei"), desc: t("mei_desc"), emoji: "க்", bg: "bg-secondary/40" },
    { to: "/word-builder", title: t("word_builder"), desc: t("word_builder_desc"), emoji: "🧩", bg: "bg-accent/40" },
    { to: "/pronunciation", title: t("pronunciation"), desc: t("pronunciation_desc"), emoji: "🎤", bg: "bg-primary/20" },
    { to: "/quiz", title: t("quiz"), desc: t("quiz_desc"), emoji: "🧠", bg: "bg-secondary/30" },
    { to: "/progress", title: t("progress"), desc: t("progress_desc"), emoji: "📈", bg: "bg-accent/30" },
  ] as const;

  return (
    <AppShell title={t("home")}>
      <section className="mb-6 rounded-3xl p-6 text-foreground shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-sun)" }}>
        <p className="text-sm font-bold uppercase tracking-wider opacity-70">{t("app_name")}</p>
        <h1 className="mt-1 text-3xl font-black">{t("tagline")}</h1>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`rounded-3xl border-2 border-border ${tile.bg} p-4 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5`}
          >
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-card text-3xl tamil">{tile.emoji}</div>
            <p className="text-base font-black leading-tight">{tile.title}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{tile.desc}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
