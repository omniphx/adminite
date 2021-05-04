import { ConnectionsActionTypes } from './types'

export function initializeConnection() {
  return {
    type: ConnectionsActionTypes.INIT
  }
}

export function onConnectionCreate(connection: any) {
  return {
    type: ConnectionsActionTypes.CREATE,
    payload: connection
  }
}

export function onConnectionChange(connection: any) {
  return {
    type: ConnectionsActionTypes.ON_CHANGE,
    payload: connection
  }
}

export function moveConnection(from: number, to: number) {
  return {
    type: ConnectionsActionTypes.ON_MOVE,
    payload: {from, to}
  }
}

export function onConnectionDelete(connectionId: string) {
  return {
    type: ConnectionsActionTypes.ON_DELETE,
    payload: connectionId
  }
}

export function toggleModal() {
  return {
    type: ConnectionsActionTypes.TOGGLE_MODAL
  }
}