import { DescribeSObjectResult } from 'jsforce'

export enum SObjectActionTypes {
  ON_CHANGE = '@@sobject/ON_CHANGE',
  SET = '@@sobject/SET',
  CREATE = '@@sobject/CREATE',
  DELETE = '@@sobject/DELETE',
  ERROR = '@@sobject/ERROR'
}

export interface SObjectsState {
  readonly byTabId:  { [key: string]: SObjectState }
}

export interface SObjectState {
  readonly tabId?: string
  readonly sobject?: DescribeSObjectResult
  readonly fieldSchema ?: any
  readonly errors?: string
}