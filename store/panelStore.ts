import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { PanelState } from '@/lib/types';

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
