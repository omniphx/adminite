import { create } from 'zustand';

/**
 * Query result state for a single tab
 * This store manages the query result data that was previously in Redux queryResultsState
 */
export interface QueryResultData {
  [key: string]: any;
}

export interface QueryResultState {
  data: QueryResultData;
  filteredIds: string[];
  selectedIds: string[];
  totalSize: number;
  pending: boolean;
  dmlPending: boolean;
  errors: string | null;
}

interface QueryResultStoreState {
  // Per-tab query result state
  byTabId: Record<string, QueryResultState>;
}

interface QueryResultStoreActions {
  // Tab management
  createTab: (tabId: string) => void;
  deleteTab: (tabId: string) => void;

  // Query state updates
  setPending: (tabId: string, pending: boolean) => void;
  setDmlPending: (tabId: string, dmlPending: boolean) => void;
  setError: (tabId: string, error: string | null) => void;

  // Data updates
  setQueryResult: (
    tabId: string,
    result: {
      data: QueryResultData;
      filteredIds: string[];
      totalSize: number;
    }
  ) => void;
  appendQueryResult: (
    tabId: string,
    result: {
      data: QueryResultData;
      filteredIds: string[];
    }
  ) => void;
  setData: (tabId: string, data: QueryResultData) => void;
  updateRecord: (tabId: string, recordId: string, record: any) => void;

  // Selection & filtering
  setSelectedIds: (tabId: string, selectedIds: string[]) => void;
  setFilteredIds: (tabId: string, filteredIds: string[]) => void;
  clearSelection: (tabId: string) => void;

  // Bulk updates
  setTabState: (tabId: string, updates: Partial<QueryResultState>) => void;

  // Reset
  reset: (tabId: string) => void;

  // Getters
  getTabState: (tabId: string) => QueryResultState | undefined;
}

const createDefaultQueryResultState = (tabId: string): QueryResultState => ({
  data: {},
  filteredIds: [],
  selectedIds: [],
  totalSize: 0,
  pending: false,
  dmlPending: false,
  errors: null,
});

export const useQueryResultStore = create<QueryResultStoreState & QueryResultStoreActions>()(
  (set, get) => ({
    // Initial state
    byTabId: {
      initial: createDefaultQueryResultState('initial'),
    },

    // Tab management
    createTab: (tabId) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: createDefaultQueryResultState(tabId),
        },
      })),

    deleteTab: (tabId) =>
      set((state) => {
        const { [tabId]: deleted, ...rest } = state.byTabId;
        return { byTabId: rest };
      }),

    // Query state updates
    setPending: (tabId, pending) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            pending,
            // Clear errors when starting a new query
            errors: pending ? null : (state.byTabId[tabId]?.errors ?? null),
          },
        },
      })),

    setDmlPending: (tabId, dmlPending) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            dmlPending,
          },
        },
      })),

    setError: (tabId, error) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            errors: error,
            pending: false,
            data: error ? {} : (state.byTabId[tabId]?.data ?? {}),
          },
        },
      })),

    // Data updates
    setQueryResult: (tabId, result) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            data: result.data,
            filteredIds: result.filteredIds,
            totalSize: result.totalSize,
            selectedIds: [],
            errors: null,
          },
        },
      })),

    appendQueryResult: (tabId, result) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            data: {
              ...state.byTabId[tabId]?.data,
              ...result.data,
            },
            filteredIds: [...(state.byTabId[tabId]?.filteredIds ?? []), ...result.filteredIds],
            errors: null,
          },
        },
      })),

    setData: (tabId, data) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            data: {
              ...state.byTabId[tabId]?.data,
              ...data,
            },
          },
        },
      })),

    updateRecord: (tabId, recordId, record) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            data: {
              ...state.byTabId[tabId]?.data,
              [recordId]: {
                ...state.byTabId[tabId]?.data[recordId],
                ...record,
              },
            },
          },
        },
      })),

    // Selection & filtering
    setSelectedIds: (tabId, selectedIds) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            selectedIds,
          },
        },
      })),

    setFilteredIds: (tabId, filteredIds) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            filteredIds,
          },
        },
      })),

    clearSelection: (tabId) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            selectedIds: [],
          },
        },
      })),

    // Bulk updates
    setTabState: (tabId, updates) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            ...updates,
          },
        },
      })),

    // Reset
    reset: (tabId) =>
      set((state) => ({
        byTabId: {
          ...state.byTabId,
          [tabId]: createDefaultQueryResultState(tabId),
        },
      })),

    // Getters
    getTabState: (tabId) => get().byTabId[tabId],
  })
);

// Selector helpers for use with hooks
export const selectTabData = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.data ?? {};

export const selectTabFilteredIds = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.filteredIds ?? [];

export const selectTabSelectedIds = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.selectedIds ?? [];

export const selectTabPending = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.pending ?? false;

export const selectTabDmlPending = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.dmlPending ?? false;

export const selectTabErrors = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.errors ?? null;

export const selectTabTotalSize = (tabId: string) => (state: QueryResultStoreState) =>
  state.byTabId[tabId]?.totalSize ?? 0;
