// Deployment configuration for different modes and platforms

export interface DeploymentConfig {
  // Railway.app configurations
  railway: {
    testService: string;
    stagingService: string;
    productionService: string;
  };
  
  // Environment variables for each deployment
  environmentVariables: {
    test: Record<string, string>;
    staging: Record<string, string>;
    production: Record<string, string>;
  };
  
  // Database configurations
  database: {
    test: string;
    staging: string;
    production: string;
  };
}

export const deploymentConfig: DeploymentConfig = {
  railway: {
    testService: 'kiosk-test',
    stagingService: 'kiosk-staging', 
    productionService: 'kiosk-production'
  },
  
  environmentVariables: {
    test: {
      'NODE_ENV': 'test',
      'REACT_APP_ENVIRONMENT': 'test',
      'REACT_APP_API_URL': 'https://kiosk-test.railway.app',
      'REACT_APP_WS_URL': 'wss://kiosk-test.railway.app',
      'REACT_APP_PAYMENT_MODE': 'mock',
      'REACT_APP_ENABLE_MOCK_PAYMENTS': 'true',
      'REACT_APP_SHOW_DEBUG_INFO': 'true',
      'REACT_APP_LOG_LEVEL': 'debug'
    },
    
    staging: {
      'NODE_ENV': 'production',
      'REACT_APP_ENVIRONMENT': 'staging',
      'REACT_APP_API_URL': 'https://kiosk-staging.railway.app',
      'REACT_APP_WS_URL': 'wss://kiosk-staging.railway.app',
      'REACT_APP_PAYMENT_MODE': 'sandbox',
      'REACT_APP_ENABLE_MOCK_PAYMENTS': 'false',
      'REACT_APP_SHOW_DEBUG_INFO': 'false',
      'REACT_APP_LOG_LEVEL': 'info',
      'REACT_APP_ENABLE_ERROR_REPORTING': 'true'
    },
    
    production: {
      'NODE_ENV': 'production',
      'REACT_APP_ENVIRONMENT': 'production',
      'REACT_APP_API_URL': 'https://rpapp-bckend-production.up.railway.app',
      'REACT_APP_WS_URL': 'wss://rpapp-bckend-production.up.railway.app',
      'REACT_APP_PAYMENT_MODE': 'production',
      'REACT_APP_ENABLE_MOCK_PAYMENTS': 'false',
      'REACT_APP_SHOW_DEBUG_INFO': 'false',
      'REACT_APP_LOG_LEVEL': 'warn',
      'REACT_APP_ENABLE_ERROR_REPORTING': 'true'
    }
  },
  
  database: {
    test: 'postgresql://test_user:test_pass@localhost:5432/kiosk_test',
    staging: '${DATABASE_URL}', // Railway provides this
    production: '${DATABASE_URL}' // Railway provides this
  }
};

// Railway deployment configuration files
export const railwayConfigs = {
  test: {
    build: {
      builder: 'NIXPACKS'
    },
    deploy: {
      healthcheckPath: '/health',
      healthcheckTimeout: 300,
      restartPolicyType: 'ON_FAILURE'
    },
    services: [
      {
        name: 'kiosk-backend-test',
        source: './packages/backend',
        env: {
          ...deploymentConfig.environmentVariables.test,
          PORT: '3000',
          FIO_API_MODE: 'test'
        }
      },
      {
        name: 'kiosk-frontend-test',
        source: './packages/kiosk-app',
        buildCommand: 'npm run build',
        startCommand: 'npx serve -s dist -l 5173',
        env: deploymentConfig.environmentVariables.test
      },
      {
        name: 'admin-frontend-test',
        source: './packages/admin-app', 
        buildCommand: 'npm run build',
        startCommand: 'npx serve -s dist -l 5174',
        env: deploymentConfig.environmentVariables.test
      }
    ]
  },
  
  staging: {
    build: {
      builder: 'NIXPACKS'
    },
    deploy: {
      healthcheckPath: '/health',
      healthcheckTimeout: 300,
      restartPolicyType: 'ON_FAILURE'
    },
    services: [
      {
        name: 'kiosk-backend-staging',
        source: './packages/backend',
        env: {
          ...deploymentConfig.environmentVariables.staging,
          PORT: '3000'
        }
      },
      {
        name: 'kiosk-frontend-staging',
        source: './packages/kiosk-app',
        buildCommand: 'npm run build',
        startCommand: 'npx serve -s dist -l 5173',
        env: deploymentConfig.environmentVariables.staging
      },
      {
        name: 'admin-frontend-staging',
        source: './packages/admin-app',
        buildCommand: 'npm run build', 
        startCommand: 'npx serve -s dist -l 5174',
        env: deploymentConfig.environmentVariables.staging
      }
    ]
  },
  
  production: {
    build: {
      builder: 'NIXPACKS'
    },
    deploy: {
      healthcheckPath: '/health',
      healthcheckTimeout: 300,
      restartPolicyType: 'ON_FAILURE'
    },
    services: [
      {
        name: 'kiosk-backend-prod',
        source: './packages/backend',
        env: {
          ...deploymentConfig.environmentVariables.production,
          PORT: '3015'
        }
      },
      {
        name: 'kiosk-frontend-prod',
        source: './packages/kiosk-app',
        buildCommand: 'npm run build',
        startCommand: 'npx serve -s dist -l 5173',
        env: deploymentConfig.environmentVariables.production
      },
      {
        name: 'admin-frontend-prod',
        source: './packages/admin-app',
        buildCommand: 'npm run build',
        startCommand: 'npx serve -s dist -l 5174', 
        env: deploymentConfig.environmentVariables.production
      }
    ]
  }
};
