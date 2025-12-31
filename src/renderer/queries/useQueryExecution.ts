import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ipcRenderer } from 'electron';
import { useConnectionStore, getActiveConnection } from '../stores/useConnectionStore';
import { useQueryResultStore } from '../stores/useQueryResultStore';
import { useTabStore } from '../stores/useTabStore';
import { dataReducer, filterIds } from '../../helpers/utils';
import { queryKeys } from './queryKeys';
import { buildConnectionInfo } from './useConnectionQuery';

/**
 * Determines the appropriate query handler based on query type
 */
function getQueryHandler(
  includeDeleted: boolean,
  queryString: string
): 'search' | 'queryAll' | 'query' {
  if (queryString.toUpperCase().startsWith('FIND')) return 'search';
  if (includeDeleted) return 'queryAll';
  return 'query';
}

interface QueryExecutionParams {
  tabId: string;
  queryString: string;
  includeDeleted: boolean;
}

interface QueryMoreParams {
  tabId: string;
  nextRecordsUrl: string;
}

/**
 * Hook for executing SOQL/SOSL queries
 * Replaces the Redux saga query flow
 */
export function useQueryExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: QueryExecutionParams) => {
      const { tabId, queryString, includeDeleted } = params;

      // Get connection from Zustand
      const state = useConnectionStore.getState();
      const connection = getActiveConnection(state);
      const connectionId = state.activeConnectionId;
      if (!connection || !connectionId) {
        throw new Error('No active connection');
      }

      // Build connection info with loginUrl for token refresh
      const connectionInfo = buildConnectionInfo(connection, connectionId);

      // Get filter and tooling mode from Zustand
      const queryState = useTabStore.getState().queries[tabId];
      const filter = queryState?.searchFilter ?? '';
      const toolingMode = queryState?.toolingMode ?? false;

      // Set pending state
      useQueryResultStore.getState().setPending(tabId, true);

      const queryHandler = getQueryHandler(includeDeleted, queryString);

      // Execute the appropriate query type
      let apiResult;
      if (queryHandler === 'search') {
        apiResult = await ipcRenderer.invoke('salesforce:search', {
          ...connectionInfo,
          queryString,
        });
      } else if (queryHandler === 'queryAll') {
        apiResult = await ipcRenderer.invoke('salesforce:queryAll', {
          ...connectionInfo,
          queryString,
        });
      } else {
        apiResult = await ipcRenderer.invoke('salesforce:query', {
          ...connectionInfo,
          queryString,
          toolingMode,
        });
      }

      if (!apiResult.success) {
        throw new Error(apiResult.error);
      }

      const result = apiResult.data;
      const records = queryHandler === 'search' ? result.searchRecords : result.records;
      const data = dataReducer(records);
      const filteredIds = filterIds(data, filter);

      // Update store with initial results
      useQueryResultStore.getState().setQueryResult(tabId, {
        data,
        filteredIds,
        totalSize: result.totalSize ?? Object.keys(data).length,
      });

      // Handle pagination if more records exist
      if (result.hasOwnProperty('done') && !result.done && result.nextRecordsUrl) {
        await fetchRemainingRecords(
          tabId,
          result.nextRecordsUrl,
          filter,
          toolingMode,
          connectionInfo
        );
      }

      return result;
    },
    onError: (error: Error, params) => {
      console.error('Query execution error:', error);
      useQueryResultStore.getState().setError(params.tabId, error.message);
    },
    onSettled: (data, error, params) => {
      useQueryResultStore.getState().setPending(params.tabId, false);
    },
  });
}

/**
 * Recursively fetches remaining records using queryMore
 */
async function fetchRemainingRecords(
  tabId: string,
  nextRecordsUrl: string,
  filter: string,
  toolingMode: boolean,
  connectionInfo: ReturnType<typeof buildConnectionInfo>
): Promise<void> {
  const apiResult = await ipcRenderer.invoke('salesforce:queryMore', {
    ...connectionInfo,
    nextRecordsUrl,
    toolingMode,
  });

  if (!apiResult.success) {
    throw new Error(apiResult.error);
  }

  const result = apiResult.data;
  const data = dataReducer(result.records);
  const filteredIds = filterIds(data, filter);

  // Append to existing results
  useQueryResultStore.getState().appendQueryResult(tabId, {
    data,
    filteredIds,
  });

  // Continue fetching if more records exist
  if (!result.done && result.nextRecordsUrl) {
    await fetchRemainingRecords(tabId, result.nextRecordsUrl, filter, toolingMode, connectionInfo);
  }
}

/**
 * Hook for canceling a running query
 * Note: This requires maintaining an AbortController reference
 */
export function useQueryCancel() {
  const queryClient = useQueryClient();

  return {
    cancel: (tabId: string) => {
      // Cancel any in-flight queries for this tab
      queryClient.cancelQueries({
        queryKey: queryKeys.queryResults.byTab(
          useConnectionStore.getState().activeConnectionId ?? '',
          tabId
        ),
      });

      // Reset pending state
      useQueryResultStore.getState().setPending(tabId, false);
    },
  };
}

/**
 * Hook for updating a field value in a record
 * This replaces the ON_FIELD_CHANGE saga
 */
export function useFieldUpdate() {
  return {
    updateField: (tabId: string, record: any) => {
      const { getRecordId } = require('../../helpers/utils');
      const recordId = getRecordId(record);

      // Update the record in the store
      useQueryResultStore.getState().updateRecord(tabId, recordId, record);

      // Re-apply filter to update filteredIds
      const data = useQueryResultStore.getState().byTabId[tabId]?.data ?? {};
      const filter = useTabStore.getState().queries[tabId]?.searchFilter ?? '';
      const filteredIds = filterIds(data, filter);

      useQueryResultStore.getState().setFilteredIds(tabId, filteredIds);
    },
  };
}

/**
 * Helper hook to reapply filter when search filter changes
 */
export function useReapplyFilter() {
  return {
    reapplyFilter: (tabId: string, filter: string) => {
      const data = useQueryResultStore.getState().byTabId[tabId]?.data ?? {};
      const filteredIds = filterIds(data, filter);
      useQueryResultStore.getState().setFilteredIds(tabId, filteredIds);
    },
  };
}
