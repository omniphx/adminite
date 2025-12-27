import { all, fork } from 'redux-saga/effects'
import { combineReducers } from 'redux'

import { PaginationState } from './pagination/types'
import paginationReducer from './pagination/reducers'

import { PermissionState } from './permission/types'
import permissionReducer from './permission/reducers'
import { permissionSagas } from './permission/sagas'

// ConnectionsState removed - now managed by useConnectionStore (Zustand)
// ConnectionState removed - now managed by useConnectionStore (Zustand) and TanStack Query

import { FieldPermissionState } from './fieldPermission/types'
import fieldPermissionReducer from './fieldPermission/reducers'
import { fieldPermissionSagas } from './fieldPermission/sagas'

// Feature, User, Connections, and Connection state are now managed by Zustand stores
// Schema state (sobjects, toolingObjects, namespace) is now managed by TanStack Query
// SObject describe state is now managed by TanStack Query (Phase 6)

import { QueryHistoryState } from './queryHistory/types'
import queryHistoryReducer from './queryHistory/reducers'

import { QueryTabsState } from './queryTabs/types'
import queryTabsReducer from './queryTabs/reducers'

import { QueryResultsState } from './queryResults/types'
import queryResultReducer from './queryResults/reducers'
import { queryResultSagas } from './queryResults/sagas'

import { QueriesState } from './queries/types'
import queriesReducer from './queries/reducers'
import { queriesSagas } from './queries/sagas'

// getConnection removed - use useConnectionStore.getState() + getActiveConnection instead
// getConnections removed - use useConnectionStore.getState().connections instead
export const getPermissionState = (state: ApplicationState) => state.permissionState
export const getFieldPermissionState = (state: ApplicationState) => state.fieldPermissionState
// getSchemaState removed - use TanStack Query hooks (useGlobalDescribeQuery, useNamespaceQuery) instead
// getFeatureState removed - use useFeatureStore from Zustand instead
// getResultSObject removed - use TanStack Query hooks (useResultSObjectDescribe) instead

export const getData = (state: ApplicationState, tabId: string) => state.queryResultsState.byTabId[tabId].data
export const getSelectedIds = (state: ApplicationState, tabId: string) => state.queryResultsState.byTabId[tabId].selectedIds
export const getFilteredIds = (state: ApplicationState, tabId: string) => state.queryResultsState.byTabId[tabId].filteredIds

export const getFilter = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].searchFilter
export const getToolingMode = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].toolingMode
export const getBatchSize = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].batchSize
export const getQueryString = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].query.body
export const getIncludeDeleted = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].includeDeleted

export const getActiveTabId = (state: ApplicationState) => state.queryTabsState.activeId
export interface ApplicationState {
  paginationState: PaginationState
  fieldPermissionState: FieldPermissionState
  permissionState: PermissionState
  queryHistoryState: QueryHistoryState
  queryTabsState: QueryTabsState
  queryResultsState: QueryResultsState
  queriesState: QueriesState
  // featureState, userState, connectionsState, connectionState, schemaState, and sobjectState are now managed by Zustand/TanStack Query
}

export const rootReducer = combineReducers<ApplicationState>({
  paginationState: paginationReducer,
  fieldPermissionState: fieldPermissionReducer,
  permissionState: permissionReducer,
  queryHistoryState: queryHistoryReducer,
  queryTabsState: queryTabsReducer,
  queryResultsState: queryResultReducer,
  queriesState: queriesReducer,
  // featureState, userState, connectionsState, connectionState, schemaState, and sobjectState removed - now managed by Zustand/TanStack Query
})

export function* rootSaga() {
  yield all([
    // connectionsSagas removed - connections now managed by Zustand
    // connectionSagas removed - connection identity now managed by TanStack Query
    fork(permissionSagas),
    fork(fieldPermissionSagas),
    // sObjectSagas removed - sObject describe now managed by TanStack Query
    fork(queryResultSagas),
    fork(queriesSagas),
    // userSagas removed - user state now managed by Zustand
  ])
}
