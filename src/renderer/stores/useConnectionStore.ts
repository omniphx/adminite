import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { v4 as uuidv4 } from 'uuid'
import { Connection, UserInfo } from 'jsforce'

// Types
export interface StoredConnection {
  id: string
  name: string
  url: string
  environment: string
  sortOrder: number
  // Identity fields (populated after successful connection)
  username?: string
  email?: string
  display_name?: string
  nick_name?: string
  user_id?: string
  user_type?: string
  organization_id?: string
  language?: string
  // OAuth tokens
  accessToken?: string
  refreshToken?: string
  instanceUrl?: string
  loginUrl?: string // OAuth login URL (e.g., https://login.salesforce.com or https://test.salesforce.com)
}

export interface ActiveConnectionState {
  connection?: Connection
  userInfo?: UserInfo
  pending: boolean
  error?: string
}

interface ConnectionState {
  // All stored connections (persisted)
  connections: Record<string, StoredConnection>
  connectionOrder: string[] // IDs in sorted order

  // Active connection state
  activeConnectionId: string | null
  activeConnection: ActiveConnectionState

  // UI state
  modalVisible: boolean
}

interface ConnectionActions {
  // Connection CRUD
  addConnection: (connection: Omit<StoredConnection, 'id' | 'sortOrder'>) => StoredConnection
  updateConnection: (id: string, updates: Partial<StoredConnection>) => void
  deleteConnection: (id: string) => void
  moveConnection: (fromIndex: number, toIndex: number) => void

  // Active connection management
  setActiveConnectionId: (id: string | null) => void
  setActiveConnectionPending: (pending: boolean) => void
  setActiveConnectionError: (error: string | null) => void
  setActiveConnectionData: (connection: Connection, userInfo: UserInfo) => void
  clearActiveConnection: () => void

  // Modal
  toggleModal: () => void
  setModalVisible: (visible: boolean) => void

  // Initialization (migrate from old localStorage format)
  initializeFromLegacyStorage: () => void
}

const initialActiveConnectionState: ActiveConnectionState = {
  connection: undefined,
  userInfo: undefined,
  pending: false,
  error: undefined,
}

export const useConnectionStore = create<ConnectionState & ConnectionActions>()(
  persist(
    (set, get) => ({
      // Initial state
      connections: {},
      connectionOrder: [],
      activeConnectionId: null,
      activeConnection: initialActiveConnectionState,
      modalVisible: false,

      // Connection CRUD
      addConnection: (connectionData) => {
        const id = uuidv4()
        const sortOrder = get().connectionOrder.length
        const connection: StoredConnection = {
          ...connectionData,
          id,
          sortOrder,
        }

        set((state) => ({
          connections: {
            ...state.connections,
            [id]: connection,
          },
          connectionOrder: [...state.connectionOrder, id],
        }))

        return connection
      },

      updateConnection: (id, updates) => {
        set((state) => {
          const existing = state.connections[id]
          if (!existing) return state

          return {
            connections: {
              ...state.connections,
              [id]: { ...existing, ...updates },
            },
          }
        })
      },

      deleteConnection: (id) => {
        set((state) => {
          const { [id]: deleted, ...remaining } = state.connections
          const newOrder = state.connectionOrder.filter((connId) => connId !== id)

          // Update sort orders
          const updatedConnections: Record<string, StoredConnection> = {}
          newOrder.forEach((connId, index) => {
            updatedConnections[connId] = {
              ...remaining[connId],
              sortOrder: index,
            }
          })

          // If we deleted the active connection, select the first remaining one
          const newActiveId = state.activeConnectionId === id
            ? (newOrder.length > 0 ? newOrder[0] : null)
            : state.activeConnectionId

          return {
            connections: updatedConnections,
            connectionOrder: newOrder,
            activeConnectionId: newActiveId,
            // Clear active connection state if we deleted the active one
            activeConnection: state.activeConnectionId === id
              ? initialActiveConnectionState
              : state.activeConnection,
          }
        })
      },

      moveConnection: (fromIndex, toIndex) => {
        set((state) => {
          const newOrder = [...state.connectionOrder]
          const [moved] = newOrder.splice(fromIndex, 1)
          newOrder.splice(toIndex, 0, moved)

          // Update sort orders in connections
          const updatedConnections: Record<string, StoredConnection> = {}
          newOrder.forEach((id, index) => {
            updatedConnections[id] = {
              ...state.connections[id],
              sortOrder: index,
            }
          })

          return {
            connectionOrder: newOrder,
            connections: updatedConnections,
          }
        })
      },

      // Active connection management
      setActiveConnectionId: (id) => {
        set({
          activeConnectionId: id,
          activeConnection: initialActiveConnectionState,
        })
      },

      setActiveConnectionPending: (pending) => {
        set((state) => ({
          activeConnection: {
            ...state.activeConnection,
            pending,
            error: pending ? undefined : state.activeConnection.error,
          },
        }))
      },

      setActiveConnectionError: (error) => {
        set((state) => ({
          activeConnection: {
            ...state.activeConnection,
            error: error ?? undefined,
            pending: false,
          },
        }))
      },

      setActiveConnectionData: (connection, userInfo) => {
        set((state) => ({
          activeConnection: {
            connection,
            userInfo,
            pending: false,
            error: undefined,
          },
        }))
      },

      clearActiveConnection: () => {
        set({
          activeConnection: initialActiveConnectionState,
        })
      },

      // Modal
      toggleModal: () => {
        set((state) => ({
          modalVisible: !state.modalVisible,
        }))
      },

      setModalVisible: (visible) => {
        set({ modalVisible: visible })
      },

      // Initialize from legacy localStorage format
      initializeFromLegacyStorage: () => {
        // Only migrate if we haven't already (new store is empty)
        const currentConnections = get().connectionOrder
        if (currentConnections.length > 0) {
          // Already have data in new store, skip migration but clean up legacy
          localStorage.removeItem('connections')
          return
        }

        const legacyData = localStorage.getItem('connections')
        if (!legacyData) return

        try {
          const legacyConnections = JSON.parse(legacyData) as Record<string, StoredConnection>
          const connectionsArray = Object.values(legacyConnections)

          // Sort by sortOrder
          connectionsArray.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

          const connections: Record<string, StoredConnection> = {}
          const connectionOrder: string[] = []

          connectionsArray.forEach((conn, index) => {
            connections[conn.id] = { ...conn, sortOrder: index }
            connectionOrder.push(conn.id)
          })

          set({
            connections,
            connectionOrder,
            // Select first connection if available
            activeConnectionId: connectionOrder.length > 0 ? connectionOrder[0] : null,
          })

          // Remove legacy storage after successful migration
          localStorage.removeItem('connections')
        } catch (error) {
          console.error('Failed to migrate legacy connections:', error)
        }
      },
    }),
    {
      name: 'adminite-connections',
      partialize: (state) => ({
        connections: state.connections,
        connectionOrder: state.connectionOrder,
        // Don't persist activeConnectionId - will be set on init
        // Don't persist activeConnection - runtime state
        // Don't persist modalVisible - UI state
      }),
    }
  )
)

// Selector helpers
export const getConnectionById = (id: string) => (state: ConnectionState) =>
  state.connections[id]

export const getConnectionsArray = (state: ConnectionState) =>
  state.connectionOrder.map((id) => state.connections[id])

export const getActiveConnection = (state: ConnectionState) =>
  state.activeConnectionId ? state.connections[state.activeConnectionId] : null

// Hook that uses shallow comparison for array selectors (prevents infinite re-renders)
export const useConnectionsArray = () =>
  useConnectionStore(useShallow(getConnectionsArray))
