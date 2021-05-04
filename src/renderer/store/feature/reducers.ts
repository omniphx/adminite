import { Reducer } from 'redux'
import { FeatureState, FeatureActionTypes } from './types'

const initialState: FeatureState = {
  feature: 'soql'
}

const featureReducer: Reducer<FeatureState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case FeatureActionTypes.SET:
      return { ...state, feature: action.payload }
    default:
      return state
  }
}

export default featureReducer
