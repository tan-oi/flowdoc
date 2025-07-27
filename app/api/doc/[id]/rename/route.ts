import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function PATCH(req : Request,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const {title, userId} = await req.json()

    const { id } = await params;
     const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session) {
        redirect("/")
    }

    const updateTitle = await prisma.document.update({
        where : {
                id,
                userId : session?.user?.id
        }, 
        data :{
            title : title
        }
    })


    return NextResponse.json({
        message : "true",
        updateTitle
    })
}