import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import store from './store';
import App from './App';
import './styles/styles.less';
import ErrorBoundary from './ErrorBoundary';

const rootElement = document.getElementById('app');
const root = createRoot(rootElement!);

root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </Provider>
  </ErrorBoundary>
);
