export enum PaginationActionTypes {
  SET_PAGINATION = '@@pagination/SET_PAGINATION'
}

export interface PaginationState {
  readonly pageSize: number
}
