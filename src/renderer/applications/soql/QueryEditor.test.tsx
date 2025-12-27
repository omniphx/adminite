import * as React from 'react';
import QueryEditor from './QueryEditor';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react';

const mockStore: any = configureMockStore();

// Mock Zustand stores and TanStack Query hooks needed by QueryEditor components
jest.mock('../../stores/useConnectionStore', () => ({
  useConnectionStore: (selector: any) => {
    const state = {
      connections: {},
      connectionOrder: [],
      activeConnectionId: 'test-connection',
      activeConnection: {
        pending: false,
        error: undefined,
        connection: undefined,
        userInfo: undefined,
      },
    };
    return selector(state);
  },
  getActiveConnection: () => ({
    id: 'test-connection',
    instanceUrl: 'https://test.salesforce.com',
  }),
}));

jest.mock('../../stores/useTabStore', () => ({
  useTabStore: Object.assign(
    (selector: any) => {
      const state = {
        queries: {
          test: {
            query: { body: 'SELECT Id FROM Account' },
            parsedQuery: null,
            searchFilter: '',
            toolingMode: false,
            batchSize: 200,
            includeDeleted: false,
            paginationConfig: { current: 1, pageSize: 25 },
            resultSObjectName: 'Account',
            querySObjectName: 'Account',
          },
        },
      };
      return selector(state);
    },
    {
      getState: () => ({
        queries: {
          test: {
            query: { body: 'SELECT Id FROM Account' },
            parsedQuery: null,
            searchFilter: '',
            toolingMode: false,
            batchSize: 200,
            includeDeleted: false,
            paginationConfig: { current: 1, pageSize: 25 },
            resultSObjectName: 'Account',
            querySObjectName: 'Account',
          },
        },
      }),
    }
  ),
}));

jest.mock('../../stores/useQueryResultStore', () => ({
  useQueryResultStore: (selector: any) => {
    const state = {
      byTabId: {
        test: {
          data: {},
          filteredIds: [],
          selectedIds: [],
          totalSize: 0,
          pending: false,
          dmlPending: false,
          errors: null,
        }
      },
    };
    return selector(state);
  },
  selectTabData: () => () => ({}),
  selectTabFilteredIds: () => () => [],
  selectTabSelectedIds: () => () => [],
  selectTabPending: () => () => false,
  selectTabDmlPending: () => () => false,
  selectTabErrors: () => () => null,
  selectTabTotalSize: () => () => 0,
}));

jest.mock('../../stores/useQueryHistoryStore', () => ({
  useQueryHistoryStore: (selector: any) => {
    const state = {
      queries: [],
      addQuery: jest.fn(),
    };
    return selector(state);
  },
}));

jest.mock('../../queries/useSObjectQuery', () => ({
  useResultSObjectDescribe: () => ({
    data: { sobject: null, fieldSchema: {} },
    isLoading: false,
    error: null,
  }),
  useQuerySObjectDescribe: () => ({
    data: { sobject: null, fieldSchema: {} },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../queries/useSchemaQuery', () => ({
  useSObjectList: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useGlobalDescribeQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../queries/useQueryExecution', () => ({
  useQueryExecution: () => ({ mutate: jest.fn() }),
  useQueryCancel: () => ({ cancel: jest.fn() }),
  useFieldUpdate: () => ({ updateField: jest.fn() }),
}));

jest.mock('../../queries/useDmlMutations', () => ({
  useDmlUpdate: () => ({ mutate: jest.fn() }),
  useDmlDelete: () => ({ mutate: jest.fn() }),
}));

// Redux store state for remaining Redux-dependent components
const state = {
  paginationState: {},
  queryHistoryState: { queries: [] },
  queryTabsState: {
    allIds: ['test'],
    byId: { test: { title: 'test' } },
    activeId: 'test',
  },
};

describe('<QueryEditor/>', () => {
  test('it should render', () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <QueryEditor {...{ tabId: 'test' }} />
      </Provider>
    );
  });
});
