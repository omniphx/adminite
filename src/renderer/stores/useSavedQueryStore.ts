import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface SavedQuery {
  id: string;
  name: string;
  body: string;
  sobject: string;
}

interface SavedQueryState {
  // All saved queries (persisted)
  queries: Record<string, SavedQuery>;
  queryOrder: string[]; // IDs in sorted order by name
}

interface SavedQueryActions {
  // Query CRUD
  createQuery: (query: Omit<SavedQuery, 'id'>) => SavedQuery;
  updateQuery: (id: string, updates: Partial<Omit<SavedQuery, 'id'>>) => SavedQuery;
  deleteQuery: (id: string) => void;

  // Get all queries as array
  getQueriesArray: () => SavedQuery[];

  // Initialization (migrate from old localStorage format)
  initializeFromLegacyStorage: () => void;
}

export const useSavedQueryStore = create<SavedQueryState & SavedQueryActions>()(
  persist(
    (set, get) => ({
      // Initial state
      queries: {},
      queryOrder: [],

      // Query CRUD
      createQuery: (queryData) => {
        const id = uuidv4();
        const query: SavedQuery = {
          ...queryData,
          id,
        };

        set((state) => {
          // Insert in alphabetical order by name
          const newOrder = [...state.queryOrder, id].sort((a, b) => {
            const nameA = (state.queries[a]?.name || query.name).toLowerCase();
            const nameB = (state.queries[b]?.name || query.name).toLowerCase();
            return nameA.localeCompare(nameB);
          });

          return {
            queries: {
              ...state.queries,
              [id]: query,
            },
            queryOrder: newOrder,
          };
        });

        return query;
      },

      updateQuery: (id, updates) => {
        const state = get();
        const existing = state.queries[id];
        if (!existing) return existing;

        const updated = { ...existing, ...updates };

        set((state) => {
          const newQueries = {
            ...state.queries,
            [id]: updated,
          };

          // Re-sort if name changed
          const newOrder = updates.name
            ? [...state.queryOrder].sort((a, b) => {
                const nameA = newQueries[a].name.toLowerCase();
                const nameB = newQueries[b].name.toLowerCase();
                return nameA.localeCompare(nameB);
              })
            : state.queryOrder;

          return {
            queries: newQueries,
            queryOrder: newOrder,
          };
        });

        return updated;
      },

      deleteQuery: (id) => {
        set((state) => {
          const { [id]: _deleted, ...remaining } = state.queries;
          return {
            queries: remaining,
            queryOrder: state.queryOrder.filter((queryId) => queryId !== id),
          };
        });
      },

      getQueriesArray: () => {
        const state = get();
        return state.queryOrder.map((id) => state.queries[id]);
      },

      // Initialize from legacy localStorage format
      initializeFromLegacyStorage: () => {
        // Only migrate if we haven't already (new store is empty)
        const currentQueries = get().queryOrder;
        if (currentQueries.length > 0) {
          // Already have data in new store, skip migration but clean up legacy
          localStorage.removeItem('queries');
          return;
        }

        const legacyData = localStorage.getItem('queries');
        if (!legacyData) return;

        try {
          const legacyQueries = JSON.parse(legacyData) as Record<string, SavedQuery>;
          const queriesArray = Object.values(legacyQueries);

          // Sort by name alphabetically
          queriesArray.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

          const queries: Record<string, SavedQuery> = {};
          const queryOrder: string[] = [];

          queriesArray.forEach((query) => {
            // Ensure query has an id
            const id = query.id || uuidv4();
            queries[id] = {
              id,
              name: query.name || '',
              body: query.body || '',
              sobject: query.sobject || '',
            };
            queryOrder.push(id);
          });

          set({
            queries,
            queryOrder,
          });

          // Remove legacy storage after successful migration
          localStorage.removeItem('queries');
        } catch (error) {
          console.error('Failed to migrate legacy saved queries:', error);
        }
      },
    }),
    {
      name: 'adminite-saved-queries',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queries: state.queries,
        queryOrder: state.queryOrder,
      }),
    }
  )
);

// Selector helpers
export const getSavedQueryById = (id: string) => (state: SavedQueryState) => state.queries[id];

export const getSavedQueriesArray = (state: SavedQueryState) =>
  state.queryOrder.map((id) => state.queries[id]);

// Hook that uses shallow comparison for array selectors (prevents infinite re-renders)
export const useSavedQueriesArray = () => useSavedQueryStore(useShallow(getSavedQueriesArray));
