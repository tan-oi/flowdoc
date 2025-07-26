import { auth } from "@/auth";
import { createTempDocument } from "@/lib/functions/document";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST() {
   const session = await auth.api.getSession({
    headers : await headers(),
   });

   if(!session || !session?.user) redirect("/")

   const userId = session?.user?.id;

   const response = await createTempDocument(userId);

   console.log(response);

   return NextResponse.json(response);
}