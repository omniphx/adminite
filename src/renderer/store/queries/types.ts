import { TablePaginationConfig } from 'antd'

export enum QueriesActionTypes {
  CREATE = '@@queries/CREATE',
  SET = '@@queries/SET',
  DELETE = '@@queries/DELETE',
  ON_CHANGE = '@@queries/ON_CHANGE',
  ON_FILTER = '@@queries/ON_FILTER',
  ERROR = '@@queries/ERROR'
}

export interface QueriesState {
  readonly byTabId: { [key: string]: QueryState }
}

export interface QueryState {
  readonly tabId: string
  readonly query: SoqlQuery
  readonly searchFilter: string
  readonly includeDeleted: boolean
  readonly toolingMode: boolean
  readonly errors?: any
  readonly paginationConfig: TablePaginationConfig
  readonly parsedQuery?: any
  readonly batchSize: number
}

export interface SoqlQuery {
  id?: string
  name?: string
  body: string
}
