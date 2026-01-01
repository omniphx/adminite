import { create } from 'zustand';

export type Feature = 'soql' | 'permissions' | 'schema' | 'debug';

interface FeatureState {
  feature: Feature;
  error?: string;
}

interface FeatureActions {
  setFeature: (feature: Feature) => void;
  setError: (error: string | undefined) => void;
}

export const useFeatureStore = create<FeatureState & FeatureActions>()((set) => ({
  feature: 'soql',
  error: undefined,

  setFeature: (feature) => set({ feature, error: undefined }),

  setError: (error) => set({ error }),
}));
