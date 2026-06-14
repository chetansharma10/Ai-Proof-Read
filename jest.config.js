// jest.config.js
const config = {
 preset: 'ts-jest', 
  testEnvironment: 'node', 
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testMatch: ['**/*.spec.(js|jsx|ts|tsx)'],
  moduleNameMapper: {
    '^electron$': '<rootDir>/__mocks__/electron.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};

export default config;