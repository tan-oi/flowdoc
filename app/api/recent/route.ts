import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    console.log(session, "in recent route");
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
  
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '15');
  
  
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      select: { 
        id: true, 
        title: true, 
        updatedAt : true,
      },
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit
    });
  
    return NextResponse.json(documents, {
      status : 200
    });
  }
  catch(err) {
    // return NextResponse.error
  }
  
}