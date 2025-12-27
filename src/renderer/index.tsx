import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { queryClient } from './queries/queryClient';
import App from './App';
import './styles/styles.less';
import ErrorBoundary from './ErrorBoundary';

const rootElement = document.getElementById('app');
const root = createRoot(rootElement!);

root.render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ErrorBoundary>
);
