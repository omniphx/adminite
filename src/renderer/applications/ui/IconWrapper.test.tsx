import { screen, render } from '@testing-library/react';
import * as React from 'react';
import IconWrapper from './IconWrapper';

describe('<IconWrapper/>', () => {
  test('it should render', () => {
    render(<IconWrapper />);
  });

  test('it should wrap an icon', () => {
    const wrapper = render(<IconWrapper>Icon</IconWrapper>);
    screen.getByText('Icon');
  });
});
