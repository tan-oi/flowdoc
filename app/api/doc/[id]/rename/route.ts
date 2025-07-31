import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiRateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
  ) {
    const header = await headers();
    const ip = header.get("x-forwarded-for")

    const {success, limit, remaining,
    reset} = await apiRateLimiter.limit(
        ip ?? "127.0.0.1"
    );

    if(!success) {
        const retryAfter = Math.round((reset - Date.now())/ 1000);

        return NextResponse.json({
            message :  `you're on a renaming spree dude, chillax, retry after ${retryAfter.toString()}`
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
  try {
    const { title, userId } = await req.json();
    console.log(userId);
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      redirect("/");
    }

    const updateTitle = await prisma.document.update({
      where: {
        id : id,
        userId: session?.user?.id,
      },
      data: {
        title: title,
      },
    });

    return NextResponse.json({
      message: "true",
      updateTitle,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
        message : "Renaming failed, try again later!"
    }, {
        status : 500
    })
  }
}
