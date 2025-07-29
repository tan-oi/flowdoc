import { create } from "zustand";
import { Editor } from "@tiptap/react";

interface Posi {
  x: number;
  y: number;
}

interface InputStore {
  show: boolean;
  position: Posi;
  editor: Editor | null;
  docsPos: number | null;
  showInput: (position: Posi, editor: Editor, type: "static" | "reactive") => void;
  hideInput: () => void;
  type : "static" | "reactive"
}

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
