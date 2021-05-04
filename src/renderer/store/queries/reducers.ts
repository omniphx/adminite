import { Reducer } from 'redux'
import { QueriesState, QueriesActionTypes } from './types'

const initialState: QueriesState = {
  byTabId: {
    initial: {
      tabId: 'initial',
      searchFilter: '',
      includeDeleted: false,
      toolingMode: false,
      query: {
        body: ''
      },
      paginationConfig: {
        pageSize: 25,
        current: 1
      },
      parsedQuery: {},
      batchSize: 200
    }
  }
}

const queriesReducer: Reducer<QueriesState> = (state = initialState, action) => {
  switch (action.type) {
    case QueriesActionTypes.CREATE:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload]: {
            tabId: action.payload,
            searchFilter: '',
            includeDeleted: false,
            toolingMode: false,
            query: {
              body: ''
            },
            paginationConfig: {
              pageSize: 25,
              current: 1
            },
            parsedQuery: {},
            batchSize: 200
          }
        },
        error: null
      }
    case QueriesActionTypes.SET:
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
    case QueriesActionTypes.DELETE:
      delete state.byTabId[action.payload]
      return state
    case QueriesActionTypes.ERROR:
      return {
        ...state,
        error: action.payload
      }
    default:
      return state
  }
}

export default queriesReducer