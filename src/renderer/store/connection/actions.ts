import { ConnectionActionTypes } from './types';

export function onConnectionSelected(connectionId: string) {
  return {
    payload: connectionId,
    type: ConnectionActionTypes.ON_CHANGE
  }
}