import { put, select, takeLatest, all, call } from 'redux-saga/effects'
import { SchemaActionTypes } from './types'
import { DescribeGlobalResult, Connection, QueryResult } from 'jsforce'
import { getConnection } from '../index'

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
    const salesforce: Connection = yield select(getConnection)
    const result: DescribeGlobalResult = yield salesforce.describeGlobal()
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
    const salesforce: Connection = yield select(getConnection)
    const result: DescribeGlobalResult = yield salesforce.tooling.describeGlobal()
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
    const salesforce: Connection = yield select(getConnection)
    const result: QueryResult<{}> = yield salesforce.query(
      `SELECT NamespacePrefix FROM Organization`
    )
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