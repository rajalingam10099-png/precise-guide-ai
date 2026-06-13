import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scorePronunciation } from "./scoring";

// Module 4 server boundary: score transcript against target, persist score.
export const submitPronunciation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ word: z.string().min(1).max(64), transcript: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const result = scorePronunciation(data.word, data.transcript);
    const { error } = await context.supabase.from("pronunciation_scores").insert({
      user_id: context.userId,
      word: data.word,
      accuracy: result.accuracy,
      pronunciation: result.pronunciation,
      mispronounced: result.mispronounced,
    });
    if (error) throw new Error(error.message);
    return { ...result, transcript: data.transcript };
  });
