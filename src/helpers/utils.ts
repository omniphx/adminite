import { v4, v5 } from 'uuid'
import * as moment from 'moment';

export function isSalesforceId(id: string) {
  const regex = /^[0-9a-zA-Z]{5}0{3}[0-9a-zA-Z]{7}([0-9A-Z]{3})?$/
  return regex.test(id)
}

export function isDatetime(dateTime: string) {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}\+\d{4}$/
  return regex.test(dateTime)
}

export function isDate(date: string) {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  return regex.test(date)
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color
}

export function getRecordId(record: any) {
  if (record.attributes.type === 'AggregateResult') {
    return
  }
  return record.attributes.url.substring(record.attributes.url.lastIndexOf('/') + 1, record.attributes.url.length);
}

export function moveItemById(array, fromId, toId) {
  moveItem(array, array.indexOf(toId), array.indexOf(fromId))
}

export function moveItem(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0])
}

export function hash(): string {
  return v4()
}

// Memoized results for optimizing performance
const recordMatchResults = new Map<String, boolean>()
const keyMatchResults = new Map<String, boolean>()

export function hasMatch(record: any, filter: string) {
  if (!filter) return true
  if (filter.length === 0) return true
  const compositeKey = v5(JSON.stringify(record) + filter, 'a2ad0020-d0de-4f2b-9051-5ddcd0ba32d7')
  if(recordMatchResults.has(compositeKey)) return recordMatchResults.get(compositeKey)
  let normalizedFilter = filter.toLowerCase()

  for (var key in record) {
    if (key === 'key') continue
    if (key === 'attributes') continue
    let value = record[key]
    if (!value) continue
    
    if(isMatch(normalizedFilter, key, value)) {
      recordMatchResults.set(compositeKey, true)
      return true
    }
  }

  recordMatchResults.set(compositeKey, false)
  return false
}

function isMatch(filter, key, value): boolean {
  const keyMatchCompositeKey = v5(filter + key + JSON.stringify(value), 'eec8b9c4-4ab2-4729-aeb6-e09e67b5d735')
  if(keyMatchResults.has(keyMatchCompositeKey)) return keyMatchResults.get(keyMatchCompositeKey)

  if (typeof value === 'string') {
    return normalizeValue(value).includes(filter)
  } else if (typeof value === 'object') {
    if (value.records) {
      value.records.forEach(record => {
        const match = hasMatch(record, filter)
        keyMatchResults.set(keyMatchCompositeKey, match)
        return match
      })
    } else {
      const match = hasMatch(value, filter)
      keyMatchResults.set(keyMatchCompositeKey, match)
      return match
    }
  }

  keyMatchResults.set(keyMatchCompositeKey, false)
  return false
}

function normalizeValue(value) {
  if(isDate(value)) {
    return moment(value).format('MM/DD/YYYY')
  } else if(isDatetime(value)) {
    return moment(value).format('MM/DD/YYYY h:mma')
  } else {
    return value.toLowerCase()
  }
}

export function dataReducer(data: any) {
  return Object.values(data)
    .reduce((accumulator, record: any, index: number) => {
      const key = record.attributes.type === 'AggregateResult' ? index : getRecordId(record)
      record['editFields'] = []
      record['errorMessage'] = ''
      record['key'] = key
      accumulator[key] = record
      return accumulator
    }, {})
}

export function filterReducer(data: any, filterString: string) {
  return Object.values(data)
    .filter(record => hasMatch(record, filterString))
    .reduce((accumulator, record: any) => {
      accumulator[record.Id] = record
      return accumulator
    }, {})
}

export function filterIds(data: any, filterString: string) {
  return Object.keys(data).filter(key => hasMatch(data[key], filterString))
}

export function chunk(arr, size): any[] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  )
}

export function sort(a: any, b: any, field: string) {
  const valueA = a[field].toUpperCase()
  const valueB = b[field].toUpperCase()
  if (valueA < valueB) {
    return -1;
  } else if (valueA > valueB) {
    return 1;
  } else {
    return 0;
  }
}