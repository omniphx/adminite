/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@rc-component/picker/locale/(.*)$': '@rc-component/picker/lib/locale/$1',
    '^@rc-component/picker/generate/(.*)$': '@rc-component/picker/lib/generate/$1'
  },
  // Transform ESM modules from node_modules that Jest can't parse natively
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns)/)'
  ],
  // Ensure ts-jest also transforms date-fns
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  }
};
