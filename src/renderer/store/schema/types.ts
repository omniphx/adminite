import { DescribeGlobalSObjectResult, DescribeSObjectResult } from 'jsforce'

export enum SchemaActionTypes {
  SET = '@@schema/SET',
  ERROR = '@@schema/ERROR'
}

export interface SchemaState {
  readonly sobjects: DescribeGlobalSObjectResult[]
  readonly toolingObjects: DescribeGlobalSObjectResult[]
  readonly namespace?: string
  readonly errors?: string
}
