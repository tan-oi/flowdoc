import { auth } from "@/auth";
import { checkDailyLimit, incrementUsage } from "@/lib/daily-limit";
import { createAnalytics } from "@/lib/posthog-server";
import { generateLLMLimiter } from "@/lib/rate-limiter";
import { reactiveBlockSchema, staticBlockSchema } from "@/lib/schema";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const header = await headers();
  const { flush, track, trackError } = createAnalytics();
  const ip = header.get("x-forwarded-for");
  const requestId = crypto.randomUUID();
  const { success, limit, remaining, reset } = await generateLLMLimiter.limit(
    ip ?? "127.0.0.1"
  );
  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    track("rate_limit_hit", "anonymous", {
      endpoint: "/api/document/rename",
      ip: ip ?? "127.0.0.1",
      retry_after: retryAfter,
      request_id: requestId,
    });

    flush();

    return NextResponse.json(
      {
        error: "api_abuse",
        message: `Chillax dude, take a breather, try again in like ${retryAfter.toString()}s`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }
  try {
    const { messages, type, id } = await req.json();

    if (!messages || !type) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Both messages and type are required",
        },
        { status: 400 }
      );
    }

    console.time("getSession");
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.timeEnd("getSession");
    if (!session) {
      return NextResponse.json(
        {
          message: "unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.time("checkDailyLimit");
    const limitCheck = await checkDailyLimit(session?.user.id);
    console.timeEnd("checkDailyLimit");
    if (!limitCheck.ok) {
      track("daily_limit_hit", session?.user?.id, {
        limit: limitCheck.limit,
      });

      flush();
      return NextResponse.json(
        {
          error: "daily_limit_exceeded",
          message: limitCheck.error || "Daily limit exhausted",
          used: limitCheck.used,
          limit: limitCheck.limit,
        },
        { status: 429 }
      );
    }

    const modeltobeUsed = process.env.MODEL_NAME || "gemini-2.5-flash";
    const limitedMessages = messages.slice(-10);
    track("llm_call_start", session.user.id, {
      model: modeltobeUsed,
      type: type,
      messageLength: limitedMessages.length,
    });

    const staticPrompt = Buffer.from(
      process.env.STATIC_SYSTEM_PROMPT_BASE64 || "",
      "base64"
    ).toString("utf-8");
    const reactivePrompt = Buffer.from(
      process.env.REACTIVE_SYSTEM_PROMPT_BASE64 || "",
      "base64"
    ).toString("utf-8");
    const result = await generateObject({
      model: google(modeltobeUsed),
      temperature: 0.5,
      schema:
        type === "static" ? staticBlockSchema : (reactiveBlockSchema as any),
      system: type === "static" ? staticPrompt : reactivePrompt,
      messages: limitedMessages,
      experimental_repairText: async (option) => {
        const cleaned = option.text
          .replace(/^```json\s*/i, "")
          .replace(/```$/, "")
          .trim();

        return cleaned;
      },
    });
    console.timeEnd("llm_inference");

    track("llm_call_finished", session.user.id, {
      model: modeltobeUsed,
      type,
      content: result?.object,
      finishReason: result?.finishReason,
      tokensCount: result.usage,
    });

    flush();
    incrementUsage(session.user.id);
    return result.toJsonResponse();
  } catch (err) {
    console.log(err);

    trackError(err as Error, "id", {
      endpoint: "/api/generate",
      //@ts-expect-error "idk"
      errCause: err?.cause?.name,
      //@ts-expect-error "idk"
      finishReason: err?.finishReason,
      //@ts-expect-error "idk"
      usage: err?.usage,
    });

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
