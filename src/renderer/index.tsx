import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

import store from './store';
import App from './App';
import './styles/styles.less';
import ErrorBoundary from './ErrorBoundary';

const rootElement = document.getElementById('app');

ReactDOM.render(
  <ErrorBoundary>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </Provider>
  </ErrorBoundary>,
  rootElement
);
