import { ApplicationState } from '../store/index'
import * as Sentry from '@sentry/electron';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state')
    if(serializedState === null) {
      return undefined
    }

    const state: ApplicationState = JSON.parse(serializedState)

    state.queryTabsState.allIds.forEach(tabId => {
      //Backfill if missing pagination configurations
      if(!state.queriesState.byTabId[tabId].paginationConfig) {
        state.queriesState.byTabId[tabId] = {
          ...state.queriesState.byTabId[tabId],
          paginationConfig: { pageSize: 25, current: 1 }
        }
      }
      if(!state.queryResultsState.byTabId[tabId].filteredIds) {
        state.queryResultsState.byTabId[tabId] = {
          ...state.queryResultsState.byTabId[tabId],
          filteredIds: []
        }
      }
      if(!state.queryResultsState.byTabId[tabId].selectedIds) {
        state.queryResultsState.byTabId[tabId] = {
          ...state.queryResultsState.byTabId[tabId],
          selectedIds: []
        }
      }
      if(!state.resultSobjectsState.byTabId[tabId].fieldSchema) {
        state.resultSobjectsState.byTabId[tabId] = {
          ...state.resultSobjectsState.byTabId[tabId],
          fieldSchema: {}
        }
      }
      if(!state.querySobjectsState.byTabId[tabId].fieldSchema) {
        state.querySobjectsState.byTabId[tabId] = {
          ...state.querySobjectsState.byTabId[tabId],
          fieldSchema: {}
        }
      }
      if(!state.queriesState.byTabId[tabId].batchSize) {
        state.queriesState.byTabId[tabId] = {
          ...state.queriesState.byTabId[tabId],
          batchSize: 200
        }
      }
      if(!state.userState.queryHotkey) {
        state.userState = {
          ...state.userState,
          queryHotkey: 'ctrl+shift+x'
        }
      }
    })

    return state
  } catch(error) {
    Sentry.withScope((scope) => {
      scope.setExtras(error)
      Sentry.captureException(error.message)
    })
    console.error(error)
    return undefined
  }
}

export const saveState = (currentState) => {
  try {
    const serializedState = JSON.stringify(currentState)
    localStorage.setItem('state', serializedState)
  } catch(error) {
    Sentry.withScope((scope) => {
      scope.setExtras(error)
      Sentry.captureException(error.message)
    })
    console.error(error)
  }
}