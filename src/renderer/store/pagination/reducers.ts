import { PaginationActionTypes, PaginationState } from './types'
import { Reducer } from 'redux'

const initialState: PaginationState = {
  pageSize: 25
}

const paginationReducer: Reducer<PaginationState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case PaginationActionTypes.SET_PAGINATION:
      return { ...state, pageSize: action.payload }
    default:
      return state
  }
}

export default paginationReducer
