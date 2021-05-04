export enum FeatureActionTypes {
  ON_CHANGE = '@@feature/ON_CHANGE',
  SET = '@@feature/SET',
  ERROR = '@@feature/ERROR'
}

export interface FeatureState {
  readonly feature?: string
  readonly errors?: any
}
  