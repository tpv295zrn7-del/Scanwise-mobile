module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/*.test.js'],
  moduleNameMapper: {
    '^.+[.](png|jpg|jpeg|gif)$': '<rootDir>/test/fileMock.js'
  },
  collectCoverageFrom: ['src/**/*.js', '!src/redux/selectors/**/*.js'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  }
};
