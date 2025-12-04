// Jest config for shared package
module.exports = {
  displayName: 'pi-kiosk-shared',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  rootDir: '.',
  
  // Run tests from source files, not dist
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}'
  ],
  
  // Ignore dist directory (tests should be in src/)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Allow importing from dist for testing compiled output
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}'
  ],
  
  // Transform both TypeScript and JavaScript (for dist imports)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      },
      useESM: true
    }],
    '^.+\\.js$': ['ts-jest', {
      useESM: true
    }]
  },
  
  // Don't ignore dist for transformation (needed for importing from dist)
  transformIgnorePatterns: [
    'node_modules/(?!(pi-kiosk-shared)/)'
  ],
  
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};

