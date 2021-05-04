import * as React from 'react'
import { shallow, mount } from 'enzyme'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import NumberCell from './NumberCell'
import { Field as DescribeField, UserInfo } from 'jsforce'
const mockStore: any = configureMockStore()

import { stubInterface } from 'ts-sinon'
const fieldSchema = stubInterface<DescribeField>()
const userInfo = stubInterface<UserInfo>()
userInfo[`userLocale`] = 'us_EN'

const store = mockStore({
  connectionState: {
    userInfo
  }
})

describe('<NumberCell/>', () => {
  it('should render', () => {
    const store = mockStore({})
    shallow(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
      </Provider>
    )
  })

  it('should render zero', () => {
    const wrapper = mount(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
      </Provider>
    )
    expect(wrapper.text()).toContain('0')
  })

  it('should render percent correctly', () => {
    fieldSchema.type = 'percent'
    fieldSchema.scale = 3
    const wrapper = mount(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: .199444, record: {}, fieldSchema }} />
      </Provider>
    )
    expect(wrapper.text()).toMatch(/0\.199%/)
  })

  it('should not treat zeros as nulls', () => {
    fieldSchema.type = 'percent'
    fieldSchema.scale = 2
    const wrapper = mount(
      <Provider store={store}>
        <NumberCell {...{ tabId: 'test', value: 0, record: {}, fieldSchema }} />
      </Provider>
    )
    expect(wrapper.text()).toMatch(/0\.00%/)
  })
})