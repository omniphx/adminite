import { ConnectionsState, ConnectionsActionTypes } from './types'
import { Reducer } from 'redux'

const initialState: ConnectionsState = {
  connections: {},
  modalVisiblity: false
}

const connectionReducer: Reducer<ConnectionsState> = (state = initialState, action) => {
  switch (action.type) {
    case ConnectionsActionTypes.SET:
      if(Array.isArray(action.payload)) {
        const connections = {}
        action.payload.forEach(connection => {
          connections[connection.id] = connection
        })
        return {
          ...state,
          connections,
          errors: null
        }
      } else {
        const connection = action.payload
        return {
          ...state,
          connections: {
            ...state.connections,
            [connection.id]: connection,
          },
          errors: null
        }
      }
    case ConnectionsActionTypes.TOGGLE_MODAL:
      return {
        ...state,
        modalVisiblity: !state.modalVisiblity,
        errors: null
      }
    case ConnectionsActionTypes.ERROR:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

export default connectionReducer
