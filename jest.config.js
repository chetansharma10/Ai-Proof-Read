// jest.config.js
const config = {
  preset: 'ts-jest', 
  testEnvironment: 'node', 
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.spec.(ts|tsx)'],
  moduleNameMapper: {
    '^electron$': '<rootDir>/__mocks__/electron.js',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest', 
      { 
        useESM: true,
        tsconfig: 'tsconfig.test.json' 
      }
    ],
  },
};

export default config;