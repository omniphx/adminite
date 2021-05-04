import { Reducer } from 'redux'
import { ConnectionState, ConnectionActionTypes } from './types'
import { Connection } from 'jsforce'

const initialState: ConnectionState = {
  connection: new Connection({}),
  pending: false
}

const connectionReducer: Reducer<ConnectionState> = (state = initialState, action) => {
  switch (action.type) {
    case ConnectionActionTypes.SET:
      return {
        ...state,
        ...action.payload,
        error: null
      }
    case ConnectionActionTypes.ERROR:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

export default connectionReducer