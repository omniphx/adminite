import { SObjectActionTypes } from './types'

export function onQuerySObjectCreate(tabId: string) {
  return onSObjectCreate('QUERY', tabId)
}

export function onQuerySObjectChange(tabId: string, sObjectName: string) {
  return onSObjectChange('QUERY', { tabId, sObjectName })
}

export function onQuerySObjectDelete(tabId: string) {
  return onSObjectDelete('QUERY', tabId)
}

export function onResultSObjectCreate(tabId: string) {
  return onSObjectCreate('RESULT', tabId)
}

export function onResultSObjectChange(tabId: string, sObjectName: string) {
  return onSObjectChange('RESULT', { tabId, sObjectName })
}

export function onResultObjectDelete(tabId: string) {
  return onSObjectDelete('RESULT', tabId)
}

function onSObjectCreate(type: string, payload: any) {
  return {
    payload: payload,
    type: `${SObjectActionTypes.CREATE}_${type}`
  }
}

function onSObjectChange(type: string, payload: any) {
  return {
    payload: payload,
    type: `${SObjectActionTypes.ON_CHANGE}_${type}`
  }
}

function onSObjectDelete(type: string, payload: any) {
  return {
    payload: payload,
    type: `${SObjectActionTypes.DELETE}_${type}`
  }
}