import { generateLLMLimiter } from "@/lib/rate-limiter";
import { reactiveBlockSchema, staticBlockSchema } from "@/lib/schema";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log(process.env.STATIC_SYSTEM_PROMPT);
  const header = await headers();
  const ip = header.get("x-forwarded-for");
  const { success, limit, remaining, reset } = await generateLLMLimiter.limit(
    ip ?? "127.0.0.1"
  );
  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    return NextResponse.json(
      {
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
    const { messages, type } = await req.json();
    if (!messages || !type) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Both messages and type are required",
        },
        { status: 400 }
      );
    }

    console.log("the type in the api route is", type);
    // const schemeToBe =
    //   type === "static" ? staticBlockSchema : reactiveBlockSchema;
    const limitedMessages = messages.slice(-10);
    console.log(limitedMessages);
    const staticPrompt = Buffer.from(
      process.env.STATIC_SYSTEM_PROMPT_BASE64 || "",
      "base64"
    ).toString("utf-8");
    const reactivePrompt = Buffer.from(
      process.env.REACTIVE_SYSTEM_PROMPT_BASE64 || "",
      "base64"
    ).toString("utf-8");
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema:
        type === "static" ? staticBlockSchema : (reactiveBlockSchema as any),
      system: type === "static" ? staticPrompt : reactivePrompt,
      messages: limitedMessages,
    });
    return result.toJsonResponse();
  } catch (err) {
    console.log(err);
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
