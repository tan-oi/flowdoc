 import Tiptap from "@/components/tiptap";
import { Toolbar } from "@/components/toolbar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EditorProvider } from "@/components/editor-provider";
import { Chat } from "@/components/ai-chat";

export default function Editor() {
  return (
    <div className="h-full">
      <EditorProvider>
        <div className="h-full flex flex-col gap-2">
          <Toolbar>
            <SidebarTrigger />
          </Toolbar>
          
          <div className="flex-1 flex gap-2 h-full">
            <Tiptap />
            <div className="flex-1 border-l bg-background p-4 rounded-lg">
             
              <Chat/>
            </div>

            
          </div>
        </div>
      </EditorProvider>
    </div>
  );
}