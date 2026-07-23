// Jest config for shared package
module.exports = {
  displayName: 'pi-kiosk-shared',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',

  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
  ],

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
  ],

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          // Keep library build on NodeNext; tests transpile to CJS for Jest runtime.
          module: 'CommonJS',
          moduleResolution: 'Node10',
        },
        useESM: false,
      },
    ],
  },

  transformIgnorePatterns: ['node_modules/(?!(pi-kiosk-shared)/)'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Gap closure: global/checkout end-state where green; tenant-entitlements measured−2pp; payment/crossTab plan targets
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './src/payment/': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    './src/checkout/': {
      statements: 75,
      branches: 55,
      functions: 75,
      lines: 75,
    },
    './src/crossTab/': {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './src/tenant-entitlements/': {
      statements: 91,
      branches: 81,
      functions: 93,
      lines: 91,
    },
  },
};
