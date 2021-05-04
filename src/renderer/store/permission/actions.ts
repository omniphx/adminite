import { PermissionActionTypes } from './types'

export function onPermissionsInit() {
  return {
    type: PermissionActionTypes.ON_INIT
  }
}

export function onPermissionChange(permissionWrapper: any) {
  return {
    payload: permissionWrapper,
    type: PermissionActionTypes.SET
  }
}

export function onSObjectChange(sobjectName: string) {
  return {
    payload: sobjectName,
    type: PermissionActionTypes.ON_SOBJECT_CHANGE
  }
}

export function onPermissionIdsChange(permissionIds: string[]) {
  return {
    payload: permissionIds,
    type: PermissionActionTypes.ON_IDS_CHANGE
  }
}

export function onPermissionTypeChange(permissionType: string) {
  return {
    payload: permissionType,
    type: PermissionActionTypes.ON_TYPE_CHANGE
  }
}
