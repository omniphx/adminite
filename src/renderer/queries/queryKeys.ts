/**
 * Query key factory for TanStack Query
 *
 * All keys are prefixed with connectionId for easy invalidation on connection switch.
 * Tab-scoped queries include tabId in the key.
 *
 * Usage:
 *   queryKeys.schema.global(connectionId)
 *   queryKeys.sobject.describe(connectionId, tabId, 'Account', 'QUERY')
 *   queryKeys.queryResults.query(connectionId, tabId, 'SELECT Id FROM Account', false)
 */
export const queryKeys = {
  // Base key for all connection-scoped queries
  // Invalidating this key clears ALL cached data for a connection
  all: (connectionId: string) => [connectionId] as const,

  // Schema - global org metadata
  schema: {
    all: (connectionId: string) => [...queryKeys.all(connectionId), 'schema'] as const,
    global: (connectionId: string) => [...queryKeys.schema.all(connectionId), 'global'] as const,
    tooling: (connectionId: string) => [...queryKeys.schema.all(connectionId), 'tooling'] as const,
    namespace: (connectionId: string) => [...queryKeys.schema.all(connectionId), 'namespace'] as const,
  },

  // SObject describe - tab-scoped with context (QUERY for autocomplete, RESULT for table)
  sobject: {
    all: (connectionId: string) => [...queryKeys.all(connectionId), 'sobject'] as const,
    describe: (
      connectionId: string,
      tabId: string,
      sObjectName: string,
      context: 'QUERY' | 'RESULT'
    ) => [...queryKeys.sobject.all(connectionId), tabId, sObjectName, context] as const,
  },

  // Query results - tab-scoped, keyed by query string for caching different queries
  queryResults: {
    all: (connectionId: string) => [...queryKeys.all(connectionId), 'queryResults'] as const,
    byTab: (connectionId: string, tabId: string) =>
      [...queryKeys.queryResults.all(connectionId), tabId] as const,
    query: (
      connectionId: string,
      tabId: string,
      queryString: string,
      includeDeleted: boolean
    ) => [...queryKeys.queryResults.byTab(connectionId, tabId), queryString, includeDeleted] as const,
  },

  // Permissions - profiles and permission sets
  permissions: {
    all: (connectionId: string) => [...queryKeys.all(connectionId), 'permissions'] as const,
    profiles: (connectionId: string, ids: string[]) =>
      [...queryKeys.permissions.all(connectionId), 'profiles', ...ids.sort()] as const,
    permissionSets: (connectionId: string, namespace: string | undefined, ids: string[]) =>
      [...queryKeys.permissions.all(connectionId), 'permissionSets', namespace ?? '', ...ids.sort()] as const,
    sobjects: (connectionId: string) =>
      [...queryKeys.permissions.all(connectionId), 'sobjects'] as const,
    fields: (connectionId: string, sobjectName: string) =>
      [...queryKeys.permissions.all(connectionId), 'fields', sobjectName] as const,
  },

  // Field permissions - FLS data
  fieldPermissions: {
    all: (connectionId: string) => [...queryKeys.all(connectionId), 'fieldPermissions'] as const,
    byObject: (
      connectionId: string,
      sobjectName: string,
      permissionIds: string[],
      permissionType: string
    ) => [
      ...queryKeys.fieldPermissions.all(connectionId),
      sobjectName,
      permissionType,
      ...permissionIds.sort(),
    ] as const,
  },

  // User identity - connection-scoped
  identity: (connectionId: string) => [...queryKeys.all(connectionId), 'identity'] as const,
  userInfo: (connectionId: string) => [...queryKeys.all(connectionId), 'userInfo'] as const,
} as const

// Type helpers for query keys
export type QueryKeys = typeof queryKeys
