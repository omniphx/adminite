import { UserActionTypes } from './types';

export function setUsername(username:string) {
  return {
    payload: {username},
    type: UserActionTypes.SET
  }
}

export function initialUser() {
  return {
    type: UserActionTypes.ON_INIT
  }
}

export function onUserChange(user: any) {
  return {
    payload: user,
    type: UserActionTypes.ON_CHANGE
  }
}

export function setAuthentication(authenticated:boolean) {
  return {
    payload: {authenticated},
    type: UserActionTypes.SET
  }
}
