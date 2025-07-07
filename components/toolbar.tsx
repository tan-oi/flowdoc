"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  ImageIcon,
  ChevronDown,
  Code2,
  ListOrderedIcon,
  LucideQuote,
  LucideItalic,
} from "lucide-react";
import { Separator } from "./ui/separator";

import { useEditorContext } from "./editor-provider";
import { Toggle } from "./ui/toggle";

interface ToolbarProps {
  children?: React.ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  const { editor } = useEditorContext();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      forceUpdate({});
    };

    editor.on("selectionUpdate", updateHandler);
    editor.on("transaction", updateHandler);

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("transaction", updateHandler);
    };
  }, [editor]);

  if (!editor) return null;
  return (
    <div className="flex items-center gap-2 border-b p-2">
      <div className="flex items-center">
        {children}
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-6"
        />
      </div>

      <div className="flex items-center gap-1">
        <Toggle
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          B
        </Toggle>

        <Toggle
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-label="Toggle Italic"
        >
          <LucideItalic />
        </Toggle>

        <Toggle
          className="gap-0"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Toggle Heading1"
        >
          H<sub className="text-xs">1</sub>
        </Toggle>

        <Toggle
          className="gap-0"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Toggle Heading2"
        >
          H<sub className="text-xs">2</sub>
        </Toggle>

        <Toggle
          className="gap-0"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-label="Toggle Heading3"
        >
          H<sub className="text-xs">3</sub>
        </Toggle>

        <Toggle
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          aria-label="Toggle Underline"
        >
          <span className="underline underline-offset-2">U</span>
        </Toggle>

        <Toggle
          pressed={editor.isActive("link")}
          onPressedChange={() => {
            const previousUrl = editor.getAttributes("link").href;
            const url = window.prompt("Enter URL:", previousUrl);

            // If cancelled
            if (url === null) {
              return;
            }

            // If empty string, remove link
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }

            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
          aria-label="Toggle Link"
        >
          <Link />
        </Toggle>

        <Toggle
          pressed={editor.isActive("codeBlock")}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
          aria-label="Toggle Codeblock"
        >
          <Code2 />
        </Toggle>

        <Toggle
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          aria-label="Toggle Ordered List"
        >
          <ListOrderedIcon />
        </Toggle>

        <Toggle
          pressed={editor.isActive("blockquote")}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          aria-label="Toggle Blockquote"
        >
          <LucideQuote />
        </Toggle>

        <Toggle
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          aria-label="Toggle Bullet List"
        >
          <List />
        </Toggle>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Editor JSON:", editor.getJSON());
            console.log("Editor HTML:", editor.getHTML());
          }}
        >
          Get Data
        </Button>

        <Button
          size={"sm"}
          onClick={() => {
             const posi = editor.state.selection.from
            editor
              .chain()
              .focus()
              .insertContentAt(
                  3,
                'how do it <strong>work?<strong>'
              )
              .run();
          }}
        >
          Add to the editor
        </Button>

        <Button
          size={"sm"}
          onClick={() => {
            const { to, from } = editor.state.selection;
            console.log(to + " " + from);
          }}
        >
          show
        </Button>

        <Button
          size={"sm"}
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertContentAt(
                {
                  from: 1,
                  to: 39,
                },
                `Hello bitcha \t`
              )
              .run();
          }}
        >
          replace
        </Button>

        <Button
          onClick={() =>
            editor.view.dispatch(editor.state.tr.setMeta("clearDiff", true))
          }
        >
          cler
        </Button>

        <Button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({ type: "reactComponent" })
              .run()
          }
        >
          dd react
        </Button>
      </div>
    </div>
  );
}
