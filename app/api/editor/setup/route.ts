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

      if (!document)
        return NextResponse.json(
          {
            error: "Document not found!",
            notFound: true,
          },
          {
            status: 404,
          }
        );

      return NextResponse.json({
        correctId: document.id,
        document: document,
        isFirstDocument: false,
      });
    }

    const recentDocument = await getDocument(userId, undefined);

    if (recentDocument) {
      return NextResponse.json({
        correctId: recentDocument.id,
        document: recentDocument,
        isFirstDocument: false,
      });
    }

    const createNewDocument = await createTempDocument(userId);
    return NextResponse.json({
      correctId: createNewDocument.id,
      document: createNewDocument,
      isFirstDocument: true,
    });
  } catch (error) {
    console.error("Error in editor setup:", error);

    const tempDoc = await createTempDocument(userId);
    return NextResponse.json({
      correctId: tempDoc.id,
      document: tempDoc,
      isFirstDocument: true,
    });
  }
}
