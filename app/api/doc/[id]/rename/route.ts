import { auth } from "@/auth";
import { useAnalytics } from "@/lib/posthog-server";
import { prisma } from "@/lib/prisma";
import { apiRateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function PATCH(
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
      endpoint: "/api/document/rename",
      ip: ip ?? "127.0.0.1",
      retry_after: retryAfter,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        message: `you're on a renaming spree dude, chillax, retry after ${retryAfter.toString()}`,
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
    const { title } = await req.json();
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      redirect("/");
    }

    if (!title || title.trim().length === 0) {
      await flush();
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    track("rename_started", session.user.id, {
      document_id: id,
      toBeUpdated: title,
      request_id: requestId,
    });

    const updateTitle = await prisma.document.update({
      where: {
        id: id,
        userId: "123",
      },
      data: {
        title: title.trim(),
      },
      select: {
        title: true,
        id: true,
      },
    });

    track("rename_completed", session.user.id, {
      document_id: id,
      updatedTitle: updateTitle.title,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json({
      message: "true",
      updateTitle,
    });
  } catch (err) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    trackError(err as Error, session?.user?.id || "anonymous", {
      endpoint: "/api/document/rename",
      document_id: (await params).id,
      request_id: requestId,
    });

    await flush();

    return NextResponse.json(
      {
        message: "Renaming failed, try again later!",
      },
      {
        status: 500,
      }
    );
  }
}
