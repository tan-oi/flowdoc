import { create } from "zustand";

type EditorContent = object | null;

interface EditorState {
  content: EditorContent;
  setContent: (newContent: EditorContent) => void;
  clearContent: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: null,
  setContent: (newContent) => set({ content: newContent }),
  clearContent: () => set({ content: null }),
}));
;
