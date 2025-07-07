"use client";
import { BubbleMenu } from "@tiptap/react";
import { Button } from "./ui/button";
import { useEditorContext } from "./editor-provider";
import { diffWords } from "diff";

const newtext = `ababababs`;
export function BubbleMenuComponent() {
  const { editor } = useEditorContext();
  if (!editor) return null;

  return (
    <>
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 10,

          offset: [0, 8],
          placement: "top-end",
          arrow: false,
          maxWidth: "none",
        }}
      >
        <div className="flex items-center gap-1 bg-popover border rounded-md p-1 shadow-lg">
          <Button
            size="sm"
            variant={editor.isActive("bold") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Bold
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("italic") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Italic
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const { from, to } = editor.state.selection;
              const text = editor.state.doc.textBetween(from, to, " ");
              const type = "replace";
              const changePayload = diffWords(text, newtext);

              editor.view.dispatch(
                editor.state.tr.setMeta("createDiff", {
                  from,
                  to,
                  changePayload,
                  type,
                })
              );

              // editor.chain().focus().insertContentAt(
              // {from, to},newtext).run();
            }}
          >
            replace
          </Button>
        </div>
      </BubbleMenu>
    </>
  );
}
