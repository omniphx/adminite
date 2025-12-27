import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PermissionType = 'profile' | 'permissionSet'

interface PermissionUIState {
  // Selection state
  permissionType: PermissionType
  permissionIds: string[]
  sobjectName: string
  filter: string

  // Actions
  setPermissionType: (permissionType: PermissionType) => void
  setPermissionIds: (permissionIds: string[]) => void
  setSObjectName: (sobjectName: string) => void
  setFilter: (filter: string) => void
  reset: () => void
}

const initialState = {
  permissionType: 'profile' as PermissionType,
  permissionIds: [],
  sobjectName: '',
  filter: '',
}

export const usePermissionUIStore = create<PermissionUIState>()(
  persist(
    (set) => ({
      ...initialState,

      setPermissionType: (permissionType) =>
        set({
          permissionType,
          // Clear permission IDs when type changes
          permissionIds: [],
        }),

      setPermissionIds: (permissionIds) => set({ permissionIds }),

      setSObjectName: (sobjectName) => set({ sobjectName }),

      setFilter: (filter) => set({ filter }),

      reset: () => set(initialState),
    }),
    {
      name: 'permission-ui-storage',
      partialize: (state) => ({
        // Only persist type and sobject selection, not filter or specific IDs
        permissionType: state.permissionType,
        sobjectName: state.sobjectName,
      }),
    }
  )
)
