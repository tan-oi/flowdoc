import { NextRequest, NextResponse } from "next/server";
import { getDocument, createTempDocument } from "@/lib/functions/document";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const { requestedId } = await request.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let document = null;

  const userId = session?.user?.id as string;
  try {
    if (requestedId) {
      document = await getDocument(userId, requestedId);
    }

    if (!document) {
      document = await getDocument(userId, undefined);

      if (!document) {
        document = await createTempDocument(userId);
      }
    }

    return NextResponse.json({
      correctId: document.id,
      document: document,
    });
  } catch (error) {
    console.error("Error in editor setup:", error);

    const tempDoc = await createTempDocument(userId);
    return NextResponse.json({
      correctId: tempDoc.id,
      document: tempDoc,
    });
  }
}
