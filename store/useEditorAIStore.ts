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
  showInput: (position: Posi, editor: Editor) => void;
  hideInput: () => void;
}

export const useOverlayInputStore = create<InputStore>((set) => ({
  show: false,
  position: { x: 0, y: 0 },
  editor: null,
  docsPos: null,
  showInput: ({ x, y }, editor) => {
    const pos = editor.view.posAtCoords({ left: x, top: y })?.pos ?? null;
    set({
      show: true,
      position: { x, y },
      editor,
      docsPos: pos,
    });
  },
  hideInput: () =>
    set({ show: false, position: { x: 0, y: 0 }, editor: null, docsPos: null }),
}));
