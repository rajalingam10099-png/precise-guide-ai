import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Difficulty = z.enum(["easy", "medium", "hard"]);

export const recordQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ difficulty: Difficulty, score: z.number().int().min(0), total: z.number().int().min(1) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("quiz_scores").insert({
      user_id: context.userId,
      difficulty: data.difficulty,
      score: data.score,
      total: data.total,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
