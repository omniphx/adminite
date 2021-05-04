import { call, put, all, takeLatest, fork, select } from 'redux-saga/effects'
import { ConnectionActionTypes } from './types'
import { describe } from '../schema/sagas'
import { Connection } from 'jsforce'
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
    const connection: any = connect(connections[connectionId])
    const identity = yield connection.identity()
    const userInfo = yield connection.soap.getUserInfo()

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

function connect(connectionInfo: any) {
  //Might even be able to pass this straight through
  const {
    accessToken,
    instanceUrl,
    refreshToken,
    loginUrl,
    redirectUri
  } = connectionInfo

  return new Connection({
    // logLevel: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
    accessToken,
    instanceUrl,
    refreshToken,
    oauth2: {
      clientId: process.env.ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_ID,
      clientSecret: process.env.ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_SECRET,
      loginUrl,
      redirectUri
    }
  })
}
