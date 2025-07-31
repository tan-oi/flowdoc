import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    console.log("API route called");

    const { messages } = await req.json();
    console.log(messages);
    const result = await streamText({
      model: google("gemini-2.5-flash-preview-04-17"),
      system: "you're a helpful agent",
      messages,
    });

    return result.toDataStreamResponse();
  } 

  catch (error:any) {
    console.error("Detailed API Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return new Response(
      JSON.stringify({
        error: "API Error",
        message: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

