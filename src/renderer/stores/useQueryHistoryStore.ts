import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface QueryHistoryState {
  queries: string[];
}

interface QueryHistoryActions {
  addQuery: (query: string) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 100;

export const useQueryHistoryStore = create<QueryHistoryState & QueryHistoryActions>()(
  devtools(
    persist(
      (set, get) => ({
        queries: [],

        addQuery: (query) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) return;

          const queries = get().queries;
          // Don't add duplicates of the last query
          if (queries[queries.length - 1] === trimmedQuery) return;

          set({
            queries: [...queries, trimmedQuery].slice(-MAX_HISTORY_SIZE),
          });
        },

        clearHistory: () => set({ queries: [] }),
      }),
      {
        name: 'adminite-query-history',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: 'Adminite', store: 'QueryHistoryStore' }
  )
);
