import { auth } from "@/auth";
import { createTempDocument } from "@/lib/functions/document";
import { createAnalytics } from "@/lib/posthog-server";
import { apiRateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const { track, trackError, flush } = createAnalytics();
  const header = await headers();
  const ip = header.get("x-forwarded-for");
  const requestId = crypto.randomUUID();

  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    track("rate_limit_hit", "anonymous", {
      endpoint: "/api/doc/create",
      ip: ip ?? "127.0.0.1",
      retry_after: retryAfter,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        message: `Enough creating new docs, now how about you start writing? Still if you want try again after ${retryAfter.toString()}s`,
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
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session || !session?.user) {
      await flush();
      return NextResponse.json(
        {
          message: "unauthorized, try logging in!",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    track("create_document_started", userId, {
      request_id: requestId,
    });

    const response = await createTempDocument(userId);

    track("create_document_completed", userId, {
      document_id: response.id,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(response);
  } catch (err) {
    const session = await auth.api.getSession({
      headers: header,
    });

    trackError(err as Error, session?.user?.id || "anonymous", {
      endpoint: "/api/doc/create",
      request_id: requestId,
    });

    await flush();

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
