import { PermissionActionTypes, PermissionState } from './types'
import { Reducer } from 'redux'

const initialState: PermissionState = {
  permissionIds: [],
  permissionType: 'profile',
  permissions: [],
  sobjectName: '',
  sobjects: [],
  fields: [],
  filter: ''
}

const permissionReducer: Reducer<PermissionState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case PermissionActionTypes.SET_IDS:
      return {
        ...state,
        permissionIds: action.payload
      }
    case PermissionActionTypes.SET_TYPE:
      return {
        ...state,
        permissionType: action.payload
      }
    case PermissionActionTypes.SET:
      return {
        ...state,
        ...action.payload,
        errors: null
      }
    case PermissionActionTypes.PERMISSIONS_RESULT:
      return { ...state, permissions: action.payload, errors: null }
    case PermissionActionTypes.ERROR:
      return {
        ...state,
        errors: action.payload
      }
    default:
      return state
  }
}

export default permissionReducer
