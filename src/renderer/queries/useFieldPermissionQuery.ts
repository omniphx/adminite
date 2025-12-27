import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { QueryResult } from 'jsforce'
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore'
import { usePermissionUIStore, PermissionType } from '../stores/usePermissionUIStore'
import { queryKeys } from './queryKeys'
import { getProfileFieldPermissions, getPermisionSetFieldPermissions } from '../utils/queryBuilder'
import { ConnectionInfo, buildConnectionInfo } from './useConnectionQuery'

// Types for field permission data
export interface FieldPermission {
  Id?: string
  Field: string
  ParentId: string
  PermissionsEdit: boolean
  PermissionsRead: boolean
  SobjectType: string
  Parent?: {
    ProfileId: string
    Profile?: {
      Name: string
    }
  }
}

export interface FieldPermissionRecord {
  [id: string]: FieldPermission
}

// Fetch field permissions via IPC
async function fetchFieldPermissions(
  connectionInfo: ConnectionInfo,
  sobjectName: string,
  permissionIds: string[],
  permissionType: PermissionType
): Promise<FieldPermissionRecord> {
  if (!sobjectName || !permissionIds || permissionIds.length === 0) {
    return {}
  }

  const queryString =
    permissionType === 'profile'
      ? getProfileFieldPermissions(sobjectName, permissionIds)
      : getPermisionSetFieldPermissions(sobjectName, permissionIds)

  const result = await ipcRenderer.invoke('salesforce:query', {
    ...connectionInfo,
    queryString,
    toolingMode: false,
  })

  if (!result.success) {
    throw new Error(result.error)
  }

  const queryResult: QueryResult<FieldPermission> = result.data

  // Convert array to record keyed by Id
  const records: FieldPermissionRecord = {}
  queryResult.records.forEach((record) => {
    if (record.Id) {
      records[record.Id] = record
    }
  })

  return records
}

// Save field permissions (insert new, update existing)
interface SaveFieldPermissionsParams {
  connectionInfo: ConnectionInfo
  permissionsToSave: FieldPermission[]
}

interface SaveResult {
  id?: string
  success: boolean
  errors?: any[]
}

async function saveFieldPermissions({
  connectionInfo,
  permissionsToSave,
}: SaveFieldPermissionsParams): Promise<SaveResult[]> {
  const permissionsToInsert = permissionsToSave.filter(
    (permission) => !permission.Id
  )
  const permissionsToUpdate = permissionsToSave.filter(
    (permission) => !!permission.Id
  )

  const results: SaveResult[] = []

  // Insert new permissions
  if (permissionsToInsert.length > 0) {
    const insertResult = await ipcRenderer.invoke('salesforce:insert', {
      ...connectionInfo,
      sobjectType: 'FieldPermissions',
      records: permissionsToInsert,
      toolingMode: false,
    })

    if (!insertResult.success) {
      throw new Error(insertResult.error)
    }

    results.push(...insertResult.data)
  }

  // Update existing permissions
  if (permissionsToUpdate.length > 0) {
    const updateResult = await ipcRenderer.invoke('salesforce:update', {
      ...connectionInfo,
      sobjectType: 'FieldPermissions',
      records: permissionsToUpdate,
      toolingMode: false,
    })

    if (!updateResult.success) {
      throw new Error(updateResult.error)
    }

    results.push(...updateResult.data)
  }

  return results
}

/**
 * Hook to fetch field permissions for the current sObject and selected profiles/permission sets.
 */
export function useFieldPermissionsQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username

  // Get UI state from Zustand store
  const sobjectName = usePermissionUIStore((state) => state.sobjectName)
  const permissionIds = usePermissionUIStore((state) => state.permissionIds)
  const permissionType = usePermissionUIStore((state) => state.permissionType)

  return useQuery({
    queryKey: queryKeys.fieldPermissions.byObject(
      activeConnectionId ?? '',
      sobjectName,
      permissionIds,
      permissionType
    ),
    queryFn: () => {
      const connectionInfo = buildConnectionInfo(activeConnection, activeConnectionId!)
      return fetchFieldPermissions(connectionInfo, sobjectName, permissionIds, permissionType)
    },
    enabled:
      !!activeConnectionId &&
      !!activeConnection &&
      isConnectionReady &&
      !!sobjectName &&
      permissionIds.length > 0,
    staleTime: 60 * 1000, // 1 minute - field permissions change more frequently
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to save field permissions.
 * Handles both insert (new) and update (existing) operations.
 */
export function useFieldPermissionMutation() {
  const queryClient = useQueryClient()
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)

  // Get current UI state for cache invalidation
  const sobjectName = usePermissionUIStore((state) => state.sobjectName)
  const permissionIds = usePermissionUIStore((state) => state.permissionIds)
  const permissionType = usePermissionUIStore((state) => state.permissionType)

  return useMutation({
    mutationFn: (permissionsToSave: FieldPermission[]) => {
      const connectionInfo = buildConnectionInfo(activeConnection, activeConnectionId!)
      return saveFieldPermissions({
        connectionInfo,
        permissionsToSave,
      })
    },
    onSuccess: () => {
      // Invalidate the field permissions query to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.fieldPermissions.byObject(
          activeConnectionId ?? '',
          sobjectName,
          permissionIds,
          permissionType
        ),
      })
    },
  })
}
