  import { Node, mergeAttributes } from "@tiptap/core";
  import type { Command } from "@tiptap/core";
  import { ReactNodeViewRenderer } from "@tiptap/react";
  import { TextView } from "./views/text-view";
  import { InsertTextNodeOptions } from "@/lib/types";


  declare module "@tiptap/core" {
    interface Commands<ReturnType> {
      reactiveTextBlock: {
        insertTextNode: (options?: InsertTextNodeOptions) => ReturnType;
      };
    }
  }

  export const TextNode = Node.create({
    name: "TextBlock",
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
        },
        isReactive : {
          default : false
        },
        retryCount : {
          default : 0
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
              errorMessage = null,
              isReactive = true
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
                errorMessage,
                isReactive
              },
            });
          },
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(TextView);
    },
  });
