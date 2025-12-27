import * as React from 'react';
import QueryResultsTable from './QueryResultsTable';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { stubInterface } from 'ts-sinon';
import { QueryResultState } from '../../../store/queryResults/types';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
jest.mock('../../../stores/useTabStore', () => ({
  useTabStore: (selector: any) => {
    const state = {
      queries: {
        test: {
          paginationConfig: { current: 1, pageSize: 25 },
          parsedQuery: null,
          resultSObjectName: 'Opportunity',
        },
      },
    };
    return selector(state);
  },
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

const mockStore = configureMockStore();

const stubbedQueryResult = stubInterface<QueryResultState>();

// State without connectionState (now in Zustand), sobjectState (now in TanStack Query)
export const state = {
  queryResultsState: {
    byTabId: {
      test: {
        ...stubbedQueryResult,
        filteredIds: [],
        selectedIds: [],
        data: {}
      }
    }
  }
};

const defaultState = {
  ...state,
  queryResultsState: {
    byTabId: {
      test: {
        ...stubbedQueryResult,
        selectedIds: [],
        data: {
          '1': {
            key: '1',
            Name: 'Morty Smith',
            attributes: {
              type: 'Opportunity',
              url:
                '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
            },
            editFields: []
          },
          '2': {
            key: '2',
            Name: 'Rick Sanchez',
            attributes: {
              type: 'Opportunity',
              url:
                '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
            },
            editFields: []
          }
        },
        filteredIds: ['1', '2']
      }
    }
  }
};

describe('<QueryResultsTable/>', () => {
  it('should render', () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    );
  });

  it('should filter results', () => {
    const testState = {
      ...defaultState,
      queryResultsState: {
        byTabId: {
          test: {
            ...defaultState.queryResultsState.byTabId.test,
            filteredIds: ['2']
          }
        }
      }
    };
    const store = mockStore(testState);
    render(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    );

    screen.getByText('Rick Sanchez');
    expect(screen.queryByText('Morty Smith')).toBeNull();
  });

  it('should show parent record', () => {
    const newState = {
      ...state,
      queryResultsState: {
        byTabId: {
          test: {
            ...stubbedQueryResult,
            selectedIds: [],
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
                  url:
                    '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'
                }
              }
            },
            filteredIds: ['1']
          }
        }
      }
    };

    const store = mockStore(newState);
    render(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    );

    screen.getByText('Account.Name');
    screen.getByText('Account.ParentAccount.Name');
    screen.getByText('Morty Smith');
    screen.getByText('Jerry Smith');
  });

  it('cell should have allow editing', async () => {
    const store = mockStore(defaultState);
    render(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    );

    const mortyCell = screen.getByText('Morty Smith');
    expect(mortyCell).toHaveClass('table-cell');

    const editAction = mortyCell.querySelector('a');
    userEvent.click(editAction);

    const input = mortyCell.querySelector('input');
    userEvent.clear(input);
    userEvent.type(input, 'Evil Morty{enter}');

    const actions = store.getActions();
    expect(actions[0].type).toEqual('@@queryResult/ON_FIELD_CHANGE');
    expect(actions[0].payload.record.Name).toEqual('Evil Morty');
  });
});
