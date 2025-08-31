import { create } from "zustand";

import { DocumentEntry } from "@/lib/types";

interface DocumentStore {
  activeDocId: string | null;

  batchedEntries: Record<string, DocumentEntry[]>;

  setActiveDocument: (docId: string) => void;
  addBatchedEntry: (docId: string, entry: DocumentEntry) => void;
  getBatchedEntries: (docId: string) => DocumentEntry[];

  clearInactiveDocuments: () => void;

  getUnsavedEntries: (docId: string) => DocumentEntry[];
  markEntriesAsSaved: (docId: string, entryIds: string[]) => void;
  clearBatchedEntries: (docId: string) => void;
}

export const useHistoryState = create<DocumentStore>((set, get) => ({
  activeDocId: null,
  batchedEntries: {},

  setActiveDocument: (docId) => {
    const state = get();

    // if (state.activeDocId && state.activeDocId !== docId) {
    //   const unsavedEntries = state.batchedEntries[state.activeDocId] || [];

    //   if (unsavedEntries.length > 0) {
    //     // Fire and forget auto-save
    //     fetch(`/api/doc/history/${state.activeDocId}`, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ entries: unsavedEntries })
    //     }).then(() => {
    //       set((state) => ({
    //         batchedEntries: {
    //           ...state.batchedEntries,
    //           [state.activeDocId!]: []
    //         }
    //       }));
    //     }).catch(console.error);
    //   }
    // }

    if (state.activeDocId && state.activeDocId !== docId) {
      set((state) => ({
        batchedEntries: {
          ...state.batchedEntries,
          [state.activeDocId!]: [],
        },
      }));
    }

    set({ activeDocId: docId });
  },

  addBatchedEntry: (docId, entry) =>
    set((state) => ({
      batchedEntries: {
        ...state.batchedEntries,
        [docId]: [
          ...(state.batchedEntries[docId] || []),
          {
            ...entry,
            //   timestamp: Date.now(),
            //   id: crypto.randomUUID()
          },
        ],
      },
    })),

  getBatchedEntries: (docId) => {
    return get().batchedEntries[docId] || [];
  },

  clearInactiveDocuments: () =>
    set((state) => {
      if (!state.activeDocId) return state;

      return {
        batchedEntries: {
          [state.activeDocId]: state.batchedEntries[state.activeDocId] || [],
        },
      };
    }),

  getUnsavedEntries: (docId) => {
    return get().batchedEntries[docId] || [];
  },

  markEntriesAsSaved: (docId, entryIds) =>
    set((state) => ({
      batchedEntries: {
        ...state.batchedEntries,
        [docId]: (state.batchedEntries[docId] || []).filter(
          (entry) => !entryIds.includes(docId)
        ),
      },
    })),

  clearBatchedEntries: (docId: string) =>
    set((state) => ({
      batchedEntries: {
        ...state.batchedEntries,
        [docId]: [],
      },
    })),
}));
