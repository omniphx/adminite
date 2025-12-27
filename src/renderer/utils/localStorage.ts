import { ApplicationState } from '../store/index'

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state')
    if(serializedState === null) {
      return undefined
    }

    const state: ApplicationState = JSON.parse(serializedState)

    // queriesState and queryResultsState removed - now managed by Zustand with its own persistence (Phase 9)
    // The following backfill logic is no longer needed as these states are managed by Zustand stores:
    // - paginationConfig is in useTabStore
    // - filteredIds and selectedIds are in useQueryResultStore
    // - batchSize is in useTabStore
    // userState is now managed by Zustand with its own persistence
    // sobjectState (querySobjectsState, resultSobjectsState) is now managed by TanStack Query (Phase 6)

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
