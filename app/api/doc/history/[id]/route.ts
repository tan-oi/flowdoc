import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session) {
        return NextResponse.json({
            error: "Unauthorized"
        }, { status: 401 })
    }

    const history = await prisma.history.findMany({
        where: {
            docId: id
        }
    })

    return NextResponse.json(history);
}