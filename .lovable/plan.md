
# Kural AI — Stack Adaptation Plan

Adapts the original Flutter / FastAPI / Whisper / Google TTS design to Lovable's supported stack. **No application requirement, module, screen, workflow, or user flow is changed.** Speech I/O is abstracted behind provider interfaces so Whisper / Google TTS can be plugged in later without touching screens or business logic.

---

## 1. Updated Architecture

### Layered view

```text
┌─────────────────────────────────────────────────────────┐
│  CLIENT  (React + TypeScript, TanStack Router/Start)    │
│  - 7 Screens (unchanged)                                │
│  - i18n (English / Hindi)                               │
│  - SpeechService facade  ◄── provider-agnostic          │
│  - TTSService facade     ◄── provider-agnostic          │
│  - Progress store (reads via server fns)                │
└──────────────┬──────────────────────────────────────────┘
               │ typed RPC (createServerFn)
               ▼
┌─────────────────────────────────────────────────────────┐
│  SERVER  (Cloudflare Worker via TanStack server fns)    │
│  - tutor.functions.ts      → AI Tutor (Module 5)        │
│  - lessons.functions.ts    → Uyir / Mei / Words content │
│  - pronunciation.functions.ts → Score + persist         │
│  - quiz.functions.ts       → Quiz fetch + record score  │
│  - progress.functions.ts   → Read user progress         │
│  - stt/  (provider adapters: browser, whisper-stub)     │
│  - tts/  (provider adapters: browser, googletts-stub)   │
└──────────────┬───────────────────────┬──────────────────┘
               │                       │
               ▼                       ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│  Lovable AI Gateway      │   │  Supabase (Lovable Cloud)│
│  google/gemini-3-flash   │   │  - Auth (anon learner ok)│
│  → AI Tutor replies      │   │  - Postgres + RLS        │
└──────────────────────────┘   │  - Tables (see §2)       │
                               └──────────────────────────┘
```

### Speech provider abstraction (key design decision)

A single interface on the client, a single interface on the server. Today the default adapter is the browser Web Speech API; later we swap to Whisper / Google TTS by changing one factory line. Screens never import a provider directly.

```text
SpeechRecognitionProvider          TextToSpeechProvider
─────────────────────────          ─────────────────────
+ isSupported(): boolean           + isSupported(): boolean
+ listenOnce(lang): Promise<       + speak(text, lang,
    { transcript, confidence,        voice?): Promise<void>
      audioBlob? }>                + cancel(): void

Default impls (today):              Future impls (drop-in):
- BrowserSpeechProvider             - WhisperSpeechProvider
- BrowserTTSProvider                - GoogleTTSProvider
                                    (call server fn that calls
                                     Whisper/Google with key)
```

Pronunciation scoring stays a pure function (`scorePronunciation(target, spoken)`) called server-side after the transcript is produced, so it is independent of which STT provider produced the transcript.

### Request flow (Pronunciation Practice example)

```text
User taps Mic
  → SpeechService.listenOnce("ta-IN")          [client adapter]
  → transcript returned
  → submitPronunciation({ word, transcript })  [server fn]
      → scorePronunciation(target, transcript) [pure]
      → insert into pronunciation_scores       [Supabase, RLS]
  → { accuracy, pronunciation, mispronounced, feedback } back to UI
```

---

## 2. Database Schema (Supabase)

All learner data is per-user, protected by RLS. Static content (letters, puzzles) lives in code as the source of truth, but is mirrored to read-only reference tables so the AI Tutor and future admin tooling can query it. **Entities match the original spec exactly** — Completed Lessons, Quiz Scores, Pronunciation Scores — nothing added, nothing removed.

### Enums

- `app_role` — `'admin' | 'learner'`
- `ui_lang`  — `'en' | 'hi'`
- `difficulty` — `'easy' | 'medium' | 'hard'`
- `lesson_module` — `'uyir' | 'mei'`

### Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per `auth.users.id`. Stores chosen UI language. | `id (uuid PK = auth.uid)`, `ui_lang`, `created_at` |
| `user_roles` | Roles in a separate table (security best practice). | `id`, `user_id`, `role app_role`, unique (user_id, role) |
| `lessons` | Reference data for Uyir + Mei letters (Modules 1 & 2). | `id text PK`, `module lesson_module`, `letter`, `word`, `english`, `hindi`, `emoji`, `order_index` |
| `word_puzzles` | Reference data for Word Builder (Module 3). | `id text PK`, `parts text[]`, `answer`, `english`, `hindi`, `emoji`, `order_index` |
| `completed_lessons` | Module 8 — Completed Lessons. | `id`, `user_id`, `lesson_id → lessons.id`, `completed_at`, unique (user_id, lesson_id) |
| `quiz_scores` | Module 8 — Quiz Scores. | `id`, `user_id`, `difficulty`, `score int`, `total int`, `taken_at` |
| `pronunciation_scores` | Module 8 — Pronunciation Scores (Module 4 output). | `id`, `user_id`, `word`, `accuracy int`, `pronunciation int`, `mispronounced text`, `recorded_at` |

### RLS posture

- `lessons`, `word_puzzles`: `SELECT` to `authenticated` and `anon` (public reference data).
- `profiles`, `completed_lessons`, `quiz_scores`, `pronunciation_scores`: `SELECT/INSERT/UPDATE` only `WHERE user_id = auth.uid()`.
- `user_roles`: `SELECT` for the owner; writes via security-definer `has_role()` only.
- Standard `GRANT` block per table (auth/admin/service_role) included in the migration.

### Auth model

Per spec ("No other user roles are required") we use Supabase Auth with **anonymous sign-in** so a learner can use the app immediately without forms. A `profiles` row is created via trigger on `auth.users` insert. No login screen is added (would be a feature outside the spec).

### Why mirror static content to tables

- AI Tutor (Module 5) can answer "what does ஆடு mean?" by querying `lessons` instead of hard-coding context per request.
- Progress (Module 8) joins `completed_lessons → lessons` for nice display.
- Future content updates don't require a code deploy.

---

## 3. Application Folder Structure

```text
src/
├── routes/                        # File-based routes (TanStack Router)
│   ├── __root.tsx                 # Shell + I18nProvider + AuthBootstrap
│   ├── index.tsx                  # Screen 1: Splash
│   ├── language.tsx               # Screen 2: Language Selection
│   ├── home.tsx                   # Screen 3: Home
│   ├── lesson.$module.tsx         # Screen 4: Lesson (Modules 1 & 2)
│   ├── word-builder.tsx           # Module 3
│   ├── pronunciation.tsx          # Screen 5: Pronunciation
│   ├── quiz.tsx                   # Screen 6: Quiz Mode
│   ├── progress.tsx               # Screen 7: Progress
│   ├── sitemap[.]xml.ts           # SEO
│   └── api/                       # (reserved for future webhooks)
│
├── components/
│   ├── AppShell.tsx               # Header, bottom nav, layout
│   ├── AiTutorWidget.tsx          # Module 5 (always visible)
│   ├── lesson/LessonCard.tsx
│   ├── lesson/PronounceButton.tsx # Uses SpeechService
│   ├── quiz/QuizRound.tsx
│   ├── word-builder/PuzzleBoard.tsx
│   ├── progress/ProgressCards.tsx
│   └── ui/...                     # shadcn primitives (existing)
│
├── features/                      # Domain logic per module
│   ├── lessons/                   # Module 1 + 2
│   ├── word-builder/              # Module 3
│   ├── pronunciation/             # Module 4
│   ├── tutor/                     # Module 5
│   ├── quiz/                      # Module 6
│   └── progress/                  # Module 8
│
├── services/                      # Provider abstractions
│   ├── speech/
│   │   ├── types.ts               # SpeechRecognitionProvider interface
│   │   ├── browser-provider.ts    # Default (Web Speech API)
│   │   ├── whisper-provider.ts    # Stub; throws "not configured"
│   │   └── index.ts               # getSpeechProvider() factory
│   └── tts/
│       ├── types.ts               # TextToSpeechProvider interface
│       ├── browser-provider.ts    # Default (SpeechSynthesis)
│       ├── google-provider.ts     # Stub; throws "not configured"
│       └── index.ts               # getTtsProvider() factory
│
├── lib/                           # Cross-cutting
│   ├── i18n.tsx                   # Module 7 (English / Hindi)
│   ├── ai-gateway.server.ts       # Lovable AI provider helper
│   ├── tutor.functions.ts         # Module 5 server fn (Gemini)
│   ├── lessons.functions.ts       # Read reference content
│   ├── pronunciation.functions.ts # Score + persist (Module 4 + 8)
│   ├── quiz.functions.ts          # Quiz fetch + record (Module 6 + 8)
│   ├── progress.functions.ts      # Read progress (Module 8)
│   ├── scoring.ts                 # Pure scorePronunciation()
│   └── utils.ts
│
├── data/
│   └── tamil.ts                   # Seed source for migrations
│
├── integrations/supabase/         # Generated by Lovable Cloud
│   ├── client.ts                  # Browser client
│   ├── client.server.ts           # Admin client (server only)
│   ├── auth-middleware.ts         # requireSupabaseAuth
│   └── auth-attacher.ts           # Bearer attacher
│
├── hooks/
├── start.ts                       # functionMiddleware: [attachSupabaseAuth]
├── router.tsx
└── styles.css                     # Design system
```

Server-only code lives in `*.server.ts` or inside `.handler()` bodies of `*.functions.ts`. Provider stubs (`whisper-provider.ts`, `google-provider.ts`) are pure client TypeScript: they throw a typed `ProviderNotConfiguredError` and document the env keys they will need (`OPENAI_API_KEY` / `GOOGLE_TTS_KEY`) when activated.

---

## 4. Screen Structure (unchanged — all 7 screens)

| # | Screen | Route | Spec items shown | Notes |
|---|---|---|---|---|
| 1 | Splash | `/` | App identity, brief load | Auto-advances to `/language`. |
| 2 | Language Selection | `/language` | English, Hindi | Writes `profiles.ui_lang`, then → `/home`. |
| 3 | Home | `/home` | Uyir Ezhuthu · Mei Ezhuthu · Word Builder · Pronunciation Practice · Quiz · Progress | One tile per spec item. AI Tutor widget visible. |
| 4 | Lesson | `/lesson/$module` (`uyir` \| `mei`) | Letter · Image · Word · Translation (EN+HI) · Audio · AI Tutor | Implements Module 1 flow for `uyir`, Module 2 flow for `mei`. Uses `TTSService` for audio, `SpeechService` for "user repeats", server fn scores and persists. |
| 5 | Pronunciation | `/pronunciation` | Record Button · Pronunciation Result · Score · Feedback | Implements Module 4. Output: Accuracy %, Pronunciation Score, Mispronounced Portion, Correction Feedback — exactly as spec. |
| 6 | Quiz | `/quiz` | Image · Question · Options · Result; Easy/Medium/Hard | Implements Module 6. Records to `quiz_scores`. |
| 7 | Progress | `/progress` | Completed Lessons · Quiz Scores · Pronunciation Scores | Implements Module 8. Reads from Supabase via server fn. Shows only the three metrics named in the spec. |

Cross-cutting (not separate screens):
- **Module 5 AI Tutor** — `AiTutorWidget` overlay rendered by `AppShell`, present on Screens 3–7.
- **Module 7 Multilingual** — language selector in header on every screen; persisted to `profiles.ui_lang` and `localStorage`.

---

## Module → Implementation Map (verification)

| Module | Implementation surface |
|---|---|
| 1 Uyir Ezhuthu | `lesson.$module.tsx` (`uyir`) + `lessons` table + `TTSService` + `SpeechService` |
| 2 Mei Ezhuthu | `lesson.$module.tsx` (`mei`) + same |
| 3 Word Builder | `word-builder.tsx` + `word_puzzles` table |
| 4 Pronunciation Checker | `pronunciation.tsx` + `SpeechService` + `pronunciation.functions.ts` (`scorePronunciation`) → `pronunciation_scores` |
| 5 AI Tutor | `AiTutorWidget` + `tutor.functions.ts` (Lovable AI Gateway, Gemini) |
| 6 Quiz Mode | `quiz.tsx` + `quiz.functions.ts` → `quiz_scores` |
| 7 Multilingual | `i18n.tsx` + `profiles.ui_lang` |
| 8 Progress Tracking | `progress.tsx` + `progress.functions.ts` reading the three tables only |

---

## What will NOT be added (explicit guardrails)

No social, no chat rooms, no community, no payments, no subscriptions, no marketplace, no AR/VR, no leaderboards, no rewards, no games outside Quiz Mode, no extra user roles beyond Learner, no extra screens, no extra modules.

---

## Awaiting approval

If you approve, the next step will be, in order:
1. Enable Lovable Cloud (Supabase).
2. Create the migration (enums, tables, RLS, GRANTs, seed of `lessons` + `word_puzzles` from `data/tamil.ts`, anon-sign-in profile trigger).
3. Move existing screens onto server fns + `services/speech` + `services/tts` providers.
4. Verify each of the 7 screens still matches the spec.
