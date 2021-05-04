import { call, put, all, takeLatest, fork, select } from 'redux-saga/effects'
import { ConnectionsActionTypes } from './types'
import { describe } from '../schema/sagas'
import { setConnection } from '../connection/sagas'
import { getConnections as getStoredConnections } from '../index'
import { moveItem } from '../../../helpers/utils'
import { ConnectionActionTypes } from '../connection/types'
import {
  getConnections,
  createConnection,
  updateConnection,
  deleteConnection
} from '../../../helpers/local-store'

export function* connectionsSagas() {
  yield all([
    fork(watchInit),
    fork(watchConnectionChange),
    fork(watchCreateConnection),
    fork(watchMoveConnection),
    fork(watchDeleteConnection)
  ])
}

function* watchInit() {
  yield takeLatest(ConnectionsActionTypes.INIT, initializeConnection)
}

function* watchCreateConnection() {
  yield takeLatest(ConnectionsActionTypes.CREATE, handleConnectionCreation)
}

function* watchConnectionChange() {
  yield takeLatest(ConnectionsActionTypes.ON_CHANGE, handleConnectionUpdate)
}

function* watchMoveConnection() {
  yield takeLatest(ConnectionsActionTypes.ON_MOVE, moveConnection)
}

function* watchDeleteConnection() {
  yield takeLatest(ConnectionsActionTypes.ON_DELETE, handleDeleteConnection)
}

function* initializeConnection() {
  try {
    const connections: any[] = yield getConnections()

    yield put({
      payload: connections,
      type: ConnectionsActionTypes.SET
    })

    if (connections.length > 0) {
      yield put({
        payload: connections[0].id,
        type: ConnectionActionTypes.ON_CHANGE
      })
    }
  } catch (error) {
    console.error(error)
    yield put({ type: ConnectionsActionTypes.ERROR, payload: error.message })
  }
}

function* handleConnectionCreation(action: any) {
  try {
    const connections: any[] = yield select(getStoredConnections)
    const result: any = yield createConnection(
      action.payload,
      connections.length
    )
    const connection = result

    yield all([
      put({
        payload: connection,
        type: ConnectionsActionTypes.SET
      }),
      put({
        payload: { connectionId: connection.id },
        type: ConnectionActionTypes.SET
      }),
      call(setConnection, { payload: connection.id }),
      call(describe)
    ])
  } catch (error) {
    console.error(error)
    yield put({ type: ConnectionsActionTypes.ERROR, payload: error.message })
  }
}

function* handleConnectionUpdate(action: any) {
  try {
    const { id, name }: any = action.payload
    const connections = yield select(getStoredConnections)
    const connection = connections[id]
    connection.name = name

    yield all([
      put({
        payload: connection,
        type: ConnectionsActionTypes.SET
      }),
      updateConnection({ id, name })
    ])
  } catch (error) {
    console.error(error)
    yield put({ type: ConnectionsActionTypes.ERROR, payload: error.message })
  }
}

function* moveConnection(action: any) {
  try {
    const connections: any = yield select(getStoredConnections)
    const connectionsArray: any[] = Object.values(connections)
    const { from, to } = action.payload
    moveItem(connectionsArray, from, to)
    yield all([
      put({
        payload: connectionsArray,
        type: ConnectionsActionTypes.SET
      }),
      connectionsArray.forEach((connection: any, sortOrder) => {
        const { id } = connection
        updateConnection({ id, sortOrder })
      })
    ])
  } catch (error) {
    console.error(error)
    yield put({ type: ConnectionsActionTypes.ERROR, payload: error.message })
  }
}

function* handleDeleteConnection(action: any) {
  try {
    const connectionId = action.payload
    yield deleteConnection(connectionId)

    const connections: any = yield select(getStoredConnections)
    delete connections[connectionId]

    const connectionIds = Object.keys(connections)

    yield put({
      payload: Object.values(connections),
      type: ConnectionsActionTypes.SET
    })

    if (connectionIds.length > 0) {
      yield put({
        payload: connectionIds[0],
        type: ConnectionActionTypes.ON_CHANGE
      })
    } else {
      yield put({
        payload: null,
        type: ConnectionActionTypes.ON_CHANGE
      })
    }
  } catch (error) {
    console.error(error)
    yield put({ type: ConnectionsActionTypes.ERROR, payload: error.message })
  }
}
