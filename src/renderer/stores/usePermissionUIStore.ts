import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type PermissionType = 'profile' | 'permissionSet';

// Field permission change record
export interface FieldPermissionChange {
  Id?: string;
  Field: string;
  ParentId: string;
  PermissionsEdit: boolean;
  PermissionsRead: boolean;
  SobjectType: string;
}

interface PermissionUIState {
  // Selection state
  permissionType: PermissionType;
  permissionIds: string[];
  sobjectName: string;
  filter: string;

  // Field permission changes (unsaved edits) - Phase 8
  fieldPermissionsToSave: Record<string, FieldPermissionChange>;
  saveErrors: string | null;

  // Actions
  setPermissionType: (permissionType: PermissionType) => void;
  setPermissionIds: (permissionIds: string[]) => void;
  setSObjectName: (sobjectName: string) => void;
  setFilter: (filter: string) => void;
  reset: () => void;

  // Field permission actions - Phase 8
  updateFieldPermission: (key: string, permission: FieldPermissionChange) => void;
  clearFieldPermissionsToSave: () => void;
  setSaveErrors: (errors: string | null) => void;
}

const initialState = {
  permissionType: 'profile' as PermissionType,
  permissionIds: [] as string[],
  sobjectName: '',
  filter: '',
  fieldPermissionsToSave: {} as Record<string, FieldPermissionChange>,
  saveErrors: null as string | null,
};

export const usePermissionUIStore = create<PermissionUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setPermissionType: (permissionType) =>
          set({
            permissionType,
            // Clear permission IDs and unsaved changes when type changes
            permissionIds: [],
            fieldPermissionsToSave: {},
            saveErrors: null,
          }),

        setPermissionIds: (permissionIds) => set({ permissionIds }),

        setSObjectName: (sobjectName) =>
          set({
            sobjectName,
            // Clear unsaved changes when sobject changes
            fieldPermissionsToSave: {},
            saveErrors: null,
          }),

        setFilter: (filter) => set({ filter }),

        reset: () => set(initialState),

        // Field permission actions - Phase 8
        updateFieldPermission: (key, permission) =>
          set((state) => ({
            fieldPermissionsToSave: {
              ...state.fieldPermissionsToSave,
              [key]: permission,
            },
          })),

        clearFieldPermissionsToSave: () =>
          set({
            fieldPermissionsToSave: {},
            saveErrors: null,
          }),

        setSaveErrors: (errors) => set({ saveErrors: errors }),
      }),
      {
        name: 'permission-ui-storage',
        partialize: (state) => ({
          // Only persist type and sobject selection, not filter or specific IDs
          permissionType: state.permissionType,
          sobjectName: state.sobjectName,
        }),
      }
    ),
    { name: 'Adminite', store: 'PermissionUIStore' }
  )
);
