import { put, select, takeEvery, fork, all } from 'redux-saga/effects'
import { QueryResult } from 'jsforce'
import { getProfileFieldPermissions, getPermisionSetFieldPermissions } from '../../utils/queryBuilder'
import { FieldPermissionActionTypes } from './types'
import {
  getFieldPermissionState,
  getPermissionState
} from '../index'
import { ipcRenderer } from 'electron'
import { useConnectionStore, getActiveConnection } from '../../stores/useConnectionStore'

// Helper to get active connection from Zustand store (Phase 4)
function getConnectionFromZustand() {
  return getActiveConnection(useConnectionStore.getState())
}

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
    const connection = getConnectionFromZustand()
    const { permissionIds, permissionType, sobjectName } = yield select(getPermissionState)

    if (!sobjectName) return
    if (!permissionIds) return
    if (!connection) return

    const queryString: string =
      permissionType === 'profile'
        ? getProfileFieldPermissions(sobjectName, permissionIds)
        : getPermisionSetFieldPermissions(sobjectName, permissionIds)

    const apiResult = yield ipcRenderer.invoke('salesforce:query', {
      ...connection,
      queryString,
      toolingMode: false
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const result: QueryResult<{}> = apiResult.data

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
    const connection = getConnectionFromZustand()
    const { fieldPermissionsToSave } = yield select(getFieldPermissionState)

    yield put({ type: FieldPermissionActionTypes.SAVE_PENDING })

    const fieldPermissionsToSaveValues: any[] = Object.values(fieldPermissionsToSave)
    const permissionsToInsert = fieldPermissionsToSaveValues.filter(permission => !permission.hasOwnProperty('Id'))
    const permissionsToUpdate = fieldPermissionsToSaveValues.filter(permission => permission.hasOwnProperty('Id'))

    let insertResult: any[] = []
    let updateResult: any[] = []

    if (permissionsToInsert.length > 0) {
      const insertApiResult = yield ipcRenderer.invoke('salesforce:insert', {
        ...connection,
        sobjectType: 'FieldPermissions',
        records: permissionsToInsert,
        toolingMode: false
      })
      if (!insertApiResult.success) {
        throw new Error(insertApiResult.error)
      }
      insertResult = insertApiResult.data
    }

    if (permissionsToUpdate.length > 0) {
      const updateApiResult = yield ipcRenderer.invoke('salesforce:update', {
        ...connection,
        sobjectType: 'FieldPermissions',
        records: permissionsToUpdate,
        toolingMode: false
      })
      if (!updateApiResult.success) {
        throw new Error(updateApiResult.error)
      }
      updateResult = updateApiResult.data
    }

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
