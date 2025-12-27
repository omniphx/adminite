import { combineReducers } from 'redux'

import { PaginationState } from './pagination/types'
import paginationReducer from './pagination/reducers'

// PermissionState removed - now managed by usePermissionUIStore (Zustand) and TanStack Query (Phase 7)
// ConnectionsState removed - now managed by useConnectionStore (Zustand)
// ConnectionState removed - now managed by useConnectionStore (Zustand) and TanStack Query
// FieldPermissionState removed - now managed by usePermissionUIStore (Zustand) and TanStack Query (Phase 8)
// QueryResultsState removed - now managed by useQueryResultStore (Zustand) and TanStack Query (Phase 9)
// QueriesState removed - now managed by useTabStore (Zustand) (Phase 9)

// Feature, User, Connections, Connection, and Permission state are now managed by Zustand stores
// Schema state (sobjects, toolingObjects, namespace) is now managed by TanStack Query
// SObject describe state is now managed by TanStack Query (Phase 6)
// Permission data (profiles, permission sets, FLS sObjects, fields) is now managed by TanStack Query (Phase 7)
// Field permission data is now managed by TanStack Query mutations + Zustand (Phase 8)
// Query execution and results are now managed by TanStack Query mutations + Zustand (Phase 9)

import { QueryHistoryState } from './queryHistory/types'
import queryHistoryReducer from './queryHistory/reducers'

import { QueryTabsState } from './queryTabs/types'
import queryTabsReducer from './queryTabs/reducers'

// getConnection removed - use useConnectionStore.getState() + getActiveConnection instead
// getConnections removed - use useConnectionStore.getState().connections instead
// getPermissionState removed - use usePermissionUIStore from Zustand instead (Phase 7)
// getFieldPermissionState removed - use usePermissionUIStore from Zustand + TanStack Query hooks (Phase 8)
// getSchemaState removed - use TanStack Query hooks (useGlobalDescribeQuery, useNamespaceQuery) instead
// getFeatureState removed - use useFeatureStore from Zustand instead
// getResultSObject removed - use TanStack Query hooks (useResultSObjectDescribe) instead
// getData, getSelectedIds, getFilteredIds removed - use useQueryResultStore from Zustand instead (Phase 9)
// getFilter, getToolingMode, getBatchSize, getQueryString, getIncludeDeleted removed - use useTabStore from Zustand instead (Phase 9)

export const getActiveTabId = (state: ApplicationState) => state.queryTabsState.activeId

export interface ApplicationState {
  paginationState: PaginationState
  queryHistoryState: QueryHistoryState
  queryTabsState: QueryTabsState
  // queriesState and queryResultsState removed - now managed by Zustand/TanStack Query (Phase 9)
  // featureState, userState, connectionsState, connectionState, schemaState, sobjectState, permissionState, and fieldPermissionState are now managed by Zustand/TanStack Query
}

export const rootReducer = combineReducers<ApplicationState>({
  paginationState: paginationReducer,
  queryHistoryState: queryHistoryReducer,
  queryTabsState: queryTabsReducer,
  // queriesState and queryResultsState removed - now managed by Zustand/TanStack Query (Phase 9)
  // featureState, userState, connectionsState, connectionState, schemaState, sobjectState, permissionState, and fieldPermissionState removed - now managed by Zustand/TanStack Query
})

// rootSaga removed - all sagas have been migrated to TanStack Query/Zustand
// - connectionsSagas removed - connections now managed by Zustand
// - connectionSagas removed - connection identity now managed by TanStack Query
// - permissionSagas removed - permissions now managed by TanStack Query (Phase 7)
// - fieldPermissionSagas removed - field permissions now managed by TanStack Query mutations (Phase 8)
// - sObjectSagas removed - sObject describe now managed by TanStack Query
// - queryResultSagas removed - query execution now managed by TanStack Query mutations (Phase 9)
// - queriesSagas removed - query state now managed by Zustand (Phase 9)
// - userSagas removed - user state now managed by Zustand
