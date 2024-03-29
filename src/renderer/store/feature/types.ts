export enum FeatureActionTypes {
  ON_CHANGE = '@@feature/ON_CHANGE',
  SET = '@@feature/SET',
  ERROR = '@@feature/ERROR'
}

export interface FeatureState {
  readonly feature?: 'soql' | 'permissions' | 'schema'
  readonly errors?: any
}
