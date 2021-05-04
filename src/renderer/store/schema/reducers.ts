import { SchemaActionTypes, SchemaState } from './types'
import { Reducer, AnyAction } from 'redux'

const initialState: SchemaState = {
  sobjects: [],
  toolingObjects: []
}

const schemaReducer: Reducer<SchemaState, AnyAction> = (
  state: SchemaState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case SchemaActionTypes.SET:
      return {
        ...state,
        ...action.payload,
        errors: null
      }
    case SchemaActionTypes.ERROR:
      return {
        ...state, 
        errors: action.payload
      }
    default:
      return state
  }
}

export default schemaReducer
