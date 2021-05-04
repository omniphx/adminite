import { FeatureActionTypes } from './types'

export function onFeatureChange(feature: string) {
  return {
    payload: feature,
    type: FeatureActionTypes.SET
  }
}