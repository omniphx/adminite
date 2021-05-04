import { put, select, takeEvery, fork, all } from 'redux-saga/effects'
import { Connection, QueryResult } from 'jsforce'
import { getProfileFieldPermissions, getPermisionSetFieldPermissions } from '../../utils/queryBuilder'
import { FieldPermissionActionTypes } from './types'
import {
  getConnection,
  getFieldPermissionState,
  getPermissionState
} from '../index'

export function* fieldPermissionSagas() {
  yield all([
    fork(watchFieldPermissionChanges)
  ])
}

function* watchFieldPermissionChanges() {
  yield takeEvery(FieldPermissionActionTypes.ON_SAVE, saveFieldPermissions)
}

export function* getFieldPermissions() {
  try {
    const salesforce: Connection = yield select(getConnection)
    const { permissionIds, permissionType, sobjectName } = yield select(getPermissionState)

    if (!sobjectName) return
    if (!permissionIds) return

    const queryString: string =
      permissionType === 'profile'
        ? getProfileFieldPermissions(sobjectName, permissionIds)
        : getPermisionSetFieldPermissions(sobjectName, permissionIds)

    const result: QueryResult<{}> = yield salesforce.query(queryString)

    const records = {}
    result.records.forEach(record => {
      records[record['Id']] = record
    })

    yield put({
      payload: records,
      type: FieldPermissionActionTypes.QUERY_RESULT
    })
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: FieldPermissionActionTypes.ERROR
    })
  }
}

export function* saveFieldPermissions() {
  try {
    const salesforce: Connection = yield select(getConnection)
    const { fieldPermissionsToSave } = yield select(getFieldPermissionState)

    yield put({ type: FieldPermissionActionTypes.SAVE_PENDING })

    const fieldPermissionsToSaveValues = Object.values(fieldPermissionsToSave)
    const permissionsToInsert = fieldPermissionsToSaveValues.filter(permission => !permission.hasOwnProperty('Id'))
    const permissionsToUpdate = fieldPermissionsToSaveValues.filter(permission => permission.hasOwnProperty('Id'))

    const insertResult: any = yield salesforce
      .sobject('FieldPermissions')
      .insert(permissionsToInsert)

    const updateResult: any = yield salesforce
      .sobject('FieldPermissions')
      .update(permissionsToUpdate)

    yield put({
      payload: [...insertResult, ...updateResult],
      type: FieldPermissionActionTypes.SAVE_RESULT
    })
    yield getFieldPermissions()
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: FieldPermissionActionTypes.ERROR
    })
  }
}
