import { SObjectActionTypes, SObjectsState } from './types'
import { Reducer, AnyAction } from 'redux'

//Using a reducer factory to handle multiple instances
function createSObjectReducer(type: string): Reducer<SObjectsState, AnyAction> {
  const initialState: SObjectsState = {
    byTabId: {
      initial: {
        tabId: 'initial'
      }
    }
  }

  return (
    state: SObjectsState = initialState,
    action: AnyAction
  ) => {
    switch (action.type) {
      case `${SObjectActionTypes.CREATE}_${type}`:
        return {
          ...state,
          byTabId: {
            ...state.byTabId,
            [action.payload]: {
              tabId: action.payload
            }
          }
        }
      case `${SObjectActionTypes.SET}_${type}`:
        return {
          ...state,
          byTabId: {
            ...state.byTabId,
            [action.payload.tabId]: {
              ...state.byTabId[action.payload.tabId],
              ...action.payload
            }
          },
          error: null
        }
      case `${SObjectActionTypes.DELETE}_${type}`:
        delete state.byTabId[action.payload]
        return state
      case `${SObjectActionTypes.ERROR}_${type}`:
        return { ...state, errors: action.payload }
      default:
        return state
    }
  }
}

export default createSObjectReducer
