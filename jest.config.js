/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@rc-component/picker/locale/(.*)$': '@rc-component/picker/lib/locale/$1',
    '^@rc-component/picker/generate/(.*)$': '@rc-component/picker/lib/generate/$1'
  }
};
