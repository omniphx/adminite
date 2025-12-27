import { put, takeLatest, all, fork, select } from 'redux-saga/effects'
import { SObjectActionTypes } from './types'
import { DescribeSObjectResult } from 'jsforce'
import { getConnection, getToolingMode } from '../index'
import { ipcRenderer } from 'electron'

//Type is used to handle multiple saga instances
export function* sObjectSagas(type: string) {
  yield all([
    fork(watchSObjectChanges, type)
  ])
}

function* watchSObjectChanges(type: string) {
  yield takeLatest(`${SObjectActionTypes.ON_CHANGE}_${type}`, describeSObject)
}

export function* describeSObject(action: any) {
  const words = action.type.split('_')
  const type = words[words.length - 1]
  const { tabId, sObjectName } = action.payload
  try {
    const connectionInfo: any = yield select(getConnection)
    const toolingMode: boolean = yield select(getToolingMode, tabId)

    const result = yield ipcRenderer.invoke('salesforce:describe', {
      accessToken: connectionInfo.accessToken,
      instanceUrl: connectionInfo.instanceUrl,
      refreshToken: connectionInfo.refreshToken,
      sObjectName,
      toolingMode
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    const sobject: DescribeSObjectResult = result.data
    const fieldSchema = sobject.fields.reduce((accumulator, field: any) => {
      accumulator[field.name] = field
      return accumulator
    }, {})
    yield put({
      payload: { sobject, tabId, fieldSchema },
      type: `${SObjectActionTypes.SET}_${type}`
    })
  } catch (error) {
    yield put({
      payload: { tabId, error: error.message },
      type: `${SObjectActionTypes.ERROR}_${type}`
    })
  }
}
