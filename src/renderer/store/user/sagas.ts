import { call, put, all, takeLatest, fork, select } from 'redux-saga/effects'
import { UserActionTypes } from './types'

export function* userSagas() {
  yield all([fork(watchChange)])
}

function* watchChange() {
  yield takeLatest(UserActionTypes.ON_CHANGE, onUserChange)
}

export function* onUserChange(action: any) {
  try {
    const user = action.payload
    yield all([
      put({
        payload: user,
        type: UserActionTypes.SET
      })
    ])
  } catch (error) {
    console.error(error)
    yield put({ type: UserActionTypes.ERROR, payload: error.message })
  }
}
