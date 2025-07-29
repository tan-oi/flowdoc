import { Node, mergeAttributes } from "@tiptap/core";
import type { Command } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ChartView } from "./views/chart-view";

interface InsertChartNodeOptions {
  id?: string;
  computedContent?: [];
  prompt?: string;
  sourceHash?: string;
  dependencyHash?: string;
  dependencyScope?: string;
  type?: string;
  status?: string;
  errorMessage?: string | null;
  isReactive? : boolean
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    reactiveChartBlock: {
      insertChartNode: (options?: InsertChartNodeOptions) => ReturnType;
    };
  }
}

export const ChartNode = Node.create({
  name: "ChartBlock",
  group: "block",
  content: "",
  atom: true,

  addAttributes() {
    return {
      id: {
        default: "",
      },
      prompt: {
        default: "",
      },
      status: {
        default: "null",
      },
      sourceHash: {
        default: null,
      },
      dependencyHash: {
        default: null,
      },
      dependencyScope: {
        default: "document",
      },
      type: {
        default: "bar",
      },
      errorMessage: {
        default: null,
      },
      isReactive : {
        default : false
      },
      retryCount : {
        default : 0
      },
      computedContent: [],
    };
  },

  parseHTML() {
    return [
      {
        tag: "reactive-chart-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["reactive-chart-component", mergeAttributes(HTMLAttributes)];
  },
  addCommands() {
    return {
      insertChartNode:
        (options: InsertChartNodeOptions = {}): Command =>
        ({ commands }) => {
          const {
            id,
            computedContent = "",
            prompt = "",
            sourceHash = "",
            dependencyHash = "",
            dependencyScope = "document",
            type = "Bar",
            status = "idle",
            errorMessage = null,
            isReactive = false
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
    return ReactNodeViewRenderer(ChartView);
  },
});
