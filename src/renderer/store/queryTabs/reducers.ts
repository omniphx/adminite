import { Reducer } from 'redux'
import { QueryTabsState, QueryTabsActionTypes } from './types'
import { moveItemById } from '../../../helpers/utils'

const initialState: QueryTabsState = {
  activeId: 'initial',
  byId: {
    initial: {
      id: 'initial',
      title: ''
    }
  },
  allIds: ['initial']
}

const queryTabsReducer: Reducer<QueryTabsState> = (state = initialState, action) => {
  switch (action.type) {
    case QueryTabsActionTypes.CREATE:
      const id = action.payload
      return {
        activeId: id,
        byId: {
          ...state.byId,
          [id]: {
            id,
            title: ''
          }
        },
        allIds: [...state.allIds, id]
      }
    case QueryTabsActionTypes.SET:
      return {
        ...state,
        ...action.payload,
        error: null
      }
    case QueryTabsActionTypes.SET_TAB:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload
          }
        },
        error: null
      }
    case QueryTabsActionTypes.MOVE:
      const { toId, fromId } = action.payload
      moveItemById(state.allIds, fromId, toId)
      return {
        ...state,
        allIds: state.allIds
      }
    case QueryTabsActionTypes.DELETE:
      const index = state.allIds.indexOf(action.payload)
      const activeId = getNextId(state, index, action.payload)
      delete state.byId[action.payload]
      state.allIds.splice(index, 1)
      return {
        activeId,
        byId: state.byId,
        allIds: state.allIds,
        error: null
      }
    case QueryTabsActionTypes.ERROR:
      return {
        ...state,
        error: action.payload
      }
    default:
      return state
  }
}

function getNextId(state, index, currentId) {
  if (state.activeId !== currentId) return state.activeId

  return index === 0 && state.allIds.length > 1
    ? state.allIds[index + 1]
    : state.allIds[index - 1]
}

export default queryTabsReducer