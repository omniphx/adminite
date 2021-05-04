import { FieldPermissionActionTypes } from './types'

export function onFieldPermissionChange(fieldLevelPermission: object) {
  return {
    payload: fieldLevelPermission,
    type: FieldPermissionActionTypes.ON_CHANGE
  }
}

export function saveFieldPermissions() {
  return {
    type: FieldPermissionActionTypes.ON_SAVE
  }
}
