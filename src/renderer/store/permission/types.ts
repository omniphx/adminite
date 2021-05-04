export enum PermissionActionTypes {
  ON_INIT = '@@permission/ON_INIT',
  ON_TYPE_CHANGE = '@@permission/ON_TYPE_CHANGE',
  ON_IDS_CHANGE = '@@permission/ON_IDS_CHANGE',
  ON_SOBJECT_CHANGE = '@@permission/ON_SOBJECT_CHANGE',
  SELECTED = '@@permission/SELECTED',
  SET_TYPE = '@@permission/SET_TYPE',
  SET_IDS = '@@permission/SET_IDS',
  SET = '@@permission/SET',
  PERMISSIONS_RESULT = '@@permission/PERMISSIONS_RESULT',
  ERROR = '@@permission/ERROR'
}

export interface PermissionState {
  readonly permissions?: any
  readonly permissionIds?: string[]
  readonly permissionType?: string
  readonly sobjects?:any[]
  readonly sobjectName?:string
  readonly fields?:any[]
  readonly errors?: any
  readonly filter?: string
}
