import * as React from 'react';
import SelectContext from './SelectContext';

import { render } from '@testing-library/react';

describe('<SelectContext/>', () => {
  test('it should render', () => {
    render(<SelectContext {...{ sobject: {}, sobjects: [], handleChange(event) {} }} />);
  });
});
