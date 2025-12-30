import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { useEffect, useRef, useCallback } from 'react'
import { useConnectionStore } from '../stores/useConnectionStore'
import { queryKeys } from './queryKeys'

// Identity response from Salesforce (jsforce v3 IdentityInfo)
export interface IdentityResponse {
  username: string
  email: string
  display_name: string
  nick_name: string
  user_id: string
  user_type: string
  organization_id: string
  language: string
}

// Connection info interface for IPC calls - exported for use in other query files
export interface ConnectionInfo {
  accessToken: string
  instanceUrl: string
  refreshToken: string
  loginUrl: string
  connectionId: string
}

// IPC fetch functions
async function fetchIdentity(connectionInfo: ConnectionInfo): Promise<IdentityResponse> {
  const result = await ipcRenderer.invoke('salesforce:identity', connectionInfo)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

async function fetchUserInfo(connectionInfo: ConnectionInfo): Promise<any> {
  const result = await ipcRenderer.invoke('salesforce:getUserInfo', connectionInfo)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

// Token refresh result interface
interface TokenRefreshResult {
  accessToken: string
}

interface TokenRefreshError extends Error {
  requiresReauth?: boolean
}

// Refresh access token using the refresh token
async function refreshAccessToken(connectionInfo: Omit<ConnectionInfo, 'accessToken'>): Promise<TokenRefreshResult> {
  const result = await ipcRenderer.invoke('salesforce:refreshToken', connectionInfo)
  if (!result.success) {
    const error = new Error(result.error) as TokenRefreshError
    error.requiresReauth = result.requiresReauth
    throw error
  }
  return result.data
}

// Helper to build ConnectionInfo from StoredConnection - exported for use in other query files
export function buildConnectionInfo(connection: any, connectionId: string): ConnectionInfo {
  return {
    accessToken: connection.accessToken,
    instanceUrl: connection.instanceUrl,
    refreshToken: connection.refreshToken,
    // Use 'url' field as loginUrl (the original login URL used for OAuth)
    loginUrl: connection.url || connection.loginUrl || 'https://login.salesforce.com',
    connectionId,
  }
}

/**
 * Hook to fetch Salesforce identity for the active connection.
 * Automatically runs when activeConnectionId changes.
 */
export function useIdentityQuery() {
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  // Select only primitive values to avoid reference instability
  const accessToken = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.accessToken : undefined
  )
  const instanceUrl = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.instanceUrl : undefined
  )
  const refreshToken = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.refreshToken : undefined
  )
  const loginUrl = useConnectionStore((state) => {
    if (!state.activeConnectionId) return undefined
    const conn = state.connections[state.activeConnectionId]
    return conn?.url || conn?.loginUrl || 'https://login.salesforce.com'
  })

  return useQuery({
    queryKey: queryKeys.identity(activeConnectionId ?? ''),
    queryFn: () => {
      const connectionInfo: ConnectionInfo = {
        accessToken: accessToken!,
        instanceUrl: instanceUrl!,
        refreshToken: refreshToken!,
        loginUrl: loginUrl!,
        connectionId: activeConnectionId!,
      }
      return fetchIdentity(connectionInfo)
    },
    enabled: !!activeConnectionId && !!accessToken,
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
  // Select only primitive values to avoid reference instability
  const accessToken = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.accessToken : undefined
  )
  const instanceUrl = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.instanceUrl : undefined
  )
  const refreshToken = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.refreshToken : undefined
  )
  const loginUrl = useConnectionStore((state) => {
    if (!state.activeConnectionId) return undefined
    const conn = state.connections[state.activeConnectionId]
    return conn?.url || conn?.loginUrl || 'https://login.salesforce.com'
  })

  return useQuery({
    queryKey: queryKeys.userInfo(activeConnectionId ?? ''),
    queryFn: () => {
      const connectionInfo: ConnectionInfo = {
        accessToken: accessToken!,
        instanceUrl: instanceUrl!,
        refreshToken: refreshToken!,
        loginUrl: loginUrl!,
        connectionId: activeConnectionId!,
      }
      return fetchUserInfo(connectionInfo)
    },
    enabled: !!activeConnectionId && !!accessToken,
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
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const setActiveConnectionPending = useConnectionStore((state) => state.setActiveConnectionPending)
  const setActiveConnectionError = useConnectionStore((state) => state.setActiveConnectionError)
  const setActiveConnectionData = useConnectionStore((state) => state.setActiveConnectionData)

  const identityQuery = useIdentityQuery()
  const userInfoQuery = useUserInfoQuery()

  // Use refs to track what we've already processed to prevent infinite loops
  const lastPendingRef = useRef<boolean | null>(null)
  const lastErrorRef = useRef<string | null>(null)
  const lastIdentityDataRef = useRef<IdentityResponse | null>(null)
  const lastUserInfoDataRef = useRef<any>(null)

  // Handle pending state - only update when loading state actually changes
  const isPending = identityQuery.isLoading || userInfoQuery.isLoading
  useEffect(() => {
    if (lastPendingRef.current !== isPending) {
      lastPendingRef.current = isPending
      if (isPending) {
        setActiveConnectionPending(true)
      }
    }
  }, [isPending, setActiveConnectionPending])

  // Handle error state - use error message string to avoid reference comparison issues
  const errorMessage = (identityQuery.error || userInfoQuery.error)
    ? ((identityQuery.error || userInfoQuery.error) as Error).message
    : null
  useEffect(() => {
    if (lastErrorRef.current !== errorMessage && errorMessage !== null) {
      lastErrorRef.current = errorMessage
      setActiveConnectionError(errorMessage)
    }
  }, [errorMessage, setActiveConnectionError])

  // Handle success state - update connection with identity info
  useEffect(() => {
    if (identityQuery.data && activeConnectionId && lastIdentityDataRef.current !== identityQuery.data) {
      lastIdentityDataRef.current = identityQuery.data
      const identity = identityQuery.data
      updateConnection(activeConnectionId, {
        username: identity.username,
        email: identity.email,
        display_name: identity.display_name,
        nick_name: identity.nick_name,
        user_id: identity.user_id,
        user_type: identity.user_type,
        organization_id: identity.organization_id,
        language: identity.language,
      })
    }
  }, [identityQuery.data, activeConnectionId, updateConnection])

  // Handle success state - set active connection data
  useEffect(() => {
    if (identityQuery.data && userInfoQuery.data && activeConnectionId && lastUserInfoDataRef.current !== userInfoQuery.data) {
      lastUserInfoDataRef.current = userInfoQuery.data
      // Pass null for connection since we use IPC, userInfo is what matters
      setActiveConnectionData(null as any, userInfoQuery.data)
    }
  }, [identityQuery.data, userInfoQuery.data, activeConnectionId, setActiveConnectionData])

  // Reset refs when connection changes
  useEffect(() => {
    lastPendingRef.current = null
    lastErrorRef.current = null
    lastIdentityDataRef.current = null
    lastUserInfoDataRef.current = null
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

/**
 * Hook to refresh the access token for the active connection.
 * Use this when you encounter a session expiry error.
 * Returns a mutation that can be triggered manually.
 */
export function useTokenRefresh() {
  const queryClient = useQueryClient()
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const refreshToken = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.refreshToken : undefined
  )
  const instanceUrl = useConnectionStore((state) =>
    state.activeConnectionId ? state.connections[state.activeConnectionId]?.instanceUrl : undefined
  )
  const loginUrl = useConnectionStore((state) => {
    if (!state.activeConnectionId) return undefined
    const conn = state.connections[state.activeConnectionId]
    return conn?.url || conn?.loginUrl || 'https://login.salesforce.com'
  })

  const refreshMutation = useMutation({
    mutationFn: async () => {
      if (!activeConnectionId || !refreshToken || !instanceUrl || !loginUrl) {
        throw new Error('Missing connection info for token refresh')
      }

      return refreshAccessToken({
        refreshToken,
        instanceUrl,
        loginUrl,
        connectionId: activeConnectionId,
      })
    },
    onSuccess: (data) => {
      if (activeConnectionId && data.accessToken) {
        // Update the stored access token
        updateConnection(activeConnectionId, { accessToken: data.accessToken })

        // Invalidate all queries to refetch with new token
        queryClient.invalidateQueries({
          queryKey: queryKeys.all(activeConnectionId),
        })
      }
    },
    onError: (error: TokenRefreshError) => {
      console.error('Token refresh failed:', error.message)
      if (error.requiresReauth) {
        // The refresh token itself is expired - user needs to re-authenticate
        console.error('Refresh token expired - user must re-authenticate')
      }
    },
  })

  const refresh = useCallback(() => {
    return refreshMutation.mutateAsync()
  }, [refreshMutation])

  return {
    refresh,
    isRefreshing: refreshMutation.isPending,
    error: refreshMutation.error as TokenRefreshError | null,
    requiresReauth: (refreshMutation.error as TokenRefreshError)?.requiresReauth ?? false,
  }
}
