import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Module 8 read: returns ONLY the three metrics specified by the requirements.
export const getProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [completedRes, quizRes, pronRes] = await Promise.all([
      supabase
        .from("completed_lessons")
        .select("lesson_id, completed_at, lessons(letter, word, module)")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false }),
      supabase
        .from("quiz_scores")
        .select("difficulty, score, total, taken_at")
        .eq("user_id", userId)
        .order("taken_at", { ascending: false })
        .limit(20),
      supabase
        .from("pronunciation_scores")
        .select("word, accuracy, pronunciation, mispronounced, recorded_at")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(20),
    ]);
    if (completedRes.error) throw new Error(completedRes.error.message);
    if (quizRes.error) throw new Error(quizRes.error.message);
    if (pronRes.error) throw new Error(pronRes.error.message);
    return {
      completedLessons: completedRes.data ?? [],
      quizScores: quizRes.data ?? [],
      pronunciationScores: pronRes.data ?? [],
    };
  });
