import * as React from 'react'
import { shallow, mount } from 'enzyme'
import QueryResultsTable from './QueryResultsTable';

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
const mockStore: any = configureMockStore()

import { stubInterface } from 'ts-sinon'
import { ApplicationState } from '../../../store/index';
import { QueryResultState } from '../../../store/queryResults/types';
import { ConnectionState } from '../../../store/connection/types';
import { QueryState } from '../../../store/queries/types';
import { SObjectState } from '../../../store/sobject/types';

const stubbedState: ApplicationState = stubInterface<ApplicationState>()
const stubbedConnectionState: ConnectionState = stubInterface<ConnectionState>()
const stubbedQueryState: QueryState = stubInterface<QueryState>()
const stubbedResultSobjectsState: SObjectState = stubInterface<SObjectState>()

const state: ApplicationState = {
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
      test: stubbedResultSobjectsState
    }
  }
}

describe('<QueryResultsTable/>', () => {

  it('should render', () => {
    const store = mockStore(state)
    shallow(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    )
  })

  it('should filter results', () => {
    const stubbedQueryResult = stubInterface<QueryResultState>()
    const newState = {
      ...state,
      queryResultsState: {
        byTabId: {
          test: {
            ...stubbedQueryResult,
            data: {
              '1': {
                key: '1',
                Name: 'Morty Smith',
                attributes: {type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'}
              },
              '2': {
                key: '2',
                Name: 'Rick Sanchez',
                attributes: {type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'}
              }
            },
            filteredIds: ['2']
          }
        }
      }
    }

    const store = mockStore(newState)
    const wrapper = mount(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    )

    expect(wrapper.text()).toContain('Rick Sanchez')
    expect(wrapper.text()).not.toContain('Morty Smith')
  })

  it('should show parent record', () => {
    const stubbedQueryResult = stubInterface<QueryResultState>()
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
                attributes: {type: 'Opportunity', url: '/services/data/v42.0/sobjects/Opportunity/0061N00000TbONAQA3'}
              }
            },
            filteredIds: ['1']
          }
        }
      }
    }

    const store = mockStore(newState)
    const wrapper = mount(
      <Provider store={store}>
        <QueryResultsTable {...{ tabId: 'test' }} />
      </Provider>
    )

    expect(wrapper.text()).toContain('Account.Name')
    expect(wrapper.text()).toContain('Account.ParentAccount.Name')
    expect(wrapper.text()).toContain('Morty Smith')
    expect(wrapper.text()).toContain('Jerry Smith')
  })
})