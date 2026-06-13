
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin','learner');
CREATE TYPE public.ui_lang AS ENUM ('en','hi');
CREATE TYPE public.difficulty AS ENUM ('easy','medium','hard');
CREATE TYPE public.lesson_module AS ENUM ('uyir','mei');

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_lang public.ui_lang NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile select own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profile insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profile update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========================
-- USER_ROLES
-- =========================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles select own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================
-- LESSONS (reference)
-- =========================
CREATE TABLE public.lessons (
  id text PRIMARY KEY,
  module public.lesson_module NOT NULL,
  letter text NOT NULL,
  word text NOT NULL,
  english text NOT NULL,
  hindi text NOT NULL,
  emoji text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons public read" ON public.lessons FOR SELECT TO anon, authenticated USING (true);

-- =========================
-- WORD_PUZZLES (reference)
-- =========================
CREATE TABLE public.word_puzzles (
  id text PRIMARY KEY,
  parts text[] NOT NULL,
  answer text NOT NULL,
  english text NOT NULL,
  hindi text NOT NULL,
  emoji text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.word_puzzles TO anon, authenticated;
GRANT ALL ON public.word_puzzles TO service_role;
ALTER TABLE public.word_puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puzzles public read" ON public.word_puzzles FOR SELECT TO anon, authenticated USING (true);

-- =========================
-- COMPLETED_LESSONS
-- =========================
CREATE TABLE public.completed_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.completed_lessons TO authenticated;
GRANT ALL ON public.completed_lessons TO service_role;
ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Completed select own" ON public.completed_lessons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Completed insert own" ON public.completed_lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Completed delete own" ON public.completed_lessons FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================
-- QUIZ_SCORES
-- =========================
CREATE TABLE public.quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty public.difficulty NOT NULL,
  score int NOT NULL CHECK (score >= 0),
  total int NOT NULL CHECK (total > 0),
  taken_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quiz_scores TO authenticated;
GRANT ALL ON public.quiz_scores TO service_role;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz select own" ON public.quiz_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Quiz insert own" ON public.quiz_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================
-- PRONUNCIATION_SCORES
-- =========================
CREATE TABLE public.pronunciation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word text NOT NULL,
  accuracy int NOT NULL CHECK (accuracy BETWEEN 0 AND 100),
  pronunciation int NOT NULL CHECK (pronunciation BETWEEN 0 AND 100),
  mispronounced text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pronunciation_scores TO authenticated;
GRANT ALL ON public.pronunciation_scores TO service_role;
ALTER TABLE public.pronunciation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pron select own" ON public.pronunciation_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Pron insert own" ON public.pronunciation_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================
-- PROFILE TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'learner') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
