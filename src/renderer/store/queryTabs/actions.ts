import { QueryTabsActionTypes, QueryTabState } from './types'

export function onQueryTabCreate(id: string) {
  return {
    payload: id,
    type: QueryTabsActionTypes.CREATE
  }
}

export function onQueryTabsChange(queryTabs: any) {
  return {
    payload: queryTabs,
    type: QueryTabsActionTypes.SET
  }
}

export function onQueryTabChange(queryTab: QueryTabState) {
  return {
    payload: queryTab,
    type: QueryTabsActionTypes.SET_TAB
  }
}

export function onQueryTabMove(toId: string, fromId: string) {
  return {
    payload: { toId, fromId },
    type: QueryTabsActionTypes.MOVE
  }
}

export function onQueryTabDelete(id: string) {
  return {
    payload: id,
    type: QueryTabsActionTypes.DELETE
  }
}