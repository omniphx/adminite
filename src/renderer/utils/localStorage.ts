import { ApplicationState } from '../store/index'

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
      if(!state.queriesState.byTabId[tabId].batchSize) {
        state.queriesState.byTabId[tabId] = {
          ...state.queriesState.byTabId[tabId],
          batchSize: 200
        }
      }
      // userState is now managed by Zustand with its own persistence
      // sobjectState (querySobjectsState, resultSobjectsState) is now managed by TanStack Query (Phase 6)
    })

    return state
  } catch(error) {
    console.error(error)
    return undefined
  }
}

export const saveState = (currentState) => {
  try {
    const serializedState = JSON.stringify(currentState)
    localStorage.setItem('state', serializedState)
  } catch(error) {
    console.error(error)
  }
}