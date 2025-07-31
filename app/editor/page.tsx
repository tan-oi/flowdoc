export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import EditorClient from "@/components/editor-client";
import { Suspense } from "react";

export default async function Editor() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log(session);
  if (!session) redirect("/");
  
  return (
    <>
      <div>
        <Suspense fallback={<div></div>}>
          <EditorClient userId={session.user.id} />
        </Suspense>
      </div>
    </>
  );
}
