"use client";
import { BubbleMenu } from "@tiptap/react";
import { Button } from "./ui/button";
import { useEditorContext } from "./editor-provider";
import { diffWords } from "diff";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  BoldIcon,
  Heading1,
  Heading2,
  Italic,
  LucideQuote,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { Toggle } from "./ui/toggle";

export function BubbleMenuComponent() {
  const { editor } = useEditorContext();
  if (!editor) return null;

  return (
    <>
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: [500, 0],

          offset: [0, 8],
          placement: "top-end",
          arrow: true,
          maxWidth: "none",
        }}
      >
        <div className="bg-background backdrop-blur-xl border border-gray-700/50 rounded-lg p-1 flex items-center gap-2 shadow-2xl shadow-black/50">
          <Toggle
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            aria-label="Toggle bold"
            className=""
          >
            {" "}
            <Bold />
          </Toggle>

          <Toggle
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            aria-label="Toggle Italic"
            className=""
          >
            {" "}
            <Italic />
          </Toggle>

          <Toggle
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            aria-label="Toggle Italic"
            className=""
          >
            {" "}
            <Underline />
          </Toggle>

          <Toggle
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            disabled={!editor.can().chain().focus().toggleBlockquote().run()}
            aria-label="Toggle Blockquote"
          >
            <Quote />
          </Toggle>

          <Toggle
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            aria-label="Toggle Italic"
            className=""
          >
            {" "}
            <Strikethrough />
          </Toggle>

          {/* <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const { from, to } = editor.state.selection;
              console.log(from, to);

              const text = editor.state.doc.textBetween(from, to, " ");

              const slice = editor.state.doc.slice(from, to);
              console.log(slice);
              const jsonContent = {
                type: "doc",
                content: slice.content.toJSON(),
              };

              const html = generateHTML(jsonContent, [StarterKit]);

              console.log(html);
              const type = "replace";
          
              editor.view.dispatch(
                editor.state.tr.setMeta("createDiff", {
                  from,
                  to,
                  payload: {
                    changePayload: newtext,
                    originalPayload: text,
                  },
                  type,
                  replaceType: "inplace",
                })
              );
            }}
          > 
            replace
          </Button> */}
        </div>
      </BubbleMenu>
    </>
  );
}
