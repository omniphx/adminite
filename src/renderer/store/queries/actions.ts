import { QueriesActionTypes } from "./types";

export function onQueryCreate(tabId: string) {
  return {
    payload: tabId,
    type: QueriesActionTypes.CREATE
  }
}

export function onQueryChange(query: any) {
  return {
    payload: query,
    type: QueriesActionTypes.SET
  }
}

export function onFilterChange(tabId: string, filter: string) {
  return {
    payload: { tabId, filter },
    type: QueriesActionTypes.ON_FILTER
  }
}

export function onQueryDelete(tabId: string) {
  return {
    payload: tabId,
    type: QueriesActionTypes.DELETE
  }
}