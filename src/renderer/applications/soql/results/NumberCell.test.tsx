import React from 'react';

import { render, screen } from '@testing-library/react';

import NumberCell from './NumberCell';
import { Field as DescribeField, UserInfo } from 'jsforce';

import { stubInterface } from 'ts-sinon';
const fieldSchema = stubInterface<DescribeField>();
const userInfo = stubInterface<UserInfo>();
userInfo[`userLocale`] = 'us_EN';

// Mock Zustand connection store
jest.mock('../../../stores/useConnectionStore', () => ({
  useConnectionStore: (selector: any) => {
    const state = {
      activeConnection: {
        userInfo: {
          userLocale: 'us_EN',
          orgDefaultCurrencyLocale: 'us_EN',
          orgDefaultCurrencyIsoCode: 'USD',
        },
      },
    };
    return selector(state);
  },
}));

describe('<NumberCell/>', () => {
  it('should render', () => {
    render(
      <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
    );
  });

  it('should render zero', () => {
    render(
      <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
    );
    screen.getByText('0');
  });

  it('should render percent correctly', () => {
    fieldSchema.type = 'percent';
    fieldSchema.scale = 3;
    render(
      <NumberCell
        {...{ tabId: 'test', value: 0.199444, record: {}, fieldSchema }}
      />
    );
    screen.getByText(/0\.199%/);
  });
  it('should not treat zeros as nulls', () => {
    fieldSchema.type = 'percent';
    fieldSchema.scale = 2;
    render(
      <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
    );
    screen.getByText(/0\.00%/);
  });
});
