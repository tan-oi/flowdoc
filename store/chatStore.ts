import { create } from "zustand";
import { EditorState } from "@/lib/types";

export const useEditorStore = create<EditorState>((set) => ({
  content: null,
  setContent: (newContent) => set({ content: newContent }),
  clearContent: () => set({ content: null }),
}));
