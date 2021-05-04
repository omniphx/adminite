export enum QueryHistoryActionTypes {
  SET = '@@queryHistory/SET',
  ERROR = '@@queryHistory/ERROR',
}

export interface QueryHistoryState {
  readonly queries: string[]
}