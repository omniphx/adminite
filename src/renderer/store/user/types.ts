export enum UserActionTypes {
  ON_INIT = '@@user/ON_INIT',
  ON_CHANGE = '@@user/ON_CHANGE',
  SET = '@@user/SET',
  ERROR = '@@user/ERROR',
}

export interface UserState {
  readonly id?: string
  readonly username?: string
  readonly authenticated: boolean
  readonly disableAutoComplete?: boolean
  readonly disableInlineTabs?: boolean
  readonly tabDisplayType?: string
  readonly license?: string
  readonly queryHotkey?: string
}