import { QueryHistoryActionTypes } from "./types";

export function add(query: string) {
  return {
    payload: query,
    type: QueryHistoryActionTypes.SET
  }
}