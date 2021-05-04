export enum QueryResultActionTypes {
  SET = '@@queryResult/SET',
  SET_FIELD = '@@queryResult/SET_FIELD',
  SET_DATA = '@@queryResult/SET_DATA',
  CREATE = '@@queryResult/CREATE',
  DELETE = '@@queryResult/DELETE',
  SUCCESS = '@@queryResult/SUCCESS',
  SUCCESS_MORE = '@@queryResult/SUCCESS_MORE',
  ON_QUERY = '@@queryResult/ON_QUERY',
  ON_CANCEL = '@@queryResult/ON_CANCEL',
  ON_FIELD_CHANGE = '@@queryResult/ON_FIELD_CHANGE',
  ON_UPDATE = '@@queryResult/ON_UPDATE',
  ON_DELETE = '@@queryResult/ON_DELETE',
  PENDING = '@@queryResult/PENDING',
  DONE = '@@queryResult/DONE',
  ERROR = '@@queryResult/ERROR'
}

export interface QueryResultsState {
  readonly byTabId:  { [key: string]: QueryResultState }
}

export interface QueryResultState {
  readonly tabId: string
  readonly data: any
  readonly filteredIds: string[]
  readonly selectedIds: string[]
  readonly totalSize: any
  readonly pending: boolean
  readonly dmlPending: boolean
  readonly errors?: any
}