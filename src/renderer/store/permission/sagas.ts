import { put, select, takeLatest, all, fork } from 'redux-saga/effects'
import { Connection, QueryResult } from 'jsforce'
import { getProfiles, getPermissionSets } from '../../utils/queryBuilder'
import { PermissionActionTypes } from './types'
import { getConnection, getPermissionState, getSchemaState, ApplicationState } from '../index';
import { getFieldPermissions } from '../fieldPermission/sagas'

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
    const salesforce: Connection = yield select(getConnection)
    if(!salesforce) return

    const { permissionIds, permissionType } = yield select(getPermissionState)
    const { namespace } = yield select(getSchemaState)
    const queryString: string =
      permissionType === 'profile'
        ? getProfiles(permissionIds)
        : getPermissionSets(namespace, permissionIds)

    const result: QueryResult<{}> = yield salesforce.query(queryString)

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
    const salesforce: Connection = yield select(getConnection)
    const queryResult: QueryResult<{}> = yield salesforce.tooling.query(`SELECT Id, DeveloperName, Label, QualifiedApiName FROM EntityDefinition WHERE IsFlsEnabled = true ORDER BY DeveloperName`)

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
    const salesforce: Connection = yield select(getConnection)
    const sobjects: any = yield select((state: ApplicationState) => state.permissionState.sobjects)
    const queryMoreResult = yield salesforce.tooling.queryMore(nextRecordsUrl)

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
    const salesforce: Connection = yield select(getConnection)
    const queryResult: QueryResult<{}> = yield salesforce.tooling.query(`SELECT Id, Name, IsUpdatable, RelationshipName, DataType, ValueTypeId, IsCompound, IsCreatable, IsCalculated, IsPermissionable, Label, IsComponent, NamespacePrefix FROM EntityParticle WHERE EntityDefinitionId = '${sobjectName}'`)

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
    const salesforce: Connection = yield select(getConnection)
    const fields: any = yield select((state: ApplicationState) => state.permissionState.fields)
    const queryMoreResult = yield salesforce.tooling.queryMore(nextRecordsUrl)

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