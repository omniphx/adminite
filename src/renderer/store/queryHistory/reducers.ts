import { Reducer } from 'redux'
import { QueryHistoryState, QueryHistoryActionTypes } from './types'

const initialState: QueryHistoryState = {
  queries: []
}

const queryHistoryReducer: Reducer<QueryHistoryState> = (state = initialState, action) => {
  switch (action.type) {
    case QueryHistoryActionTypes.SET:
      return {
        ...state,
        queries: [...state.queries, action.payload],
        error: null
      }
    case QueryHistoryActionTypes.ERROR:
      return {
        ...state,
        error: action.payload
      }
    default:
      return state
  }
}

export default queryHistoryReducer