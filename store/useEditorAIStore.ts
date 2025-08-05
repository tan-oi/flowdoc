import { create } from "zustand";
import { Editor } from "@tiptap/react";
import { InputStore } from "@/lib/types";

export const useOverlayInputStore = create<InputStore>((set) => ({
  show: false,
  type : "static",
  position: { x: 0, y: 0 },
  editor: null,
  docsPos: null,
  showInput: ({ x, y }, editor, type) => {
    const pos = editor.view.posAtCoords({ left: x, top: y })?.pos ?? null;
    set({
      show: true,
      position: { x, y },
      editor,
      docsPos: pos,
      type : type
    });
  },
  hideInput: () =>
    set({ show: false, position: { x: 0, y: 0 }, editor: null, docsPos: null }),
}));
