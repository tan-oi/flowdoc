"use client";
import { BubbleMenu } from "@tiptap/react";
import { Button } from "./ui/button";
import { useEditorContext } from "./editor-provider";
import { diffWords } from "diff";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

const newtext = `The Sidemen are a UK-based YouTube collective of seven creators: KSI (Olajide Olatunji), Miniminter (Simon Minter), Zerkaa (Josh Bradley), TBJZL (Tobi Brown), Behzinga (Ethan Payne), Vikkstar123 (Vikram Barn), and W2S (Harry Lewis).`;
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
              //on continous clicks of replace it keeps adding the diffs up. gotta limit it to one.

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
          </Button>
        </div>
      </BubbleMenu>
    </>
  );
}
