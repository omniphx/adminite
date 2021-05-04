import { put, takeLatest, all, fork, select } from 'redux-saga/effects'
import { QueriesActionTypes } from './types'
import { getData } from '../index'
import { QueryResultActionTypes } from '../queryResults/types'
import { filterIds } from '../../../helpers/utils'

//Type is used to handle multiple saga instances
export function* queriesSagas() {
  yield all([
    fork(watchFilterChanges)
  ])
}

function* watchFilterChanges() {
  yield takeLatest(QueriesActionTypes.ON_FILTER, filterData)
}

export function* filterData(action: any) {
  const { tabId, filter } = action.payload
  try {
    yield all([
      put({
        payload: { tabId, searchFilter: filter },
        type: QueriesActionTypes.SET
      }),
      put({
        payload: { tabId, filteredIds: filterIds(yield select(getData, tabId), filter) },
        type: QueryResultActionTypes.SET
      })
    ])
  } catch (error) {
    yield put({
      payload: { tabId, error: error.message },
      type: QueriesActionTypes.ERROR
    })
  }
}
