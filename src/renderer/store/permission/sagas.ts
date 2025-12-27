import { put, select, takeLatest, all, fork } from 'redux-saga/effects'
import { QueryResult } from 'jsforce'
import { getProfiles, getPermissionSets } from '../../utils/queryBuilder'
import { PermissionActionTypes } from './types'
import { getPermissionState, ApplicationState } from '../index';
import { getFieldPermissions } from '../fieldPermission/sagas'
import { ipcRenderer } from 'electron'
import { useConnectionStore, getActiveConnection } from '../../stores/useConnectionStore'
import { queryClient } from '../../queries/queryClient'
import { queryKeys } from '../../queries/queryKeys'

// Helper to get active connection from Zustand store (Phase 4)
function getConnectionFromZustand() {
  return getActiveConnection(useConnectionStore.getState())
}

// Helper to get namespace from TanStack Query cache (Phase 5)
function getNamespaceFromCache(): string | null {
  const activeConnectionId = useConnectionStore.getState().activeConnectionId
  if (!activeConnectionId) return null
  return queryClient.getQueryData<string | null>(queryKeys.schema.namespace(activeConnectionId)) ?? null
}

export function* permissionSagas() {
  yield all([
    fork(watchInit),
    fork(watchPermissionTypeChanges),
    fork(watchPermissionIdChanges),
    fork(watchSObjectChanges)
  ])
}

function* watchInit() {
  yield takeLatest(PermissionActionTypes.ON_INIT, initializePermissions)
}

function* watchPermissionTypeChanges() {
  yield takeLatest(PermissionActionTypes.ON_TYPE_CHANGE, setPermissionType)
}

function* watchPermissionIdChanges() {
  yield takeLatest(PermissionActionTypes.ON_IDS_CHANGE, setPermissionIds)
}

function* watchSObjectChanges() {
  yield takeLatest(PermissionActionTypes.ON_SOBJECT_CHANGE, handleSObjectChange)
}

export function* initializePermissions(action: any) {
  try {
    yield all([
      getPermissions(),
      getSObjects()
    ])
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* setPermissionType(action: any) {
  try {
    yield put({
      payload: {
        permissionType: action.payload,
        permissionIds: []
      },
      type: PermissionActionTypes.SET
    })
    yield getPermissions()
    yield getFieldPermissions()
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* setPermissionIds(action: any) {
  try {
    yield put({
      payload: action.payload,
      type: PermissionActionTypes.SET_IDS
    })
    yield getFieldPermissions()
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* getPermissions() {
  try {
    const connection = getConnectionFromZustand()
    if(!connection) return

    const { permissionIds, permissionType } = yield select(getPermissionState)
    const namespace = getNamespaceFromCache()
    const queryString: string =
      permissionType === 'profile'
        ? getProfiles(permissionIds)
        : getPermissionSets(namespace, permissionIds)

    const apiResult = yield ipcRenderer.invoke('salesforce:query', {
      ...connection,
      queryString,
      toolingMode: false
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const result: QueryResult<{}> = apiResult.data

    yield put({
      payload: result.records,
      type: PermissionActionTypes.PERMISSIONS_RESULT
    })
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* getSObjects() {
  try {
    const connection = getConnectionFromZustand()
    const apiResult = yield ipcRenderer.invoke('salesforce:query', {
      ...connection,
      queryString: `SELECT Id, DeveloperName, Label, QualifiedApiName FROM EntityDefinition WHERE IsFlsEnabled = true ORDER BY DeveloperName`,
      toolingMode: true
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const queryResult: QueryResult<{}> = apiResult.data

    yield put({
      payload: { sobjects: queryResult.records },
      type: PermissionActionTypes.SET
    })

    if(!queryResult.done) {
      yield getMoreSObjects(queryResult)
    }
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

function* getMoreSObjects(result) {
  try {
    const { nextRecordsUrl } = result
    const connection = getConnectionFromZustand()
    const sobjects: any = yield select((state: ApplicationState) => state.permissionState.sobjects)
    const apiResult = yield ipcRenderer.invoke('salesforce:queryMore', {
      ...connection,
      nextRecordsUrl,
      toolingMode: true
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const queryMoreResult = apiResult.data

    yield put({
      payload: { sobjects: [...sobjects, queryMoreResult.records] },
      type: PermissionActionTypes.SET
    })

    if(!queryMoreResult.done) {
      yield getMoreSObjects(queryMoreResult)
    }
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* setSObject(objectName: string) {
  try {
    yield getFieldPermissions()
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* handleSObjectChange(action: any) {
  try {
    const sobjectName = action.payload
    yield all([
      getFields(sobjectName),
      put({
        payload: { sobjectName },
        type: PermissionActionTypes.SET
      }),
    ])
    //Field Permissions depends on object name being set
    yield getFieldPermissions()
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

export function* getFields(sobjectName: string) {
  try {
    const connection = getConnectionFromZustand()
    const apiResult = yield ipcRenderer.invoke('salesforce:query', {
      ...connection,
      queryString: `SELECT Id, Name, IsUpdatable, RelationshipName, DataType, ValueTypeId, IsCompound, IsCreatable, IsCalculated, IsPermissionable, Label, IsComponent, NamespacePrefix FROM EntityParticle WHERE EntityDefinitionId = '${sobjectName}'`,
      toolingMode: true
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const queryResult: QueryResult<{}> = apiResult.data

    yield put({
      payload: { fields: queryResult.records },
      type: PermissionActionTypes.SET
    })

    if(!queryResult.done) {
      yield getMoreFields(queryResult)
    }
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}

function* getMoreFields(result) {
  try {
    const { nextRecordsUrl } = result
    const connection = getConnectionFromZustand()
    const fields: any = yield select((state: ApplicationState) => state.permissionState.fields)
    const apiResult = yield ipcRenderer.invoke('salesforce:queryMore', {
      ...connection,
      nextRecordsUrl,
      toolingMode: true
    })
    if (!apiResult.success) {
      throw new Error(apiResult.error)
    }
    const queryMoreResult = apiResult.data

    yield put({
      payload: { fields: [...fields, queryMoreResult.records] },
      type: PermissionActionTypes.SET
    })

    if(!queryMoreResult.done) {
      yield getMoreFields(queryMoreResult)
    }
  } catch (error) {
    console.error(error)
    yield put({
      payload: error.message,
      type: PermissionActionTypes.ERROR
    })
  }
}