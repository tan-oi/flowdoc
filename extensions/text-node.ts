import { Node, mergeAttributes } from "@tiptap/core";
import type { Command } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TextView } from "./views/text-view";

interface InsertTextNodeOptions {
  id?: string;
  computedContent?: string;
  prompt?: string;
  sourceHash?: string;
  dependencyHash?: string;
  dependencyScope?: string;
  type?: string;
  status?: string;
  errorMessage?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    reactiveTextBlock: {
      insertTextNode: (options?: InsertTextNodeOptions) => ReturnType;
    };
  }
}

export const TextNode = Node.create({
  name: "ReactiveTextBlock",
  group: "block",
  content: "",
  atom: true,

  addAttributes() {
    return {
      id: {
        default: "",
      },
      computedContent: {
        default: "",
      },
      prompt: {
        default: "",
      },
      sourceHash: {
        default: "",
      },
      dependencyHash: {
        default: "",
      },
      dependencyScope: {
        default: "document",
      },
      type: {
        default: "",
      },
      status: {
        default: "idle"
      },
      errorMessage: {
        default: null
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "reactive-text-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["reactive-text-component", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      insertTextNode:
        (options: InsertTextNodeOptions = {}): Command =>
        ({ commands }) => {
          const {
            id,
            computedContent = "",
            prompt = "",
            sourceHash = "",
            dependencyHash = "",
            dependencyScope = "document",
            type = "",
            status = "idle",
            errorMessage = null
          } = options;

          return commands.insertContent({
            type: this.name,
            attrs: {
              id,
              computedContent,
              prompt,
              sourceHash,
              dependencyHash,
              dependencyScope,
              type,
              status,
              errorMessage
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextView);
  },
});
