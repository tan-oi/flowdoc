"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorContext } from "./editor-provider";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

import { DiffExtension, setCurrentEditor } from "@/extensions/diff";
import Placeholder from "@tiptap/extension-placeholder";
import { BubbleMenuComponent } from "./bubble-menu";
import UniqueID from "@tiptap/extension-unique-id";
import { customAlphabet } from "nanoid";
import { TextNode } from "@/extensions/text-node";
import { useEffect, useState } from "react";

import { setupLlmOrchestrator } from "@/lib/services/llmOrchestrator";
import { ChartNode } from "@/extensions/chart-node";
import DOMPurify from "dompurify";
import { SANITIZE_CONFIG } from "./safe-html";

import { SlashCommand } from "@/extensions/slash-command";
import { useSlashCommand } from "@/hooks/use-slash-command";
import { slashCommands } from "@/lib/slash-commands";

const Tiptap = ({ data }: { data: any }) => {
  const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    7
  );

  const { setEditor } = useEditorContext();
  const { renderSlashMenu } = useSlashCommand(slashCommands);

  const editor = useEditor({
    immediatelyRender: false,
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
      Placeholder.configure({
        placeholder: ({ node, editor }) => {
          if (node.type.name === "heading") {
            return "Heading1";
          }
          return "Press '/' for commands...";
        },
      }),
      Underline,
      TextNode,
      ChartNode,
      DiffExtension,

      UniqueID.configure({
        types: [
          "heading",
          "paragraph",
          "orderedList",
          "bulletList",
          "listItem",
        ],
        generateID: () => nanoid(),
      }),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            const lowerQuery = query.toLowerCase();
            return slashCommands.filter((item) => {
              const titleMatch = item.title.toLowerCase().includes(lowerQuery);
              const termsMatch = item.searchTerms.some((term) =>
                term.toLowerCase().includes(lowerQuery)
              );
              return titleMatch || termsMatch;
            });
          },
          render: renderSlashMenu,
        },
      }),
    ],
    autofocus: true,
    editorProps: {
      handlePaste: (view, event, slice) => {
        const html = event.clipboardData?.getData("text/html");
        const text = event.clipboardData?.getData("text/plain");

        if (html) {
          const safeHTML = DOMPurify.sanitize(html, SANITIZE_CONFIG);
          editor?.commands.insertContent(safeHTML, {
            parseOptions: { preserveWhitespace: "full" },
          });
          return true;
        }

        if (text && text.includes("<")) {
          const safeHTML = DOMPurify.sanitize(text, SANITIZE_CONFIG);
          editor?.commands.insertContent(safeHTML, {
            parseOptions: { preserveWhitespace: "full" },
          });
          return true;
        }

        return false;
      },
      attributes: {
        class:
          "prose prose-md dark:prose-invert text-primary dark:text-gray-50/80 max-w-none focus:outline-none h-full px-4 py-6 overflow-y-auto scrollbar-thin break-words tracking-wider",
      },
      handleDOMEvents: {
        keydown: (_, event) => {
          if (event.key === "Tab") {
            event.preventDefault();
            console.log("tab was clicked");
            return false;
          }

          return false;
        },
      },
    },
    content: data || null,
    onCreate: ({ editor }) => {
      setEditor(editor);
      setCurrentEditor(editor);
    },
    onUpdate: ({ editor }) => {},
    onSelectionUpdate: ({ editor, transaction }) => {
      if (editor.state.selection.empty && transaction.getMeta("pointer")) {
        editor
          .chain()
          .unsetBold()
          .unsetItalic()
          .unsetUnderline()
          .unsetStrike()
          .run();
      }
    },
  });

  useEffect(() => {
    if (editor && data !== undefined) {
      queueMicrotask(() => editor.commands.setContent(data, false));
    }
  }, [editor, data]);

  useEffect(() => {
    if (!editor) return;

    const cleanup = setupLlmOrchestrator(editor);
    return cleanup;
  }, [editor]);

  if (!editor) return null;
  return (
    <>
      <div className="flex-[2.5] shadow-sm bg-background/10 overflow-hidden">
        <div className="h-full overflow-hidden break-words">
          <EditorContent
            className="h-full overflow-y-auto w-full"
            editor={editor}
          />
        </div>
      </div>
      <BubbleMenuComponent />
    </>
  );
};

export default Tiptap;
