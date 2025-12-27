import { call, put, all, takeLatest, fork, select } from 'redux-saga/effects'
import { ConnectionActionTypes } from './types'
import { describe } from '../schema/sagas'
import { ipcRenderer } from 'electron'
// import { getPermissions } from '../permission/sagas'
import { getConnections } from '../index'
import { updateConnection } from '../../../helpers/local-store'

export function* connectionSagas() {
  yield all([fork(watchConnectionChange)])
}

function* watchConnectionChange() {
  yield takeLatest(ConnectionActionTypes.ON_CHANGE, setConnection)
}

export function* setConnection(action: any) {
  try {
    const connectionId = action.payload
    yield put({
      payload: { pending: true, connectionId },
      type: ConnectionActionTypes.SET
    })

    const connections: any = yield select(getConnections)
    const connectionInfo = connections[connectionId]

    // Call Salesforce APIs via IPC to avoid CORS issues
    const identityResult = yield ipcRenderer.invoke('salesforce:identity', connectionInfo)
    if (!identityResult.success) {
      throw new Error(identityResult.error)
    }
    const identity = identityResult.data

    const userInfoResult = yield ipcRenderer.invoke('salesforce:getUserInfo', connectionInfo)
    if (!userInfoResult.success) {
      throw new Error(userInfoResult.error)
    }
    const userInfo = userInfoResult.data

    const {
      username,
      first_name,
      last_name,
      email,
      display_name,
      timezone,
      user_id,
      user_type,
      organization_id,
      locale,
      language
    } = identity

    // Store connection info for later use (will be used by other sagas via IPC)
    const connection = connectionInfo

    yield all([
      put({
        payload: { connection, pending: false, userInfo },
        type: ConnectionActionTypes.SET
      }),
      call(describe),
      updateConnection({
        id: connectionId,
        username,
        first_name,
        last_name,
        email,
        display_name,
        timezone,
        user_id,
        user_type,
        organization_id,
        locale,
        language
      })
    ])
  } catch (error) {
    console.error(error)
    yield put({
      type: ConnectionActionTypes.ERROR,
      payload: { error: error.message, pending: false }
    })
  }
}

// No longer needed - we use IPC instead of creating connections in renderer
// function connect(connectionInfo: any) { ... }
