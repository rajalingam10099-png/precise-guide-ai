import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Screen 1: Splash. Auto-advances to language selection.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kural AI — Learn Tamil" },
      { name: "description", content: "AI-powered Tamil learning app. Letters, words, pronunciation, and quizzes." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/language" }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center">
        <div
          className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-[2.5rem] text-6xl text-primary-foreground shadow-[var(--shadow-soft)] tamil"
          style={{ background: "var(--gradient-sun)" }}
        >
          க
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Kural AI</h1>
        <p className="mt-2 text-base font-semibold text-muted-foreground">Learn Tamil the joyful way</p>
        <div className="mt-8 flex justify-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-secondary" />
        </div>
      </div>
    </div>
  );
}
