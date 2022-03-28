import * as React from 'react';
import QueryEditor from './QueryEditor';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import { state } from './results/QueryResultsTable.test';
const mockStore: any = configureMockStore();

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
