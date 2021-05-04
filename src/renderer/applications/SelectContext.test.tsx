import * as React from 'react'
import { shallow } from 'enzyme'
import SelectContext from './SelectContext'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
const mockStore: any = configureMockStore()

describe('<SelectContext/>', () => {
  test('it should render', () => {
    const store = mockStore({});
    shallow(
      <Provider store={store}>
        <SelectContext {...{ sobject: {}, sobjects: [], handleChange(event) { } }} />
      </Provider>
    )
  })
})