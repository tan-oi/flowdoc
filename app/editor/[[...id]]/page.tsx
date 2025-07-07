
import { Toolbar } from "@/components/toolbar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EditorProvider } from "@/components/editor-provider";
import AiChat from "@/components/ai-chat";
import Tiptap from "@/components/tiptap";

export default async function Editor({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  console.log((await params).id?.[0]);
  let id = (await params).id?.[0] || null;
  let content = null;
  if (!id) {
    // content = {
    //   type: "doc",
    //   content: [
    //     {
    //       type: "paragraph",
    //       content: [
    //         {
    //           type: "text",
    //           text: "hey ssup man? i hope you're fine asf.",
    //         },
    //       ],
    //     },
    //   ],
    // };
    id = crypto.randomUUID();
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <EditorProvider>
        <div className="flex-shrink-0">
          <Toolbar>
            <SidebarTrigger />
          </Toolbar>
        </div>

        <div className="flex-1 flex gap-1 p-1 min-h-0">
          <Tiptap id={id} data={content} />
          <AiChat id={id} />
        </div>
      </EditorProvider>
    </div>
  );
}
