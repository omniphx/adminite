import { all, fork } from 'redux-saga/effects'
import { combineReducers } from 'redux'

import { PaginationState } from './pagination/types'
import paginationReducer from './pagination/reducers'

import { SchemaState } from './schema/types'
import schemaReducer from './schema/reducers'

import { PermissionState } from './permission/types'
import permissionReducer from './permission/reducers'
import { permissionSagas } from './permission/sagas'

import { ConnectionsState } from './connections/types'
import connectionsReducer from './connections/reducers'
import { connectionsSagas } from './connections/sagas'

import { FieldPermissionState } from './fieldPermission/types'
import fieldPermissionReducer from './fieldPermission/reducers'
import { fieldPermissionSagas } from './fieldPermission/sagas'

import { FeatureState } from './feature/types'
import featureReducer from './feature/reducers'

import { UserState } from './user/types'
import userReducer from './user/reducers'
import { userSagas } from './user/sagas'

import { QueryHistoryState } from './queryHistory/types'
import queryHistoryReducer from './queryHistory/reducers'

import { ConnectionState } from './connection/types'
import connectionReducer from './connection/reducers'
import { connectionSagas } from './connection/sagas'

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

//Used inside sagas using select()
export const getConnection = (state: ApplicationState) => state.connectionState.connection
export const getConnectionId = (state: ApplicationState) => state.connectionState.connectionId

export const getConnections = (state: ApplicationState) => state.connectionsState.connections
export const getPermissionState = (state: ApplicationState) => state.permissionState
export const getFieldPermissionState = (state: ApplicationState) => state.fieldPermissionState

export const getSchemaState = (state: ApplicationState) => state.schemaState
export const getFeatureState = (state: ApplicationState) => state.featureState

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
  connectionsState: ConnectionsState
  featureState: FeatureState
  userState: UserState
  queryHistoryState: QueryHistoryState
  connectionState: ConnectionState
  queryTabsState: QueryTabsState
  querySobjectsState: SObjectsState
  resultSobjectsState: SObjectsState
  queryResultsState: QueryResultsState
  queriesState: QueriesState
}

export const rootReducer = combineReducers<ApplicationState>({
  paginationState: paginationReducer,
  schemaState: schemaReducer,
  fieldPermissionState: fieldPermissionReducer,
  permissionState: permissionReducer,
  connectionsState: connectionsReducer,
  featureState: featureReducer,
  userState: userReducer,
  queryHistoryState: queryHistoryReducer,
  connectionState: connectionReducer,
  queryTabsState: queryTabsReducer,
  querySobjectsState: createSObjectReducer('QUERY'),
  resultSobjectsState: createSObjectReducer('RESULT'),
  queryResultsState: queryResultReducer,
  queriesState: queriesReducer
})

export function* rootSaga() {
  yield all([
    fork(connectionsSagas),
    fork(permissionSagas),
    fork(fieldPermissionSagas),
    fork(connectionSagas),
    fork(sObjectSagas, 'RESULT'),
    fork(sObjectSagas, 'QUERY'),
    fork(queryResultSagas),
    fork(queriesSagas),
    fork(userSagas)
  ])
}
