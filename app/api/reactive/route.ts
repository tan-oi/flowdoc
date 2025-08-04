import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message, type } = await req.json();
  
  const systemPrompt = Buffer.from(process.env.REACTIVITY_SYSTEM_PROMPT_BASE64 || "", "base64").toString("utf-8");
  console.log(systemPrompt);
  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });
  console.log(text);
  return NextResponse.json({ htmlContent: text });
}
