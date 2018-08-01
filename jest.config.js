module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
  },
  testMatch: [
    '**/tests/**/*.spec.(ts|js)'
  ],
  testEnvironment: 'node'
};
