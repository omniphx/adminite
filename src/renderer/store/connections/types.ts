export enum ConnectionsActionTypes {
  GET = '@@connections/GET',
  SET = '@@connections/SET',
  CREATE = '@@connections/CREATE',
  ON_CHANGE = '@@connections/ON_CHANGE',
  ON_DELETE = '@@connections/ON_DELETE',
  ON_MOVE = '@@connections/ON_MOVE',
  INIT = '@@connections/INIT',
  TOGGLE_MODAL = '@@connections/TOGGLE_MODAL',
  ERROR = '@@connections/ERROR'
}

export interface ConnectionsState {
  readonly connections?: any
  readonly errors?: any
  readonly modalVisiblity: boolean
}
