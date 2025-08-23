import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Code,
  CheckSquare,
  type LucideIcon,
  Pen,
  StarsIcon,
} from "lucide-react";
import { Editor } from "@tiptap/core";
import { useOverlayInputStore } from "@/store/useEditorAIStore";

export interface SlashCommand {
  title: string;
  tooltip?: string;
  searchTerms: string[];
  icon: LucideIcon;
  command: ({ editor, range }: { editor: Editor; range: any }) => void;
}

export const slashCommands: SlashCommand[] = [
  {
    title: "Add/Replace content",
    searchTerms: ["ai", "llm", "ml", "auto"],
    icon: Pen,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();

      const { view } = editor;
      const start = view.coordsAtPos(editor.state.selection.from);
      console.log(editor.state.selection.from);
      console.log(start);
      useOverlayInputStore
        .getState()
        .showInput({ x: start.left, y: start.top }, editor, "static");
    },
  },
  {
    title: "Add Reactive block",
    searchTerms: ["auto", "reactive", "reupdate"],
    icon: StarsIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();

      const { view } = editor;
      const start = view.coordsAtPos(editor.state.selection.from);
      console.log(editor.state.selection.from);
      console.log(start);
      useOverlayInputStore
        .getState()
        .showInput({ x: start.left, y: start.top }, editor, "reactive");
    },
  },
  {
    title: "Text",
    searchTerms: ["p", "paragraph"],
    icon: Text,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    searchTerms: ["h1", "header", "large"],
    icon: Heading1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    searchTerms: ["h2", "header", "medium"],
    icon: Heading2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    searchTerms: ["h3", "header", "small"],
    icon: Heading3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    searchTerms: ["ul", "unordered", "point"],
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    searchTerms: ["ol", "ordered"],
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    searchTerms: ["blockquote"],
    icon: TextQuote,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "Code",
    searchTerms: ["pre", "codeblock"],
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
];