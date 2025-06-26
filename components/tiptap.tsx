"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorContext } from "./editor-provider";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

const Tiptap = () => {
  const { setEditor } = useEditorContext();

  const editor = useEditor({
    immediatelyRender : false,
    extensions: [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5",
          },
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Underline,
    ],
    content: "Hello World",
    autofocus: true,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none h-full p-4",
      },
    },
    onCreate : ({
      editor
    }) => {
      setEditor(editor);
    }
    
  });

 

  return (
    <>
    
    <div className="bg-secondary/30 flex-[2.5] border rounded-lg shadow-sm overflow-y-auto h-full">
      <EditorContent className="h-full" editor={editor} />
    </div>
    </>
  );
};

export default Tiptap;




