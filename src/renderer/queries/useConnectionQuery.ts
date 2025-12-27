import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { useEffect } from 'react'
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore'
import { queryKeys } from './queryKeys'

// Identity response from Salesforce
export interface IdentityResponse {
  username: string
  first_name: string
  last_name: string
  email: string
  display_name: string
  timezone: string
  user_id: string
  user_type: string
  organization_id: string
  locale: string
  language: string
}

// IPC fetch functions
async function fetchIdentity(connectionInfo: any): Promise<IdentityResponse> {
  const result = await ipcRenderer.invoke('salesforce:identity', connectionInfo)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

async function fetchUserInfo(connectionInfo: any): Promise<any> {
  const result = await ipcRenderer.invoke('salesforce:getUserInfo', connectionInfo)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

/**
 * Hook to fetch Salesforce identity for the active connection.
 * Automatically runs when activeConnectionId changes.
 */
export function useIdentityQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)

  return useQuery({
    queryKey: queryKeys.identity(activeConnectionId ?? ''),
    queryFn: () => fetchIdentity(activeConnection),
    enabled: !!activeConnectionId && !!activeConnection,
    staleTime: 5 * 60 * 1000, // 5 minutes - identity doesn't change often
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Hook to fetch Salesforce user info for the active connection.
 * Automatically runs when activeConnectionId changes.
 */
export function useUserInfoQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)

  return useQuery({
    queryKey: queryKeys.userInfo(activeConnectionId ?? ''),
    queryFn: () => fetchUserInfo(activeConnection),
    enabled: !!activeConnectionId && !!activeConnection,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Combined hook that orchestrates the connection flow:
 * 1. Fetches identity and userInfo in parallel
 * 2. Updates Zustand store with identity info on success
 * 3. Updates pending/error state in Zustand
 * 4. Invalidates old connection data on connection switch
 *
 * Use this hook in App.tsx to manage the connection lifecycle.
 */
export function useConnectionQuery() {
  const queryClient = useQueryClient()
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const activeConnection = useConnectionStore(getActiveConnection)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const setActiveConnectionPending = useConnectionStore((state) => state.setActiveConnectionPending)
  const setActiveConnectionError = useConnectionStore((state) => state.setActiveConnectionError)
  const setActiveConnectionData = useConnectionStore((state) => state.setActiveConnectionData)

  const identityQuery = useIdentityQuery()
  const userInfoQuery = useUserInfoQuery()

  // Update Zustand store based on query states
  useEffect(() => {
    const isPending = identityQuery.isLoading || userInfoQuery.isLoading
    const error = identityQuery.error || userInfoQuery.error

    if (isPending) {
      setActiveConnectionPending(true)
    } else if (error) {
      setActiveConnectionError((error as Error).message)
    } else if (identityQuery.data && userInfoQuery.data && activeConnectionId) {
      // Both queries succeeded - update the connection store with identity info
      const identity = identityQuery.data
      updateConnection(activeConnectionId, {
        username: identity.username,
        first_name: identity.first_name,
        last_name: identity.last_name,
        email: identity.email,
        display_name: identity.display_name,
        timezone: identity.timezone,
        user_id: identity.user_id,
        user_type: identity.user_type,
        organization_id: identity.organization_id,
        locale: identity.locale,
        language: identity.language,
      })

      // Set active connection data (using stored connection as the connection object)
      // Note: The actual jsforce Connection is not serializable for Zustand,
      // so we store the connection info which is used via IPC
      setActiveConnectionData(activeConnection as any, userInfoQuery.data)
    }
  }, [
    identityQuery.isLoading,
    identityQuery.data,
    identityQuery.error,
    userInfoQuery.isLoading,
    userInfoQuery.data,
    userInfoQuery.error,
    activeConnectionId,
  ])

  // Invalidate all cached data when switching connections
  useEffect(() => {
    return () => {
      // This runs when activeConnectionId changes (cleanup of previous value)
      // We don't need to do anything here since TanStack Query handles refetching
      // when the query key changes
    }
  }, [activeConnectionId])

  return {
    identity: identityQuery.data,
    userInfo: userInfoQuery.data,
    isLoading: identityQuery.isLoading || userInfoQuery.isLoading,
    isError: identityQuery.isError || userInfoQuery.isError,
    error: identityQuery.error || userInfoQuery.error,
    refetch: () => {
      identityQuery.refetch()
      userInfoQuery.refetch()
    },
  }
}

/**
 * Hook to invalidate all cached data for a connection.
 * Call this when the user explicitly wants to refresh connection data.
 */
export function useInvalidateConnection() {
  const queryClient = useQueryClient()
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)

  return () => {
    if (activeConnectionId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all(activeConnectionId),
      })
    }
  }
}
