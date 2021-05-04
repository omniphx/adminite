import * as React from 'react'
import QueryEditor from './QueryEditor'
import { shallow } from 'enzyme'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
const mockStore: any = configureMockStore()

describe('<QueryEditor/>', () => {
  test('it should render', () => {
    const store = mockStore({});
    shallow(
      <Provider store={store}>
        <QueryEditor {...{ tabId: 'test' }} />
      </Provider>
    )
  })
})