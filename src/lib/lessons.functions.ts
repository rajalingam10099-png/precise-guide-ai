import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Reads reference content. Public (anon SELECT allowed on these tables).
export const listLessons = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("lessons")
    .select("id, module, letter, word, english, hindi, emoji, order_index")
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listWordPuzzles = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("word_puzzles")
    .select("id, parts, answer, english, hindi, emoji, order_index")
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Per-learner: mark a lesson complete.
export const markLessonComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ lessonId: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("completed_lessons")
      .upsert({ user_id: context.userId, lesson_id: data.lessonId }, { onConflict: "user_id,lesson_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
