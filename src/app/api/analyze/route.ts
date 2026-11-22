import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { globalRateLimiter } from "@/utils/rateLimiter";
import { analyzeHybrid } from "@/core/engine/hybridAnalyzer";

const RequestSchema = z.object({
  text: z
    .string()
    .min(1, "Text cannot be empty")
    .max(4000, "Text exceeds maximum 4000 characters"),
  persona: z
    .enum(["senior_citizen", "college_student", "small_merchant"])
    .default("senior_citizen"),
  language: z.enum(["en", "hi"]).default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = globalRateLimiter.isRateLimited(ip);

    if (rateCheck.limited) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before submitting more queries.",
          retryAfterMs: rateCheck.resetMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { text, persona, language } = parseResult.data;
    const analysis = await analyzeHybrid(text, persona, language);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error("KavachAI API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis." },
      { status: 500 }
    );
  }
}
