export enum FieldPermissionActionTypes {
  QUERY_RESULT = '@@fieldPermission/QUERY',
  ON_CHANGE = '@@fieldPermission/ON_CHANGE',
  ON_SAVE = '@@fieldPermission/ON_SAVE',
  SAVE_RESULT = '@@fieldPermission/SAVE',
  SAVE_PENDING = '@@fieldPermission/SAVE_PENDING',
  ERROR = '@@fieldPermission/ERROR'
}

export interface FieldPermissionState {
  readonly fieldPermissions?: any
  readonly fieldPermissionsToSave?: any
  readonly saveResults?: any
  readonly savePending?: boolean
  readonly errors?: any
}