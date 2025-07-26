import { auth } from "@/auth";
import { getDocument } from "@/lib/functions/document";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { history, docState } = await request.json();
  const { id } = await params;
  
  try {
    await Promise.all([
      prisma.document.update({
        where: {
          id,
        },
        data: {
          content: docState,
        },
      }),
     
      prisma.history.createMany({
        data: history.map((doc: any) => ({
          prompt: doc.prompt,
          content: doc.content,
          type: doc.type,
          createdAt: new Date(doc.createdAt),
          docId: id
        })),
        skipDuplicates: true,
      }),
    ]);
    
    return NextResponse.json({
      success: "true"
    }, {
      status: 200
    });
   
  } catch (err) {
    return NextResponse.json({
      success: "false",
      error: err
    }, {
      status: 500
    });
  }
}