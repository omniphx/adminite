import { Reducer } from 'redux'
import { UserState, UserActionTypes } from './types'

const initialState: UserState = {
  authenticated: false
}

const userReducer: Reducer<UserState> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.SET:
      return {
        ...state,
        ...action.payload,
        error: null
      }
    case UserActionTypes.ERROR:
      return {
        ...state,
        error: action.payload
      }
    default:
      return state
  }
}

export default userReducer