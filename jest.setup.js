require('@testing-library/jest-dom/extend-expect');

// Mock electron module for renderer tests
jest.mock('electron', () => {
  // Import the mock from test-utils (uses dynamic require to avoid circular deps)
  const mockIpcRenderer = {
    invoke: jest.fn(() => Promise.reject(new Error('No mock handler registered'))),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    send: jest.fn(),
  };

  // Store reference globally so test-utils can access it
  global.__mockIpcRenderer = mockIpcRenderer;

  return {
    ipcRenderer: mockIpcRenderer,
    shell: {
      openExternal: jest.fn(),
    },
  };
});

// Workaround for: https://github.com/ant-design/ant-design/issues/21096
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock ResizeObserver for antd v6 components
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
