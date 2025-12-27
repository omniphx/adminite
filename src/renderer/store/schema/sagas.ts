import { put, select, takeLatest, all, call } from 'redux-saga/effects'
import { SchemaActionTypes } from './types'
import { DescribeGlobalResult, QueryResult } from 'jsforce'
import { getConnection } from '../index'
import { ipcRenderer } from 'electron'

export function* describe() {
  try {
    yield all([
      call(describeGlobal),
      call(describeToolingGlobal),
      call(getNamespace)
    ])
  } catch (error) {
    yield put({ type: SchemaActionTypes.ERROR, payload: error.message })
  }
}

export function* describeGlobal() {
  try {
    const connection: any = yield select(getConnection)
    const apiResult = yield ipcRenderer.invoke('salesforce:describeGlobal', connection)
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const result: DescribeGlobalResult = apiResult.data
    const { sobjects } = result
    yield put({
      payload: { sobjects },
      type: SchemaActionTypes.SET
    })
  } catch (error) {
    yield put({ type: SchemaActionTypes.ERROR, payload: error.message })
  }
}

export function* describeToolingGlobal() {
  try {
    const connection: any = yield select(getConnection)
    const apiResult = yield ipcRenderer.invoke('salesforce:toolingDescribeGlobal', connection)
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const result: DescribeGlobalResult = apiResult.data
    yield put({
      payload: { toolingObjects: result.sobjects },
      type: SchemaActionTypes.SET
    })
  } catch (error) {
    yield put({ type: SchemaActionTypes.ERROR, payload: error.message })
  }
}

export function* getNamespace() {
  try {
    const connection: any = yield select(getConnection)
    const apiResult = yield ipcRenderer.invoke('salesforce:query', {
      ...connection,
      queryString: `SELECT NamespacePrefix FROM Organization`
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const result: QueryResult<{}> = apiResult.data
    yield put({
      payload: { namespace: result.records[0]['NamespacePrefix'] },
      type: SchemaActionTypes.SET
    })
  } catch (error) {
    yield put({
      payload: error.message,
      type: SchemaActionTypes.ERROR
    })
  }
}