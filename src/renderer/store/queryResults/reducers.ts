import { QueryResultActionTypes, QueryResultsState } from './types'
import { getRecordId } from '../../../helpers/utils'
import { AnyAction } from 'redux'
import { Reducer } from 'react'

const initialState: QueryResultsState = {
  byTabId: {
    initial: {
      tabId: 'initial',
      data: {},
      filteredIds: [],
      selectedIds: [],
      pending: false,
      dmlPending: false,
      totalSize: 0
    }
  }
}

const queryResultReducer: Reducer<QueryResultsState, AnyAction> = (
  state: QueryResultsState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case QueryResultActionTypes.CREATE:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload]: {
            tabId: action.payload,
            data: {},
            filteredIds: [],
            selectedIds: [],
            pending: false,
            dmlPending: false,
            totalSize: 0
          }
        }
      }
    case QueryResultActionTypes.SET:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            ...action.payload
          }
        }
      }
    case QueryResultActionTypes.SET_FIELD:
      const recordId = getRecordId(action.payload.record)
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            data: {
              ...state.byTabId[action.payload.tabId].data,
              [recordId]: {
                ...state.byTabId[action.payload.tabId].data[recordId],
                ...action.payload.record
              }
            }
          }
        }
      }
    case QueryResultActionTypes.SET_DATA:
      const { tabId, data } = action.payload
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [tabId]: {
            ...state.byTabId[tabId],
            data: {
              ...state.byTabId[tabId].data,
              ...data
            }
          }
        }
      }
    case QueryResultActionTypes.DELETE:
      delete state.byTabId[action.payload]
      return state
    case QueryResultActionTypes.SUCCESS:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            ...action.payload,
            errors: null
          }
        }
      }
    case QueryResultActionTypes.SUCCESS_MORE:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            data: {
              ...state.byTabId[action.payload.tabId].data,
              ...action.payload.data
            },
            filteredIds: [
              ...state.byTabId[action.payload.tabId].filteredIds,
              ...action.payload.filteredIds
            ],
            errors: null
          }
        }
      }
    case QueryResultActionTypes.DONE:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            pending: false
          }
        }
      }
    case QueryResultActionTypes.PENDING:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            pending: true,
            errors: null
          }
        }
      }
    case QueryResultActionTypes.ERROR:
      return {
        ...state,
        byTabId: {
          ...state.byTabId,
          [action.payload.tabId]: {
            ...state.byTabId[action.payload.tabId],
            data: [],
            pending: false,
            errors: action.payload.error
          }
        }
      }
    default:
      return state
  }
}

export default queryResultReducer
