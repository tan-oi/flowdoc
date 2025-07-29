import { auth } from "@/auth";
import { createTempDocument } from "@/lib/functions/document";
import { apiRateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const header = await headers();
  const ip = header.get("x-forwarded-for")
  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if(!success) {
    const retryAfter = Math.round((reset - Date.now())/1000);

    return NextResponse.json({
      message : `Enough creating new docs, now how about you start writing? Still if you want try again after ${retryAfter.toString()}s`
    }, {
      status : 429,
      headers :{
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After" : retryAfter.toString()
      }
    })
  }
  try {
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session || !session?.user) return NextResponse.json({
      message : "unauthorized, try logging in!"
    }, {
      status : 401
    })

    const userId = session?.user?.id;

    const response = await createTempDocument(userId);

    console.log(response);

    return NextResponse.json(response);
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      {
        message: "failed to create document",
      },
      {
        status: 500,
      }
    );
  }
}
