import { useQuery } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { QueryResult } from 'jsforce'
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore'
import { queryKeys } from './queryKeys'
import { getProfiles, getPermissionSets } from '../utils/queryBuilder'
import { useNamespaceQuery } from './useSchemaQuery'

// Types for permission data
export interface PermissionRecord {
  Id: string
  Name?: string
  Label?: string
  IsOwnedByProfile: boolean
  Profile?: {
    Id: string
    Name: string
  }
}

export interface EntityDefinition {
  Id: string
  DeveloperName: string
  Label: string
  QualifiedApiName: string
}

export interface EntityParticle {
  Id: string
  Name: string
  IsUpdatable: boolean
  RelationshipName: string | null
  DataType: string
  ValueTypeId: string
  IsCompound: boolean
  IsCreatable: boolean
  IsCalculated: boolean
  IsPermissionable: boolean
  Label: string
  IsComponent: boolean
  NamespacePrefix: string | null
}

// Fetch profiles via IPC
async function fetchProfiles(
  connectionInfo: any,
  permissionIds: string[]
): Promise<PermissionRecord[]> {
  if (!connectionInfo) {
    throw new Error('No active connection')
  }

  const queryString = getProfiles(permissionIds)
  const result = await ipcRenderer.invoke('salesforce:query', {
    ...connectionInfo,
    queryString,
    toolingMode: false,
  })

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.records
}

// Fetch permission sets via IPC
async function fetchPermissionSets(
  connectionInfo: any,
  namespace: string | null,
  permissionIds: string[]
): Promise<PermissionRecord[]> {
  if (!connectionInfo) {
    throw new Error('No active connection')
  }

  const queryString = getPermissionSets(namespace, permissionIds)
  const result = await ipcRenderer.invoke('salesforce:query', {
    ...connectionInfo,
    queryString,
    toolingMode: false,
  })

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.records
}

// Fetch FLS-enabled sObjects with pagination
async function fetchFlsSObjects(connectionInfo: any): Promise<EntityDefinition[]> {
  if (!connectionInfo) {
    throw new Error('No active connection')
  }

  const allRecords: EntityDefinition[] = []
  let done = false
  let nextRecordsUrl: string | null = null

  // Initial query
  const queryString = `SELECT Id, DeveloperName, Label, QualifiedApiName FROM EntityDefinition WHERE IsFlsEnabled = true ORDER BY DeveloperName`
  const initialResult = await ipcRenderer.invoke('salesforce:query', {
    ...connectionInfo,
    queryString,
    toolingMode: true,
  })

  if (!initialResult.success) {
    throw new Error(initialResult.error)
  }

  const initialData: QueryResult<EntityDefinition> = initialResult.data
  allRecords.push(...initialData.records)
  done = initialData.done
  nextRecordsUrl = initialData.nextRecordsUrl || null

  // Paginate if needed
  while (!done && nextRecordsUrl) {
    const moreResult = await ipcRenderer.invoke('salesforce:queryMore', {
      ...connectionInfo,
      nextRecordsUrl,
      toolingMode: true,
    })

    if (!moreResult.success) {
      throw new Error(moreResult.error)
    }

    const moreData = moreResult.data
    allRecords.push(...moreData.records)
    done = moreData.done
    nextRecordsUrl = moreData.nextRecordsUrl || null
  }

  return allRecords
}

// Fetch fields for an sObject with pagination
async function fetchFlsFields(
  connectionInfo: any,
  sobjectName: string
): Promise<EntityParticle[]> {
  if (!connectionInfo) {
    throw new Error('No active connection')
  }

  const allRecords: EntityParticle[] = []
  let done = false
  let nextRecordsUrl: string | null = null

  const queryString = `SELECT Id, Name, IsUpdatable, RelationshipName, DataType, ValueTypeId, IsCompound, IsCreatable, IsCalculated, IsPermissionable, Label, IsComponent, NamespacePrefix FROM EntityParticle WHERE EntityDefinitionId = '${sobjectName}'`
  const initialResult = await ipcRenderer.invoke('salesforce:query', {
    ...connectionInfo,
    queryString,
    toolingMode: true,
  })

  if (!initialResult.success) {
    throw new Error(initialResult.error)
  }

  const initialData: QueryResult<EntityParticle> = initialResult.data
  allRecords.push(...initialData.records)
  done = initialData.done
  nextRecordsUrl = initialData.nextRecordsUrl || null

  // Paginate if needed
  while (!done && nextRecordsUrl) {
    const moreResult = await ipcRenderer.invoke('salesforce:queryMore', {
      ...connectionInfo,
      nextRecordsUrl,
      toolingMode: true,
    })

    if (!moreResult.success) {
      throw new Error(moreResult.error)
    }

    const moreData = moreResult.data
    allRecords.push(...moreData.records)
    done = moreData.done
    nextRecordsUrl = moreData.nextRecordsUrl || null
  }

  return allRecords
}

/**
 * Hook to fetch profiles.
 * Returns all profiles when no permissionIds are provided.
 */
export function useProfilesQuery(permissionIds: string[] = []) {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username

  return useQuery({
    queryKey: queryKeys.permissions.profiles(activeConnectionId ?? '', permissionIds),
    queryFn: () => fetchProfiles(activeConnection, permissionIds),
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch permission sets.
 * Uses the namespace from the org.
 */
export function usePermissionSetsQuery(permissionIds: string[] = []) {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username
  const { data: namespace } = useNamespaceQuery()

  return useQuery({
    queryKey: queryKeys.permissions.permissionSets(
      activeConnectionId ?? '',
      namespace ?? undefined,
      permissionIds
    ),
    queryFn: () => fetchPermissionSets(activeConnection, namespace ?? null, permissionIds),
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch permissions based on type.
 * Convenience hook that switches between profiles and permission sets.
 */
export function usePermissionsQuery(permissionType: 'profile' | 'permissionSet', permissionIds: string[] = []) {
  const profilesQuery = useProfilesQuery(permissionType === 'profile' ? permissionIds : [])
  const permissionSetsQuery = usePermissionSetsQuery(permissionType === 'permissionSet' ? permissionIds : [])

  if (permissionType === 'profile') {
    return profilesQuery
  }
  return permissionSetsQuery
}

/**
 * Hook to fetch FLS-enabled sObjects.
 * Handles pagination automatically.
 */
export function useFlsSObjectsQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username

  return useQuery({
    queryKey: queryKeys.permissions.sobjects(activeConnectionId ?? ''),
    queryFn: () => fetchFlsSObjects(activeConnection),
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch fields for an sObject.
 * Handles pagination automatically.
 */
export function useFlsFieldsQuery(sobjectName: string | undefined) {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username

  return useQuery({
    queryKey: queryKeys.permissions.fields(activeConnectionId ?? '', sobjectName ?? ''),
    queryFn: () => fetchFlsFields(activeConnection, sobjectName!),
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady && !!sobjectName,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
