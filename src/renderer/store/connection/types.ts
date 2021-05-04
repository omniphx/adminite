import { Connection, UserInfo } from 'jsforce';

export enum ConnectionActionTypes {
  SET = '@@connection/SET',
  ON_CHANGE = '@@connection/ON_CHANGE',
  ERROR = '@@connection/ERROR',
}

export interface ConnectionState {
  readonly connection?: Connection
  readonly connectionId?: string
  readonly userInfo?: UserInfo
  readonly pending: boolean
  readonly error?: any
}