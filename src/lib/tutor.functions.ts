import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

// Module 5: AI Tutor. Explains lessons, encourages learners, gives feedback.
// Strictly scoped to Tamil language learning per requirements.

const Input = z.object({
  question: z.string().min(1).max(500),
  uiLang: z.enum(["en", "hi"]),
  context: z.string().max(500).optional(),
});

export const askTutor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI tutor is not configured.");

    const langName = data.uiLang === "hi" ? "Hindi" : "English";
    const system =
      `You are a warm, encouraging Tamil-language tutor for children and beginners. ` +
      `Reply ONLY in ${langName}. Keep replies to 1-3 short sentences. ` +
      `Help with Tamil letters (Uyir Ezhuthu, Mei Ezhuthu), words, pronunciation, and meanings. ` +
      `Always include the Tamil script when relevant. Never discuss topics outside Tamil learning.`;

    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      system,
      prompt: data.context ? `Context: ${data.context}\n\nLearner asks: ${data.question}` : data.question,
    });
    return { reply: text };
  });
