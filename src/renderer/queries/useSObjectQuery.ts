import { useQuery } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { DescribeSObjectResult, Field } from 'jsforce'
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore'
import { useTabStore } from '../stores/useTabStore'
import { queryKeys } from './queryKeys'

// Field schema is fields indexed by name for quick lookup
export interface FieldSchema {
  [fieldName: string]: Field
}

export interface SObjectDescribeResult {
  sobject: DescribeSObjectResult
  fieldSchema: FieldSchema
}

/**
 * Fetch sObject describe via IPC
 */
async function fetchSObjectDescribe(
  connectionInfo: any,
  sObjectName: string,
  toolingMode: boolean
): Promise<SObjectDescribeResult> {
  if (!connectionInfo) {
    throw new Error('No active connection')
  }

  const result = await ipcRenderer.invoke('salesforce:describe', {
    accessToken: connectionInfo.accessToken,
    instanceUrl: connectionInfo.instanceUrl,
    refreshToken: connectionInfo.refreshToken,
    sObjectName,
    toolingMode,
  })

  if (!result.success) {
    throw new Error(result.error)
  }

  const sobject: DescribeSObjectResult = result.data

  // Build field schema (fields indexed by name)
  const fieldSchema = sobject.fields.reduce<FieldSchema>((accumulator, field) => {
    accumulator[field.name] = field
    return accumulator
  }, {})

  return { sobject, fieldSchema }
}

/**
 * Hook to fetch sObject describe for query editor autocomplete.
 * Uses the tab's tooling mode setting.
 *
 * @param tabId - The tab ID
 * @param sObjectName - The sObject API name to describe
 */
export function useQuerySObjectDescribe(tabId: string, sObjectName: string | undefined) {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const toolingMode = useTabStore((state) => state.queries[tabId]?.toolingMode ?? false)

  return useQuery({
    queryKey: queryKeys.sobject.describe(activeConnectionId ?? '', tabId, sObjectName ?? '', 'QUERY'),
    queryFn: () => fetchSObjectDescribe(activeConnection, sObjectName!, toolingMode),
    enabled: !!activeConnectionId && !!activeConnection && !!sObjectName,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  })
}

/**
 * Hook to fetch sObject describe for results table rendering.
 * Uses the tab's tooling mode setting.
 *
 * @param tabId - The tab ID
 * @param sObjectName - The sObject API name to describe
 */
export function useResultSObjectDescribe(tabId: string, sObjectName: string | undefined) {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const toolingMode = useTabStore((state) => state.queries[tabId]?.toolingMode ?? false)

  return useQuery({
    queryKey: queryKeys.sobject.describe(activeConnectionId ?? '', tabId, sObjectName ?? '', 'RESULT'),
    queryFn: () => fetchSObjectDescribe(activeConnection, sObjectName!, toolingMode),
    enabled: !!activeConnectionId && !!activeConnection && !!sObjectName,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  })
}

/**
 * Generic hook to fetch sObject describe with explicit context.
 *
 * @param tabId - The tab ID
 * @param sObjectName - The sObject API name to describe
 * @param context - 'QUERY' for editor autocomplete, 'RESULT' for results table
 */
export function useSObjectDescribe(
  tabId: string,
  sObjectName: string | undefined,
  context: 'QUERY' | 'RESULT'
) {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const toolingMode = useTabStore((state) => state.queries[tabId]?.toolingMode ?? false)

  return useQuery({
    queryKey: queryKeys.sobject.describe(activeConnectionId ?? '', tabId, sObjectName ?? '', context),
    queryFn: () => fetchSObjectDescribe(activeConnection, sObjectName!, toolingMode),
    enabled: !!activeConnectionId && !!activeConnection && !!sObjectName,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  })
}
