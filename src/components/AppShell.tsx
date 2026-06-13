import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Mic, Brain, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n, type UiLang } from "@/lib/i18n";
import { AiTutorWidget } from "./AiTutorWidget";

export function AppShell({ children, title, context }: { children: ReactNode; title?: string; context?: string }) {
  const { t, lang, setLang } = useI18n();
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/home" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground text-lg font-black tamil">க</span>
            <span className="text-lg font-black tracking-tight">{t("app_name")}</span>
          </Link>
          <div className="flex items-center gap-2">
            {title && <span className="hidden sm:block text-sm font-bold text-muted-foreground">{title}</span>}
            <select
              aria-label={t("language")}
              value={lang}
              onChange={(e) => setLang(e.target.value as UiLang)}
              className="rounded-xl border border-border bg-card px-2 py-1 text-sm font-bold"
            >
              <option value="en">EN</option>
              <option value="hi">हि</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <nav className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
        <NavItem to="/home" icon={<Home className="h-5 w-5" />} label={t("home")} />
        <NavItem to="/lesson/uyir" icon={<BookOpen className="h-5 w-5" />} label={t("uyir")} />
        <NavItem to="/pronunciation" icon={<Mic className="h-5 w-5" />} label={t("pronunciation")} />
        <NavItem to="/quiz" icon={<Brain className="h-5 w-5" />} label={t("quiz")} />
        <NavItem to="/progress" icon={<BarChart3 className="h-5 w-5" />} label={t("progress")} />
      </nav>

      <AiTutorWidget context={context} />
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
