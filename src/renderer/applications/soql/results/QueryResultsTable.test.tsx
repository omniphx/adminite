import * as React from 'react';
import QueryResultsTable from './QueryResultsTable';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
const mockStore = configureMockStore<ApplicationState>();

import { stubInterface } from 'ts-sinon';
import { ApplicationState } from '../../../store/index';
import { QueryResultState } from '../../../store/queryResults/types';
import { ConnectionState } from '../../../store/connection/types';
import { QueryState } from '../../../store/queries/types';
import { SObjectState } from '../../../store/sobject/types';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const stubbedState: ApplicationState = stubInterface<ApplicationState>();
const stubbedConnectionState: ConnectionState = stubInterface<
  ConnectionState
>();
const stubbedQueryState: QueryState = stubInterface<QueryState>();
const stubbedResultSobjectsState: SObjectState = stubInterface<SObjectState>();
const stubbedQueryResult = stubInterface<QueryResultState>();

export const state: ApplicationState = {
  ...stubbedState,
  connectionState: {
    ...stubbedConnectionState
  },
  queriesState: {
    byTabId: {
      test: stubbedQueryState
    }
  },
  resultSobjectsState: {
    byTabId: {
      test: {
        ...stubbedResultSobjectsState,
        fieldSchema: {
          Name: {
            name: 'Name',
            type: 'string',
            updateable: true
          }
        }
      }
    }
  },
  queryResultsState: {
    byTabId: {
      test: {
        ...stubbedQueryResult,
        filteredIds: []
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
    const state = {
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
    const store = mockStore(state);
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
