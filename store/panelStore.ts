import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PanelState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const usePanelStore = create<PanelState>()(
  persist(
    (set) => ({
      isOpen: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'panel-storage',
    }
  )
);
