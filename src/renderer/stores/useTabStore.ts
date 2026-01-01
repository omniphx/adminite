import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { TablePaginationConfig } from 'antd';

// Types
export interface QueryTab {
  id: string;
  title: string;
}

export interface SoqlQuery {
  id?: string;
  name?: string;
  body: string;
}

export type DateFormatMode = 'human' | 'iso';

export interface QueryState {
  tabId: string;
  query: SoqlQuery;
  searchFilter: string;
  includeDeleted: boolean;
  toolingMode: boolean;
  paginationConfig: TablePaginationConfig;
  parsedQuery?: any;
  batchSize: number;
  errors?: any;
  // SObject names for describe queries (Phase 6)
  querySObjectName?: string; // For query editor autocomplete
  resultSObjectName?: string; // For results table rendering
  // Date display format preference
  dateFormat: DateFormatMode;
}

export interface QueryResultUIState {
  selectedIds: string[];
  filteredIds: string[];
}

// State interface
interface TabState {
  // Tab management
  tabs: Record<string, QueryTab>;
  tabOrder: string[];
  activeTabId: string | undefined;

  // Per-tab query state
  queries: Record<string, QueryState>;

  // Per-tab result UI state (selectedIds, filteredIds)
  resultUIState: Record<string, QueryResultUIState>;

  // Global pagination setting
  defaultPageSize: number;
}

// Actions interface
interface TabActions {
  // Tab CRUD
  createTab: () => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  renameTab: (tabId: string, title: string) => void;
  moveTab: (fromId: string, toId: string) => void;

  // Query state updates
  setQuery: (tabId: string, updates: Partial<QueryState>) => void;
  setQueryBody: (tabId: string, body: string) => void;
  setSearchFilter: (tabId: string, filter: string) => void;
  setToolingMode: (tabId: string, toolingMode: boolean) => void;
  setIncludeDeleted: (tabId: string, includeDeleted: boolean) => void;
  setBatchSize: (tabId: string, batchSize: number) => void;
  setPaginationConfig: (tabId: string, config: TablePaginationConfig) => void;
  setParsedQuery: (tabId: string, parsedQuery: any) => void;
  setQuerySObjectName: (tabId: string, sObjectName: string | undefined) => void;
  setResultSObjectName: (tabId: string, sObjectName: string | undefined) => void;
  setDateFormat: (tabId: string, dateFormat: DateFormatMode) => void;

  // Result UI state
  setSelectedIds: (tabId: string, ids: string[]) => void;
  setFilteredIds: (tabId: string, ids: string[]) => void;
  clearSelection: (tabId: string) => void;

  // Global settings
  setDefaultPageSize: (pageSize: number) => void;

  // Selectors (computed values)
  getActiveTab: () => QueryTab | undefined;
  getQueryState: (tabId: string) => QueryState | undefined;
  getResultUIState: (tabId: string) => QueryResultUIState | undefined;
}

// Default values
const createDefaultQueryState = (tabId: string): QueryState => ({
  tabId,
  query: { body: '' },
  searchFilter: '',
  includeDeleted: false,
  toolingMode: false,
  paginationConfig: { pageSize: 25, current: 1 },
  batchSize: 200,
  dateFormat: 'human',
});

const createDefaultResultUIState = (): QueryResultUIState => ({
  selectedIds: [],
  filteredIds: [],
});

// Create the store
export const useTabStore = create<TabState & TabActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tabs: {},
        tabOrder: [],
        activeTabId: undefined,
        queries: {},
        resultUIState: {},
        defaultPageSize: 25,

        // Tab CRUD
        createTab: () => {
          const tabId = uuidv4();
          set((state) => ({
            tabs: { ...state.tabs, [tabId]: { id: tabId, title: 'New Query' } },
            tabOrder: [...state.tabOrder, tabId],
            activeTabId: tabId,
            queries: { ...state.queries, [tabId]: createDefaultQueryState(tabId) },
            resultUIState: { ...state.resultUIState, [tabId]: createDefaultResultUIState() },
          }));
          return tabId;
        },

        closeTab: (tabId) =>
          set((state) => {
            const { [tabId]: _1, ...restTabs } = state.tabs;
            const { [tabId]: _2, ...restQueries } = state.queries;
            const { [tabId]: _3, ...restResults } = state.resultUIState;
            const newOrder = state.tabOrder.filter((id) => id !== tabId);

            // Determine new active tab
            let newActiveId = state.activeTabId;
            if (state.activeTabId === tabId) {
              const currentIndex = state.tabOrder.indexOf(tabId);
              newActiveId = newOrder[Math.max(0, currentIndex - 1)] || newOrder[0] || undefined;
            }

            return {
              tabs: restTabs,
              tabOrder: newOrder,
              activeTabId: newActiveId,
              queries: restQueries,
              resultUIState: restResults,
            };
          }),

        setActiveTab: (tabId) => set({ activeTabId: tabId }),

        renameTab: (tabId, title) =>
          set((state) => ({
            tabs: { ...state.tabs, [tabId]: { ...state.tabs[tabId], title } },
          })),

        moveTab: (fromId, toId) =>
          set((state) => {
            const fromIndex = state.tabOrder.indexOf(fromId);
            const toIndex = state.tabOrder.indexOf(toId);
            if (fromIndex === -1 || toIndex === -1) return state;

            const newOrder = [...state.tabOrder];
            newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, fromId);
            return { tabOrder: newOrder };
          }),

        // Query state updates
        setQuery: (tabId, updates) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], ...updates },
            },
          })),

        setQueryBody: (tabId, body) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: {
                ...state.queries[tabId],
                query: { ...state.queries[tabId]?.query, body },
              },
            },
          })),

        setSearchFilter: (tabId, searchFilter) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], searchFilter },
            },
          })),

        setToolingMode: (tabId, toolingMode) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], toolingMode },
            },
          })),

        setIncludeDeleted: (tabId, includeDeleted) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], includeDeleted },
            },
          })),

        setBatchSize: (tabId, batchSize) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], batchSize },
            },
          })),

        setPaginationConfig: (tabId, paginationConfig) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], paginationConfig },
            },
          })),

        setParsedQuery: (tabId, parsedQuery) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], parsedQuery },
            },
          })),

        setQuerySObjectName: (tabId, querySObjectName) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], querySObjectName },
            },
          })),

        setResultSObjectName: (tabId, resultSObjectName) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], resultSObjectName },
            },
          })),

        setDateFormat: (tabId, dateFormat) =>
          set((state) => ({
            queries: {
              ...state.queries,
              [tabId]: { ...state.queries[tabId], dateFormat },
            },
          })),

        // Result UI state
        setSelectedIds: (tabId, selectedIds) =>
          set((state) => ({
            resultUIState: {
              ...state.resultUIState,
              [tabId]: { ...state.resultUIState[tabId], selectedIds },
            },
          })),

        setFilteredIds: (tabId, filteredIds) =>
          set((state) => ({
            resultUIState: {
              ...state.resultUIState,
              [tabId]: { ...state.resultUIState[tabId], filteredIds },
            },
          })),

        clearSelection: (tabId) =>
          set((state) => ({
            resultUIState: {
              ...state.resultUIState,
              [tabId]: { ...state.resultUIState[tabId], selectedIds: [] },
            },
          })),

        // Global settings
        setDefaultPageSize: (defaultPageSize) => set({ defaultPageSize }),

        // Selectors
        getActiveTab: () => {
          const state = get();
          return state.activeTabId ? state.tabs[state.activeTabId] : undefined;
        },

        getQueryState: (tabId) => get().queries[tabId],

        getResultUIState: (tabId) => get().resultUIState[tabId],
      }),
      {
        name: 'adminite-tabs',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tabs: state.tabs,
          tabOrder: state.tabOrder,
          activeTabId: state.activeTabId,
          queries: state.queries,
          // Don't persist resultUIState (selectedIds, filteredIds) - they're transient
          defaultPageSize: state.defaultPageSize,
        }),
      }
    ),
    { name: 'Adminite', store: 'TabStore' }
  )
);

// Re-export types for convenience
export type { TablePaginationConfig };
