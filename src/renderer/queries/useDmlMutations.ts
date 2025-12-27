import { useMutation } from '@tanstack/react-query'
import { ipcRenderer } from 'electron'
import { notification } from 'antd'
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore'
import { useQueryResultStore } from '../stores/useQueryResultStore'
import { useTabStore } from '../stores/useTabStore'
import { getRecordId, chunk } from '../../helpers/utils'
import { buildConnectionInfo } from './useConnectionQuery'

/**
 * Hook for updating records via DML
 * Replaces the Redux saga dmlUpdate flow
 */
export function useDmlUpdate() {
  return useMutation({
    mutationFn: async (tabId: string) => {
      const state = useConnectionStore.getState()
      const connection = getActiveConnection(state)
      const connectionId = state.activeConnectionId
      if (!connection || !connectionId) {
        throw new Error('No active connection')
      }

      // Build connection info with loginUrl for token refresh
      const connectionInfo = buildConnectionInfo(connection, connectionId)

      const queryState = useTabStore.getState().queries[tabId]
      const toolingMode = queryState?.toolingMode ?? false
      const batchSize = queryState?.batchSize ?? 200

      const resultState = useQueryResultStore.getState().byTabId[tabId]
      const data = resultState?.data ?? {}

      // Set DML pending
      useQueryResultStore.getState().setDmlPending(tabId, true)

      // Find records with edits
      const recordsWithUpdates: Record<string, any> = {}
      Object.values(data).forEach((record: any) => {
        if (record.editFields && record.editFields.length > 0) {
          const recordId = getRecordId(record)
          if (recordId) {
            recordsWithUpdates[recordId] = record
          }
        }
      })

      // Group records by sObject type
      const recordsToSaveWrapper: Record<string, any[]> = {}
      Object.values(recordsWithUpdates).forEach((record: any) => {
        const Id = getRecordId(record)
        const sObjectType = record.attributes.type
        const recordToSave: Record<string, any> = { Id }

        record.editFields.forEach((field: string) => {
          recordToSave[field] = record[field]
        })

        if (!recordsToSaveWrapper[sObjectType]) {
          recordsToSaveWrapper[sObjectType] = []
        }
        recordsToSaveWrapper[sObjectType].push(recordToSave)
      })

      // Process each sObject type
      await Promise.all(
        Object.keys(recordsToSaveWrapper).map(async (sObjectType) => {
          const recordsChunked = chunk(recordsToSaveWrapper[sObjectType], batchSize)

          await Promise.all(
            recordsChunked.map(async (recordsToSave: any[]) => {
              const apiResult = await ipcRenderer.invoke('salesforce:update', {
                ...connectionInfo,
                sobjectType: sObjectType,
                records: recordsToSave,
                toolingMode,
              })

              if (!apiResult.success) {
                throw new Error(apiResult.error)
              }

              const results: any[] = apiResult.data

              // Update records with results
              for (let i = 0; i < results.length; i++) {
                const recordId = recordsToSave[i].Id
                const record = recordsWithUpdates[recordId]
                const result = results[i]

                if (result.success) {
                  record.editFields = []
                  record.errorMessage = ''
                } else {
                  record.errorMessage = result.errors.reduce(
                    (errorString: string, error: any) => errorString + '\r\n' + error.message,
                    ''
                  )
                }
              }
            })
          )
        })
      )

      // Update the store with the modified data
      useQueryResultStore.getState().setData(tabId, { ...data })

      return { success: true }
    },
    onError: (error: Error, tabId) => {
      console.error('DML update error:', error)
      useQueryResultStore.getState().setError(tabId, error.message)
    },
    onSettled: (data, error, tabId) => {
      useQueryResultStore.getState().setDmlPending(tabId, false)
    },
  })
}

/**
 * Hook for deleting records via DML
 * Replaces the Redux saga dmlDelete flow
 */
export function useDmlDelete() {
  return useMutation({
    mutationFn: async (tabId: string) => {
      const state = useConnectionStore.getState()
      const connection = getActiveConnection(state)
      const connectionId = state.activeConnectionId
      if (!connection || !connectionId) {
        throw new Error('No active connection')
      }

      // Build connection info with loginUrl for token refresh
      const connectionInfo = buildConnectionInfo(connection, connectionId)

      const queryState = useTabStore.getState().queries[tabId]
      const toolingMode = queryState?.toolingMode ?? false
      const batchSize = queryState?.batchSize ?? 200
      const sobjectName = queryState?.resultSObjectName

      if (!sobjectName) {
        throw new Error('No sObject name available for delete operation')
      }

      const resultState = useQueryResultStore.getState().byTabId[tabId]
      const data = { ...(resultState?.data ?? {}) }
      const selectedIds = [...(resultState?.selectedIds ?? [])]
      const filteredIds = [...(resultState?.filteredIds ?? [])]

      // Set DML pending
      useQueryResultStore.getState().setDmlPending(tabId, true)

      const idsToDeleteChunked = chunk(selectedIds, batchSize)
      const successfulIds: string[] = []
      const errors: string[] = []

      await Promise.all(
        idsToDeleteChunked.map(async (idsToDelete: string[]) => {
          const apiResult = await ipcRenderer.invoke('salesforce:delete', {
            ...connectionInfo,
            sobjectType: sobjectName,
            ids: idsToDelete,
            toolingMode,
          })

          if (!apiResult.success) {
            throw new Error(apiResult.error)
          }

          const results: any[] = apiResult.data

          // Process successful deletes
          results
            .filter((result) => result.success)
            .forEach((result) => {
              delete data[result.id]
              successfulIds.push(result.id)
            })

          // Collect errors
          results.forEach((result, index) => {
            if (result.success) return
            result.errors.forEach((error: any) => {
              errors.push(`${idsToDelete[index]}: ${error.message}`)
            })
          })
        })
      )

      // Update filteredIds to remove deleted records
      const nonDeletedIds = filteredIds.filter((id) => !successfulIds.includes(id))

      // Show errors if any
      if (errors.length > 0) {
        notification.error({
          message: 'Errors',
          style: { zIndex: 10000 },
          description: errors.join(' '),
          duration: 0,
        })
      }

      // Update the store
      useQueryResultStore.getState().setTabState(tabId, {
        filteredIds: nonDeletedIds,
        selectedIds: [],
        data: { ...data },
      })

      return { success: true, deletedCount: successfulIds.length, errorCount: errors.length }
    },
    onError: (error: Error, tabId) => {
      console.error('DML delete error:', error)
      useQueryResultStore.getState().setError(tabId, error.message)
    },
    onSettled: (data, error, tabId) => {
      useQueryResultStore.getState().setDmlPending(tabId, false)
    },
  })
}

/**
 * Hook for bulk updating fields across selected records
 * Used by the BulkUpdate component
 */
export function useBulkFieldUpdate() {
  return useMutation({
    mutationFn: async ({
      tabId,
      field,
      value,
    }: {
      tabId: string
      field: string
      value: any
    }) => {
      const resultState = useQueryResultStore.getState().byTabId[tabId]
      const data = { ...(resultState?.data ?? {}) }
      const selectedIds = resultState?.selectedIds ?? []

      // Update each selected record
      selectedIds.forEach((id) => {
        if (data[id]) {
          data[id] = {
            ...data[id],
            [field]: value,
            editFields: [...new Set([...(data[id].editFields || []), field])],
          }
        }
      })

      // Update the store
      useQueryResultStore.getState().setData(tabId, data)

      return { success: true, updatedCount: selectedIds.length }
    },
  })
}
