import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";

// Screen 2: Language Selection. Per spec: English, Hindi.
export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose Language — Kural AI" },
      { name: "description", content: "Choose English or Hindi to start learning Tamil." },
    ],
  }),
  component: LanguageScreen,
});

function LanguageScreen() {
  const { setLang, t } = useI18n();
  const navigate = useNavigate();

  function pick(l: "en" | "hi") {
    setLang(l);
    navigate({ to: "/home" });
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10" style={{ background: "var(--gradient-sky)" }}>
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-black text-foreground">{t("pick_language")}</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">Choose a language to continue</p>
        <div className="mt-8 grid gap-4">
          <button
            onClick={() => pick("en")}
            className="group flex items-center justify-between rounded-3xl border-2 border-border bg-card px-6 py-5 text-left shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
          >
            <div>
              <p className="text-2xl font-black">English</p>
              <p className="text-sm font-semibold text-muted-foreground">Learn Tamil through English</p>
            </div>
            <span className="text-3xl">🇬🇧</span>
          </button>
          <button
            onClick={() => pick("hi")}
            className="group flex items-center justify-between rounded-3xl border-2 border-border bg-card px-6 py-5 text-left shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
          >
            <div>
              <p className="text-2xl font-black hindi">हिंदी</p>
              <p className="text-sm font-semibold text-muted-foreground hindi">हिंदी से तमिल सीखें</p>
            </div>
            <span className="text-3xl">🇮🇳</span>
          </button>
        </div>
      </div>
    </div>
  );
}
