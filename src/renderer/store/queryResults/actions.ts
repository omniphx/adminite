import { QueryResultActionTypes } from './types'

export function onQueryResultCreate(tabId: string) {
  return {
    payload: tabId,
    type: QueryResultActionTypes.CREATE
  }
}

export function onQueryResultDelete(tabId: string) {
  return {
    payload: tabId,
    type: QueryResultActionTypes.DELETE
  }
}

export function onQueryResultChange(queryResult: any) {
  return {
    payload:queryResult,
    type: QueryResultActionTypes.SET
  }
}

export function onQueryResultDataChange(tabId: string, data: any) {
  return {
    payload: { tabId, data },
    type: QueryResultActionTypes.SET_DATA
  }
}

export function onFieldChange(tabId: string, record: any) {
  return {
    payload: { tabId, record },
    type: QueryResultActionTypes.ON_FIELD_CHANGE
  }
}

export function onUpdate(tabId: string) {
  return {
    payload: { tabId },
    type: QueryResultActionTypes.ON_UPDATE
  }
}

export function onDelete(tabId: string) {
  return {
    payload: { tabId },
    type: QueryResultActionTypes.ON_DELETE
  }
}

export function onQuery(tabId: string, queryString: string, includeDeleted: boolean) {
  return {
    payload: { tabId, queryString, includeDeleted },
    type: QueryResultActionTypes.ON_QUERY
  }
}

export function onCancel(tabId: string) {
  return {
    payload: { tabId },
    type: QueryResultActionTypes.ON_CANCEL
  }
}