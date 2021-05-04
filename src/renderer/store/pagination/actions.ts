import { PaginationActionTypes } from './types'

export default function onPaginationChange(pageSize: number) {
  return {
    payload: pageSize,
    type: PaginationActionTypes.SET_PAGINATION
  }
}
