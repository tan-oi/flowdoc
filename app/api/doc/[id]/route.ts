import { auth } from "@/auth";
import { getDocument } from "@/lib/functions/document";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiRateLimiter } from "@/lib/rate-limiter";
import { useAnalytics } from "@/lib/posthog-server";

interface Docs {
  prompt: string;
  content: string;
  type: "text" | "chart" | "reactive";
  createdAt: string;
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const header = await headers();
  const ip = header.get("x-forwarded-for");

  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        message: "stop spamming mate",
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

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await getDocument(session.user.id, id);
  return NextResponse.json(document);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { track, trackError, flush } = useAnalytics();
  const header = await headers();
  const ip = header.get("x-forwarded-for");
  const requestId = crypto.randomUUID();

  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    track("rate_limit_hit", "anonymous", {
      endpoint: "/api/doc/save",
      ip: ip ?? "127.0.0.1",
      retry_after: retryAfter,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        message: `you gotta stop spamming bro, try saving again after ${retryAfter.toString()}`,
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
    const { history, docState } = await request.json();
    const { id } = await params;

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

    track("document_save_started", session.user.id, {
      document_id: id,
      has_content: docState !== null && docState !== undefined,
      has_history: Array.isArray(history) && history.length > 0,
      history_count: Array.isArray(history) ? history.length : 0,
      save_type: "manual",
      request_id: requestId,
    });

    const promises = [];

    if (docState !== null && docState !== undefined) {
      promises.push(
        prisma.document.update({
          where: {
            id,
            userId: session.user.id,
          },
          data: {
            content: docState,
            type: "perma",
          },
        })
      );
    }

    if (
      history !== null &&
      history !== undefined &&
      Array.isArray(history) &&
      history.length > 0
    ) {
      promises.push(
        prisma.history.createMany({
          data: history.map((doc: Docs) => ({
            prompt: doc.prompt,
            content: doc.content,
            type: doc.type,
            createdAt: new Date(doc.createdAt),
            docId: id,
          })),
          skipDuplicates: true,
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    track("document_save_completed", session.user.id, {
      document_id: id,
      operations_count: promises.length,
      save_type: "manual",
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        success: "true",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    const session = await auth.api.getSession({
      headers: header,
    });

    trackError(err as Error, session?.user?.id || "anonymous", {
      endpoint: "/api/doc/save",
      document_id: (await params).id,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        success: "false",
        error: "Failed to save document",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { track, trackError, flush } = useAnalytics();
  const header = await headers();
  const ip = header.get("x-forwarded-for");
  const requestId = crypto.randomUUID();

  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    track("rate_limit_hit", "anonymous", {
      endpoint: "/api/doc/delete",
      ip: ip ?? "127.0.0.1",
      retry_after: retryAfter,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        message: `You seem to be spamming, try again after a little later after ${retryAfter.toString()}s`,
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
    const { id } = await params;
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

    track("delete_document_started", session.user.id, {
      document_id: id,
      request_id: requestId,
    });

    await prisma.document.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    track("delete_document_completed", session.user.id, {
      document_id: id,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json({ success: true });
  } catch (err) {
    const session = await auth.api.getSession({
      headers: header,
    });

    trackError(err as Error, session?.user?.id || "anonymous", {
      endpoint: "/api/doc/delete",
      document_id: (await params).id,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        message: "Failed to delete document",
      },
      {
        status: 500,
      }
    );
  }
}
