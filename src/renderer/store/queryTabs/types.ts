export enum QueryTabsActionTypes {
  CREATE = '@@querytabs/CREATE',
  SET = '@@querytabs/SET',
  MOVE = '@@querytabs/MOVE',
  DELETE = '@@querytabs/DELETE',
  SET_TAB = '@@querytabs/SET_TAB',
  ERROR = '@@querytabs/ERROR',
}

export interface QueryTabsState {
  readonly byId:  { [key: string]: QueryTabState }
  readonly allIds : string[]
  readonly activeId?: string
}

export interface QueryTabState {
  readonly id: string
  readonly title: string
}