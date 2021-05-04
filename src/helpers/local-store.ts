import { v4 as uuidv4 } from 'uuid'

function createItem(key: string, item: any) {
  const queryId = uuidv4()
  item.id = queryId
  const queryStateString = localStorage.getItem(key)
  const queryState =
    queryStateString === null ? {} : JSON.parse(queryStateString)
  queryState[queryId] = item
  const serializedQueries = JSON.stringify(queryState)
  localStorage.setItem(key, serializedQueries)

  return item
}

function getItems(key: string) {
  const queryStateString = localStorage.getItem(key)
  const queryState =
    queryStateString === null ? {} : JSON.parse(queryStateString)
  return Object.values(queryState)
}

function updateItem(key: string, item: any) {
  const queryStateString = localStorage.getItem(key)
  const queryState =
    queryStateString === null ? {} : JSON.parse(queryStateString)
  const existingItem = item.id in queryState ? queryState[item.id] : {}
  queryState[item.id] = { ...existingItem, ...item }
  const serializedQueries = JSON.stringify(queryState)
  localStorage.setItem(key, serializedQueries)

  return item
}

function deleteItem(key: string, itemId: string) {
  const queryStateString = localStorage.getItem(key)
  const queryState =
    queryStateString === null ? {} : JSON.parse(queryStateString)
  delete queryState[itemId]
  const serializedQueries = JSON.stringify(queryState)
  localStorage.setItem(key, serializedQueries)

  return itemId
}

export async function getConnections() {
  return getItems('connections')
}

export async function getSoqlQueries() {
  return getItems('queries')
}

export async function createConnection(connection: any, sortOrder: number) {
  return createItem('connections', { ...connection, sortOrder })
}

export async function createSoqlQuery(soqlQuery: any) {
  return createItem('queries', soqlQuery)
}

export async function updateConnection(connection: any) {
  return updateItem('connections', connection)
}

export async function updateSoqlQuery(soqlQuery: any) {
  return updateItem('queries', soqlQuery)
}

export async function deleteConnection(id: string) {
  deleteItem('connections', id)
}

export async function deleteSoqlQuery(id: string) {
  deleteItem('queries', id)
}
