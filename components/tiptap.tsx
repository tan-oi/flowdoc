"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorContext } from "./editor-provider";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { BubbleMenu } from "@tiptap/react";
import { Button } from "./ui/button";
import { MyDecorationExtension } from "@/extensions/highlight";
import { DiffExtension } from "@/extensions/diff";
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

import { useEditorStore } from "@/store/chatStore";
import { useEditorId } from "@/hooks/use-editorId";
import { BubbleMenuComponent } from "./bubble-menu";
// import TaskList from "@tiptap/extension-task-list";
// import TaskItem from "@tiptap/extension-task-item";
import UniqueID from "@tiptap/extension-unique-id";
import { nanoid } from 'nanoid'

const Tiptap = ({ id, data }: { id: string; data: object | null }) => {
  const { triggerNavigation, docId } = useEditorId(id);
  // const { content, setContent } = useEditorStore();
  // console.log(content);

  const newtext = `Focusing on critical areas such as internet and email abuse yeah bullshit.`;

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
        placeholder: ({ node,editor }) => {
          if (node.type.name === "heading") {
            return "Heading1";
          }

         
          return "Press '/' for commands...";
        },
      }),
      Underline,
      MyDecorationExtension,
      DiffExtension,
      testNode(),
      UniqueID.configure({
        types: ["heading", "paragraph"],
        generateID : () => nanoid(7)
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
    },
    onUpdate: ({ editor }) => {
      if (
        !docId &&
        editor
          .getText()
          .trim()
          .match(/[a-zA-Z0-9]/)
      ) {
        const now = Date.now();
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
      {/* <BubbleMenu
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

              const diffs = diffWords(text, newtext);
              editor.view.dispatch(
                editor.state.tr.setMeta("createDiff", { from, to, diffs })
              );
              // const html = diffToSentence(diffs);

              // console.log(html);

              //  editor.commands.insertContentAt({ from, to }, `${html}`);
            }}
          >
            replace
          </Button>
        </div>
      </BubbleMenu> */}
      <BubbleMenuComponent />
    </>
  );
};

export default Tiptap;
