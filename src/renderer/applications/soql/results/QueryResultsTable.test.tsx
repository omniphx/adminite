import * as React from 'react';
import QueryResultsTable from './QueryResultsTable';

import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock useFieldUpdate hook
const mockUpdateField = jest.fn();

// Mock Zustand connection store
jest.mock('../../../stores/useConnectionStore', () => ({
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

// Mock Zustand tab store
const mockTabStoreState = {
  queries: {
    test: {
      paginationConfig: { current: 1, pageSize: 25 },
      parsedQuery: null,
      resultSObjectName: 'Opportunity',
    },
  },
};

jest.mock('../../../stores/useTabStore', () => ({
  useTabStore: Object.assign(
    (selector: any) => selector(mockTabStoreState),
    {
      getState: () => mockTabStoreState,
    }
  ),
}));

// Mock Zustand query result store (Phase 9)
const mockQueryResultStoreState = {
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
  setSelectedIds: jest.fn(),
};

jest.mock('../../../stores/useQueryResultStore', () => ({
  useQueryResultStore: (selector: any) => selector(mockQueryResultStoreState),
  selectTabData: (tabId: string) => (state: any) => state.byTabId[tabId]?.data ?? {},
  selectTabFilteredIds: (tabId: string) => (state: any) => state.byTabId[tabId]?.filteredIds ?? [],
  selectTabSelectedIds: (tabId: string) => (state: any) => state.byTabId[tabId]?.selectedIds ?? [],
}));

// Mock TanStack Query for sObject describe (Phase 6)
jest.mock('../../../queries/useSObjectQuery', () => ({
  useResultSObjectDescribe: () => ({
    data: {
      sobject: { name: 'Opportunity', fields: [] },
      fieldSchema: {
        Name: {
          name: 'Name',
          type: 'string',
          updateable: true
        }
      }
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock useFieldUpdate hook (Phase 9)
jest.mock('../../../queries/useQueryExecution', () => ({
  useFieldUpdate: () => ({
    updateField: mockUpdateField,
  }),
}));

describe('<QueryResultsTable/>', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockQueryResultStoreState.byTabId.test = {
      data: {},
      filteredIds: [],
      selectedIds: [],
      totalSize: 0,
      pending: false,
      dmlPending: false,
      errors: null,
    };
    mockQueryResultStoreState.setSelectedIds.mockClear();
    mockUpdateField.mockClear();
  });

  it('should render', () => {
    render(<QueryResultsTable tabId='test' />);
  });

  it('should filter results', () => {
    mockQueryResultStoreState.byTabId.test = {
      data: {
        '1': {
          key: '1',
          Name: 'Morty Smith',
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
          },
          editFields: []
        },
        '2': {
          key: '2',
          Name: 'Rick Sanchez',
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
          },
          editFields: []
        }
      },
      filteredIds: ['2'],
      selectedIds: [],
      totalSize: 2,
      pending: false,
      dmlPending: false,
      errors: null,
    };

    render(<QueryResultsTable tabId='test' />);

    screen.getByText('Rick Sanchez');
    expect(screen.queryByText('Morty Smith')).toBeNull();
  });

  it('should show parent record', () => {
    mockQueryResultStoreState.byTabId.test = {
      data: {
        '1': {
          key: '1',
          Account: {
            Name: 'Morty Smith',
            ParentAccount: {
              Name: 'Jerry Smith'
            }
          },
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
          },
          editFields: []
        }
      },
      filteredIds: ['1'],
      selectedIds: [],
      totalSize: 1,
      pending: false,
      dmlPending: false,
      errors: null,
    };

    render(<QueryResultsTable tabId='test' />);

    // These column names appear multiple times (header, sorter labels, etc.)
    // Just verify they appear at least once
    expect(screen.getAllByText('Account.Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Account.ParentAccount.Name').length).toBeGreaterThan(0);
    screen.getByText('Morty Smith');
    screen.getByText('Jerry Smith');
  });

  it('cell should have allow editing', async () => {
    mockQueryResultStoreState.byTabId.test = {
      data: {
        '1': {
          key: '1',
          Name: 'Morty Smith',
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
          },
          editFields: []
        },
        '2': {
          key: '2',
          Name: 'Rick Sanchez',
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
          },
          editFields: []
        }
      },
      filteredIds: ['1', '2'],
      selectedIds: [],
      totalSize: 2,
      pending: false,
      dmlPending: false,
      errors: null,
    };

    render(<QueryResultsTable tabId='test' />);

    const mortyCell = screen.getByText('Morty Smith');
    expect(mortyCell).toHaveClass('table-cell');

    const editAction = mortyCell.querySelector('a');
    await userEvent.click(editAction!);

    const input = mortyCell.querySelector('input');
    await userEvent.clear(input!);
    await userEvent.type(input!, 'Evil Morty{enter}');

    // Now uses Zustand updateField instead of Redux dispatch (Phase 9)
    await waitFor(() => {
      expect(mockUpdateField).toHaveBeenCalled();
    });
    const callArgs = mockUpdateField.mock.calls[0];
    expect(callArgs[0]).toBe('test'); // tabId
    expect(callArgs[1].Name).toBe('Evil Morty');
  });
});
