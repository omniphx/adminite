import React from 'react';

import { render, screen } from '@testing-library/react';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import NumberCell from './NumberCell';
import { Field as DescribeField, UserInfo } from 'jsforce';
const mockStore = configureMockStore();

import { stubInterface } from 'ts-sinon';
const fieldSchema = stubInterface<DescribeField>();
const userInfo = stubInterface<UserInfo>();
userInfo[`userLocale`] = 'us_EN';

const store = mockStore({
  connectionState: {
    userInfo
  }
});

describe('<NumberCell/>', () => {
  it('should render', () => {
    render(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
      </Provider>
    );
  });

  it('should render zero', () => {
    render(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
      </Provider>
    );
    screen.getByText('0');
  });

  it('should render percent correctly', () => {
    fieldSchema.type = 'percent';
    fieldSchema.scale = 3;
    render(
      <Provider store={store}>
        <NumberCell
          {...{ tabId: 'test', value: 0.199444, record: {}, fieldSchema }}
        />
      </Provider>
    );
    screen.getByText(/0\.199%/);
  });
  it('should not treat zeros as nulls', () => {
    fieldSchema.type = 'percent';
    fieldSchema.scale = 2;
    render(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
      </Provider>
    );
    screen.getByText(/0\.00%/);
  });
});
