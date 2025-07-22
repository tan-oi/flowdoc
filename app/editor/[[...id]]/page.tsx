import { Toolbar } from "@/components/toolbar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EditorProvider } from "@/components/editor-provider";
import AiChat from "@/components/ai-chat";
import Tiptap from "@/components/tiptap";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDocuments } from "@/lib/functions/document";

export default async function Editor({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  console.log((await params).id?.[0]);
  let id = (await params).id?.[0] || null;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);

  if (!session) {
    redirect("/");
  }

  let content = null;
  if (!id) {
    id = crypto.randomUUID();
  } else {
    const response = await getDocuments(session?.user?.id as string, id);
    content = response?.content;
    console.log(content);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <EditorProvider>
         <div className="flex-shrink-0">
          <Toolbar>
            <SidebarTrigger />
          </Toolbar> 
        </div>

        <div className="flex-1 flex gap-1 p-1 min-h-0 p-3">
          <Tiptap id={id} data={content} />
          <AiChat id={id} />
        </div>
      </EditorProvider>
    </div>
  );
}
