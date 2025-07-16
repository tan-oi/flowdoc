"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorContext } from "./editor-provider";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

import { DiffExtension, setCurrentEditor } from "@/extensions/diff";
import { diffWords } from "diff";
import { testNode } from "@/extensions/test";
import Placeholder from "@tiptap/extension-placeholder";
import {
  SlashCmdProvider,
  Slash,
  enableKeyboardNavigation,
} from "@harshtalks/slash-tiptap";
import { suggestionItems } from "@/lib/slash-commands";
import SlashCommand from "./slash-command";

import { useEditorId } from "@/hooks/use-editorId";
import { BubbleMenuComponent } from "./bubble-menu";
// import TaskList from "@tiptap/extension-task-list";
// import TaskItem from "@tiptap/extension-task-item";
import UniqueID from "@tiptap/extension-unique-id";
import { customAlphabet } from "nanoid";
import { TextNode } from "@/extensions/text-node";
import { useEffect } from "react";
import { useDebouncedEditorSync } from "@/hooks/useDebounceEditorSync";
import { useUpdateTimer } from "@/hooks/useUpdateTimer";
import { setupLlmOrchestrator } from "@/lib/services/llmOrchestrator";

const Tiptap = ({ id, data }: { id: string; data: object | null }) => {
  const { triggerNavigation, docId } = useEditorId(id);

  const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    7
  );

  const { setEditor } = useEditorContext();

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
      DiffExtension,
      testNode(),
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
      Slash.configure({
        suggestion: {
          items: () => suggestionItems,
        },
      }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "prose prose-md dark:prose-invert text-white max-w-none focus:outline-none h-full p-4 overflow-y-auto break-words",
      },
      handleDOMEvents: {
        keydown: (_, event) => enableKeyboardNavigation(event),
      },
    },
    content: data || null,
    onCreate: ({ editor }) => {
      setEditor(editor);
      setCurrentEditor(editor);
    },
    onUpdate: ({ editor }) => {
      if (
        !docId &&
        editor
          .getText()
          .trim()
          .match(/[a-zA-Z0-9]/)
      ) {
        triggerNavigation();
      }

      // setContent(editor.getJSON());
    },
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
    if (!editor) return;
    console.log('yes');
    const cleanup = setupLlmOrchestrator(editor);
    return cleanup;
  }, [editor]);

 
  if (!editor) return null;
  return (
    <>
      <div className="flex-[2.5] border rounded-lg shadow-sm bg-secondary/30 overflow-hidden">
        <div className="h-full overflow-hidden break-words">
          <SlashCmdProvider>
            <EditorContent
              className="h-full overflow-y-auto w-full"
              editor={editor}
            />
            <SlashCommand editor={editor} />
          </SlashCmdProvider>
        </div>
      </div>
      <BubbleMenuComponent />
    </>
  );
};

export default Tiptap;
