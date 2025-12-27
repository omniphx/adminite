import { all, fork } from 'redux-saga/effects'
import { combineReducers } from 'redux'

import { PaginationState } from './pagination/types'
import paginationReducer from './pagination/reducers'

import { SchemaState } from './schema/types'
import schemaReducer from './schema/reducers'

import { PermissionState } from './permission/types'
import permissionReducer from './permission/reducers'
import { permissionSagas } from './permission/sagas'

// ConnectionsState removed - now managed by useConnectionStore (Zustand)
// ConnectionState removed - now managed by useConnectionStore (Zustand) and TanStack Query

import { FieldPermissionState } from './fieldPermission/types'
import fieldPermissionReducer from './fieldPermission/reducers'
import { fieldPermissionSagas } from './fieldPermission/sagas'

// Feature, User, Connections, and Connection state are now managed by Zustand stores
// Schema global describe is now loaded via TanStack Query

import { QueryHistoryState } from './queryHistory/types'
import queryHistoryReducer from './queryHistory/reducers'

import { QueryTabsState } from './queryTabs/types'
import queryTabsReducer from './queryTabs/reducers'

import { SObjectsState } from './sobject/types'
import { sObjectSagas } from './sobject/sagas'
import createSObjectReducer from './sobject/reducerFactory'

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

export const getSchemaState = (state: ApplicationState) => state.schemaState
// getFeatureState removed - use useFeatureStore from Zustand instead

export const getData = (state: ApplicationState, tabId: string) => state.queryResultsState.byTabId[tabId].data
export const getSelectedIds = (state: ApplicationState, tabId: string) => state.queryResultsState.byTabId[tabId].selectedIds
export const getFilteredIds = (state: ApplicationState, tabId: string) => state.queryResultsState.byTabId[tabId].filteredIds

export const getFilter = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].searchFilter
export const getToolingMode = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].toolingMode
export const getBatchSize = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].batchSize
export const getQueryString = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].query.body
export const getIncludeDeleted = (state: ApplicationState, tabId: string) => state.queriesState.byTabId[tabId].includeDeleted

export const getResultSObject = (state: ApplicationState, tabId: string) => state.resultSobjectsState.byTabId[tabId].sobject

export const getActiveTabId = (state: ApplicationState) => state.queryTabsState.activeId
export interface ApplicationState {
  paginationState: PaginationState
  schemaState: SchemaState
  fieldPermissionState: FieldPermissionState
  permissionState: PermissionState
  queryHistoryState: QueryHistoryState
  queryTabsState: QueryTabsState
  querySobjectsState: SObjectsState
  resultSobjectsState: SObjectsState
  queryResultsState: QueryResultsState
  queriesState: QueriesState
  // featureState, userState, connectionsState, and connectionState are now managed by Zustand stores
}

export const rootReducer = combineReducers<ApplicationState>({
  paginationState: paginationReducer,
  schemaState: schemaReducer,
  fieldPermissionState: fieldPermissionReducer,
  permissionState: permissionReducer,
  queryHistoryState: queryHistoryReducer,
  queryTabsState: queryTabsReducer,
  querySobjectsState: createSObjectReducer('QUERY'),
  resultSobjectsState: createSObjectReducer('RESULT'),
  queryResultsState: queryResultReducer,
  queriesState: queriesReducer,
  // featureState, userState, connectionsState, and connectionState removed - now managed by Zustand stores
})

export function* rootSaga() {
  yield all([
    // connectionsSagas removed - connections now managed by Zustand
    // connectionSagas removed - connection identity now managed by TanStack Query
    fork(permissionSagas),
    fork(fieldPermissionSagas),
    fork(sObjectSagas, 'RESULT'),
    fork(sObjectSagas, 'QUERY'),
    fork(queryResultSagas),
    fork(queriesSagas),
    // userSagas removed - user state now managed by Zustand
  ])
}
