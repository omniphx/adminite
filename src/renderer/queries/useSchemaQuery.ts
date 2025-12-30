import { useQuery } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore'
import { queryKeys } from './queryKeys'
import { DescribeGlobalResult } from 'jsforce'
import { ConnectionInfo, buildConnectionInfo } from './useConnectionQuery'

// Type alias for sObject describe result from global describe
export type DescribeGlobalSObjectResult = DescribeGlobalResult['sobjects'][number]

// IPC fetch functions
async function fetchDescribeGlobal(connectionInfo: ConnectionInfo): Promise<DescribeGlobalSObjectResult[]> {
  const result = await ipcRenderer.invoke('salesforce:describeGlobal', connectionInfo)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data.sobjects
}

async function fetchToolingDescribeGlobal(connectionInfo: ConnectionInfo): Promise<DescribeGlobalSObjectResult[]> {
  const result = await ipcRenderer.invoke('salesforce:toolingDescribeGlobal', connectionInfo)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data.sobjects
}

async function fetchNamespace(connectionInfo: ConnectionInfo): Promise<string | null> {
  const result = await ipcRenderer.invoke('salesforce:query', {
    ...connectionInfo,
    queryString: 'SELECT NamespacePrefix FROM Organization',
  })
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data.records[0]?.NamespacePrefix ?? null
}

/**
 * Hook to fetch global describe (standard sObjects).
 * Only enabled when the connection has identity loaded (username is set).
 */
export function useGlobalDescribeQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  // Only enable after identity is loaded (username is set after identity call)
  const isConnectionReady = !!activeConnection?.username

  return useQuery({
    queryKey: queryKeys.schema.global(activeConnectionId ?? ''),
    queryFn: () => {
      const connectionInfo = buildConnectionInfo(activeConnection, activeConnectionId!)
      return fetchDescribeGlobal(connectionInfo)
    },
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch tooling describe (tooling sObjects).
 * Only enabled when the connection has identity loaded.
 */
export function useToolingDescribeQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username

  return useQuery({
    queryKey: queryKeys.schema.tooling(activeConnectionId ?? ''),
    queryFn: () => {
      const connectionInfo = buildConnectionInfo(activeConnection, activeConnectionId!)
      return fetchToolingDescribeGlobal(connectionInfo)
    },
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch namespace prefix for the org.
 * Only enabled when the connection has identity loaded.
 */
export function useNamespaceQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const isConnectionReady = !!activeConnection?.username

  return useQuery({
    queryKey: queryKeys.schema.namespace(activeConnectionId ?? ''),
    queryFn: () => {
      const connectionInfo = buildConnectionInfo(activeConnection, activeConnectionId!)
      return fetchNamespace(connectionInfo)
    },
    enabled: !!activeConnectionId && !!activeConnection && isConnectionReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Convenience hook that returns the appropriate sObject list based on tooling mode.
 */
export function useSObjectList(toolingMode: boolean) {
  const globalDescribe = useGlobalDescribeQuery()
  const toolingDescribe = useToolingDescribeQuery()

  return {
    sobjects: toolingMode ? toolingDescribe.data : globalDescribe.data,
    isLoading: toolingMode ? toolingDescribe.isLoading : globalDescribe.isLoading,
    isError: toolingMode ? toolingDescribe.isError : globalDescribe.isError,
    error: toolingMode ? toolingDescribe.error : globalDescribe.error,
  }
}
