import * as React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Type for IPC mock handlers
type IpcHandler = (channel: string, ...args: unknown[]) => unknown;

// Global storage for IPC mock handlers
const ipcHandlers: Map<string, IpcHandler> = new Map();

// Extend global to include the mock ipcRenderer from jest.setup.js
declare global {
  var __mockIpcRenderer: {
    invoke: jest.Mock;
    on: jest.Mock;
    once: jest.Mock;
    removeListener: jest.Mock;
    removeAllListeners: jest.Mock;
    send: jest.Mock;
  };
}

/**
 * Get the mock ipcRenderer instance.
 * This is set up in jest.setup.js and shared across all tests.
 */
export function getMockIpcRenderer() {
  return global.__mockIpcRenderer;
}

/**
 * Register a mock handler for an IPC channel.
 * The handler receives the channel name and args, and should return the response.
 *
 * @example
 * mockIpcHandler('salesforce:query', (channel, params) => ({
 *   success: true,
 *   data: { records: [], totalSize: 0, done: true }
 * }));
 */
export function mockIpcHandler(channel: string, handler: IpcHandler): void {
  ipcHandlers.set(channel, handler);

  // Update the global mock to use our handler map
  const mockIpc = getMockIpcRenderer();
  mockIpc.invoke.mockImplementation((ch: string, ...args: unknown[]) => {
    const h = ipcHandlers.get(ch);
    if (h) {
      return Promise.resolve(h(ch, ...args));
    }
    return Promise.reject(new Error(`No mock handler for IPC channel: ${ch}`));
  });
}

/**
 * Clear a specific IPC handler.
 */
export function clearIpcHandler(channel: string): void {
  ipcHandlers.delete(channel);
}

/**
 * Clear all IPC handlers.
 * Call this in beforeEach/afterEach to reset mocks between tests.
 */
export function clearAllIpcHandlers(): void {
  ipcHandlers.clear();
  const mockIpc = getMockIpcRenderer();
  mockIpc.invoke.mockReset();
  mockIpc.invoke.mockImplementation(() => Promise.reject(new Error('No mock handler registered')));
}

/**
 * Creates a new QueryClient configured for testing.
 * - No retries on failure
 * - No caching (gcTime: 0)
 * - Errors are not logged to console
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface TestProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * Test wrapper component that provides QueryClientProvider.
 * A new QueryClient is created for each test unless one is provided.
 */
export function TestProviders({ children, queryClient }: TestProviderProps): React.ReactElement {
  const client = queryClient ?? createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

interface RenderWithTestProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Custom render function that wraps components in test providers.
 * Use this instead of @testing-library/react's render for components that use TanStack Query.
 *
 * @example
 * Basic usage
 * const { getByText } = renderWithTestProviders(<MyComponent />);
 *
 * @example
 * With IPC mocking
 * beforeEach(() => {
 *   clearAllIpcHandlers();
 *   mockIpcHandler('salesforce:query', () => ({
 *     success: true,
 *     data: { records: [{ Id: '001xxx', Name: 'Test' }], totalSize: 1, done: true }
 *   }));
 * });
 *
 * test('displays query results', async () => {
 *   const { findByText } = renderWithTestProviders(<QueryResults tabId="test" />);
 *   expect(await findByText('Test')).toBeInTheDocument();
 * });
 */
export function renderWithTestProviders(
  ui: React.ReactElement,
  options: RenderWithTestProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient,
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Export userEvent for convenience
export { default as userEvent } from '@testing-library/user-event';
