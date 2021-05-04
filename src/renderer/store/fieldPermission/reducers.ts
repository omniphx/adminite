import { FieldPermissionActionTypes, FieldPermissionState } from './types'
import { Reducer } from 'redux'

const initialState: FieldPermissionState = {
  fieldPermissions: {},
  fieldPermissionsToSave: {},
  savePending: false
}

const fieldPermissionReducer: Reducer<FieldPermissionState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case FieldPermissionActionTypes.QUERY_RESULT:
      return {
        ...state,
        fieldPermissions: action.payload,
        fieldPermissionsToSave: {},
        errors: null
      }
    case FieldPermissionActionTypes.ON_CHANGE:
      return {
        ...state,
        fieldPermissions: {
          ...state.fieldPermissions,
          ...action.payload
        },
        fieldPermissionsToSave: {
          ...state.fieldPermissionsToSave,
          ...action.payload
        },
        errors: null
      }
    case FieldPermissionActionTypes.SAVE_PENDING:
      return {
        ...state,
        savePending: true,
        errors: null
      }
    case FieldPermissionActionTypes.SAVE_RESULT:
      return {
        ...state,
        saveResults: {
          ...state.saveResults,
          ...action.payload
        },
        savePending: false,
        fieldPermissionsToSave: [],
        errors: null
      }
    case FieldPermissionActionTypes.ERROR:
      return {
        ...state,
        savePending: false,
        errors: action.payload
      }
    default:
      return state
  }
}

export default fieldPermissionReducer
