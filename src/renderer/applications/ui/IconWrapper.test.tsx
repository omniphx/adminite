import * as React from 'react'
import IconWrapper from './IconWrapper'
import { shallow } from 'enzyme'

describe('<IconWrapper/>', () => {
  test('it should render', () => {
    shallow(<IconWrapper/>)
  })

  test('it should wrap an icon', () => {
    const wrapper = shallow(<IconWrapper>Icon</IconWrapper>)
    expect(wrapper.contains('Icon')).toEqual(true)
  })
})