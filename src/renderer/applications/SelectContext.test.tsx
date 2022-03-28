import * as React from 'react';
import SelectContext from './SelectContext';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react';

const mockStore: any = configureMockStore();

describe('<SelectContext/>', () => {
  test('it should render', () => {
    const store = mockStore({});
    render(
      <Provider store={store}>
        <SelectContext
          {...{ sobject: {}, sobjects: [], handleChange(event) {} }}
        />
      </Provider>
    );
  });
});
