import { auth } from "@/auth";
import { getDocument } from "@/lib/functions/document";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiRateLimiter } from "@/lib/rate-limiter";

interface Docs {
  prompt : string;
  content : string;
  type : "text" | "chart" | "reactive";
  createdAt : string;
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const  header = await headers();
  const ip = header.get("x-forwarded-for")
  
  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);

    return NextResponse.json({
      message : "stop spamming mate"
    }, {
      status : 429,
      headers : {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After" : retryAfter.toString()
      }
    })

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
  const  header = await headers();
  const ip = header.get("x-forwarded-for")
  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);
  
    return NextResponse.json({
      message : `you gotta stop spamming bro, try saving again after ${retryAfter.toString()}`, 
    }, {
      status : 429,
      headers : {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After" : retryAfter.toString()
      }
    })

  
  }

  const { history, docState } = await request.json();
  const { id } = await params;

  try {
    const promises = [];

    if (docState !== null && docState !== undefined) {
      promises.push(
        prisma.document.update({
          where: {
            id,
          },
          data: {
            content: docState,
            type : "perma"
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

    return NextResponse.json(
      {
        success: "true",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: "false",
        error: err,
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
  const  header = await headers();
  const ip = header.get("x-forwarded-for")
  console.log(ip)
  const { success, limit, remaining, reset } = await apiRateLimiter.limit(
    ip ?? "127.0.0.1"
  );

  if (!success) {
    const retryAfter = Math.round((reset - Date.now()) / 1000);
  
    return NextResponse.json({
      message : `You seem to be spamming, try again after a little later after ${retryAfter.toString()}s`
    }, {
      status : 429,
      headers : {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
        "Retry-After" : retryAfter.toString()
      }
    })
   
  }

  const { id } = await params;

   await prisma.document.delete({
    where: {
      id,
    },
  });

  return NextResponse.json("success : true");
}
