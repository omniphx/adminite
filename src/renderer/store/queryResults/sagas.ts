import { put, select, takeLatest, all, fork, take, cancel } from 'redux-saga/effects'
import { QueryResultActionTypes } from './types'
import { getConnection, getFilter, getData, getToolingMode, getResultSObject, getSelectedIds, getFilteredIds, getBatchSize, getActiveTabId, getQueryString, getIncludeDeleted } from '../index'
import { Connection } from 'jsforce'
import { dataReducer, filterIds, getRecordId, chunk } from '../../../helpers/utils'
import { notification } from 'antd'

export function* queryResultSagas() {
  yield all([
    fork(queryFlow),
    fork(fieldChangeFlow),
    fork(dmlUpdateFlow),
    fork(dmlDeleteFlow)
  ])
}

function* queryFlow() {
  try {
    while (true) {
      const action = yield take(QueryResultActionTypes.ON_QUERY)
      const task = yield fork(query, action)
      const { type } = yield take([QueryResultActionTypes.ON_CANCEL, QueryResultActionTypes.DONE])
      if (type === QueryResultActionTypes.ON_CANCEL) {
        yield cancel(task)
      }
    }
  } catch(error) {
    console.error(error)
    const action = yield take(QueryResultActionTypes.ON_QUERY)
    const { tabId } = action.payload
    yield put({
      payload: { tabId },
      type: QueryResultActionTypes.DONE
    })
  }
}

function* fieldChangeFlow() {
  yield takeLatest(QueryResultActionTypes.ON_FIELD_CHANGE, updateField)
}

function* dmlUpdateFlow() {
  yield takeLatest(QueryResultActionTypes.ON_UPDATE, dmlUpdate)
}

function* dmlDeleteFlow() {
  yield takeLatest(QueryResultActionTypes.ON_DELETE, dmlDelete)
}

export function* updateField(action: any) {
  const { tabId, record } = action.payload
  yield put({
    payload: { tabId, record },
    type: QueryResultActionTypes.SET_FIELD
  })
  const data: any = yield select(getData, tabId)
  const filter: string = yield select(getFilter, tabId)
  const filteredIds = filterIds(data, filter)

  yield put({
    payload: { tabId, filteredIds },
    type: QueryResultActionTypes.SET
  })
}

export function* query(action: any) {
  try {
    const { tabId, queryString, includeDeleted } = action.payload
    const salesforce: any = yield select(getConnection)
    const filter: string = yield select(getFilter, tabId)
    const toolingMode: boolean = yield select(getToolingMode, tabId)
    yield put({
      payload: { tabId },
      type: QueryResultActionTypes.PENDING
    })
    const queryHandler = getHandler(includeDeleted, queryString)
    const result = yield toolingMode ? salesforce.tooling.query(queryString) : salesforce[queryHandler](queryString)

    const records = queryHandler === 'search' ? result.searchRecords : result.records
    const data = dataReducer(records)
    const filteredIds = filterIds(data, filter)

    yield put({
      payload: { ...result, tabId, data, filteredIds, selectedIds: [] },
      type: QueryResultActionTypes.SUCCESS
    })
    if (result.hasOwnProperty('done') && !result.done) {
      yield queryMore(tabId, result)
    }
  } catch (error) {
    console.error(error)
    const { tabId } = action.payload
    yield put({
      payload: { tabId, error: error.message },
      type: QueryResultActionTypes.ERROR
    })
  } finally {
    const { tabId } = action.payload
    yield put({
      payload: { tabId },
      type: QueryResultActionTypes.DONE
    })
  }
}

function* queryMore(tabId, result) {
  try {
    const { nextRecordsUrl } = result
    const salesforce: Connection = yield select(getConnection)
    const toolingMode: boolean = yield select(getToolingMode, tabId)
    const filter: string = yield select(getFilter, tabId)
    const queryMoreResult = yield toolingMode ? salesforce.tooling.queryMore(nextRecordsUrl) : salesforce.queryMore(nextRecordsUrl)
    const data = dataReducer(queryMoreResult.records)
    const filteredIds = filterIds(data, filter)

    yield put({
      payload: { ...queryMoreResult, tabId, data, filteredIds },
      type: QueryResultActionTypes.SUCCESS_MORE
    })

    if (!queryMoreResult.done) {
      yield queryMore(tabId, queryMoreResult)
    }
  } catch (error) {
    console.error(error)
    yield put({
      payload: { tabId, error: error.message },
      type: QueryResultActionTypes.ERROR
    })
  }
}

function* dmlUpdate(action: any) {
  const { tabId } = action.payload
  try {
    yield put({
      payload: { tabId, dmlPending: true },
      type: QueryResultActionTypes.SET
    })

    const salesforce: Connection = yield select(getConnection)
    const data: any = yield select(getData, tabId)
    const toolingMode: boolean = yield select(getToolingMode, tabId)
    const batchSize: number = yield select(getBatchSize, tabId)

    const recordsWithUpdates: { [key: string]: any } = Object.values({ ...data })
      .filter((record: any) => record.editFields.length > 0)
      .reduce((accumulator: object, record: any) => {
        const recordId = getRecordId(record)
        return {
          ...accumulator,
          [recordId]: record
        }
      }, {})

    const recordsToSaveWrapper: { [key: string]: any[] } = Object.values(recordsWithUpdates).reduce((accumulator, record: any) => {
      const Id = getRecordId(record)
      const sObjectType = record.attributes.type
      const recordToSave = { Id }
      record.editFields.forEach(field => {
        recordToSave[field] = record[field]
      })

      return {
        ...accumulator,
        [sObjectType]: accumulator[sObjectType] ? [...accumulator[sObjectType], recordToSave] : [recordToSave]
      }
    }, {})

    yield all(
      Object.keys(recordsToSaveWrapper).map(async (sObjectType) => {
        const recordsChunked = chunk(recordsToSaveWrapper[sObjectType], batchSize)
        await Promise.all(
          recordsChunked.map(async (recordsToSave) => {
            const results: any = toolingMode
              ? await salesforce.tooling.update(sObjectType, recordsToSave)
              : await salesforce.update(sObjectType, recordsToSave)

            for (let i = 0; i < results.length; i++) {
              const recordId = recordsToSave[i].Id
              const record = recordsWithUpdates[recordId]
              const result = results[i]
              if (result.success) {
                record['editFields'] = []
                record['errorMessage'] = ''
              } else {
                record['errorMessage'] = result.errors.reduce((errorString, error) => errorString + '\r\n' + error.message, '')
              }
            }
          }))
        })
      )

    yield put({
      payload: { tabId, data: { ...data } },
      type: QueryResultActionTypes.SET_DATA
    })
  } catch (error) {
    console.error(error)
    yield put({
      payload: { tabId, error: error.message },
      type: QueryResultActionTypes.ERROR
    })
  } finally {
    yield put({
      payload: { tabId, dmlPending: false },
      type: QueryResultActionTypes.SET
    })
  }
}

function* dmlDelete(action: any) {
  const { tabId } = action.payload
  try {
    const salesforce: Connection = yield select(getConnection)
    const data: any = yield select(getData, tabId)
    const sobject: any = yield select(getResultSObject, tabId)
    const toolingMode: boolean = yield select(getToolingMode, tabId)
    const selectedIds: any[] = yield select(getSelectedIds, tabId)
    const filteredIds: any[] = yield select(getFilteredIds, tabId)
    const batchSize: number = yield select(getBatchSize, tabId)

    const idsToDeleteChunked = chunk(selectedIds, batchSize)
    const successfulIds = []
    const errors = []

    yield Promise.all(
      idsToDeleteChunked.map(async (idsToDelete) => {
        const result: any = toolingMode
          ? await salesforce.tooling.delete(sobject.name, idsToDelete)
          : await salesforce.delete(sobject.name, idsToDelete)

        result.filter(result => result.success).forEach(result => {
          delete data[result.id]
          successfulIds.push(result.id)
        })
        result.forEach((result, index) => {
          if (result.success) return
          result.errors.forEach(error => {
            errors.push(`${idsToDelete[index]}: ${error.message}`)
          })
        })
      })
    )

    const nonDeletedIds = filteredIds.filter(id => !successfulIds.includes(id))

    if (errors.length > 0) {
      notification.error({
        message: 'Errors',
        style: { zIndex: 10000 },
        description: errors.join(' '),
        duration: 0,
      })
    }

    yield put({
      payload: {
        tabId,
        filteredIds: nonDeletedIds,
        selectedIds: [],
        data: { ...data }
      },
      type: QueryResultActionTypes.SET
    })
  } catch (error) {
    console.error(error)
    yield put({
      payload: { tabId, error: error.message },
      type: QueryResultActionTypes.ERROR
    })
  } finally {
    yield put({
      payload: { tabId, dmlPending: false },
      type: QueryResultActionTypes.SET
    })
  }
}

function getHandler(includeDeleted: boolean, queryString: string): string {
  if (queryString.toUpperCase().startsWith('FIND')) return 'search'
  if (includeDeleted) return 'queryAll'

  return 'query'
}