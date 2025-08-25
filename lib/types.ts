import { Editor } from "@tiptap/react";

export interface Document {
    id: string;
    title: string;
    updatedAt: string;
  }
  
  export interface AboutDoc {
    id: string | null;
    originalTitle?: string;
    updateTitle?: string;
  }
  
  export type EditorContent = object | null;
  export interface EditorState {
    content: EditorContent;
    setContent: (newContent: EditorContent) => void;
    clearContent: () => void;
  }
  
  export interface Posi {
    x: number;
    y: number;
  }
  
  export interface InputStore {
    show: boolean;
    position: Posi;
    editor: Editor | null;
    docsPos: number | null;
    showInput: (position: Posi, editor: Editor, type: "static" | "reactive") => void;
    hideInput: () => void;
    type : "static" | "reactive"
  }
  
  export interface PanelState {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
  }
  
  export interface BlockInfo {
    position: {
      to: number;
      from: number;
    };
    content: string;
  }
  
  export interface GetStateResult {
    context: string;
    blocksByIds: Map<string, BlockInfo>;
  }

  export interface InsertTextNodeOptions {
    id?: string;
    computedContent?: string;
    prompt?: string;
    sourceHash?: string;
    dependencyHash?: string;
    dependencyScope?: string;
    type?: string;
    status?: string;
    errorMessage?: string | null;
    isReactive? : boolean
  }

  export interface InsertChartNodeOptions {
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

  export interface DocumentEntry {
    prompt: string;
    content: string;
    createdAt: any;
    type : "text" | "chart" | "reactive"
  }


  export interface LlmRequest {
  nodePos: number;
  nodeId: string;
  nodeType: string;
  prompt: string;
  dependentContent: string;
  currentContentHash: string;
  computedContent: string;
  type: "text" | "bar" | "pie";
  newDependencyScope: string[];
}


export interface ReactiveTextAttrs {
  prompt: string;
  sourceHash: string;
  dependencyHash: string;
  status: "idle" | "computing" | "error";
  dependencyScope: string[];
  computedContent: string;
  errorMessage?: string;
  type: "text" | "bar" | "pie";
  retryCount?: number;
  id: string;
}