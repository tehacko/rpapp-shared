# Environment Configuration Guide

This document outlines the best practices for environment variable management across all services.

## Environment Variables

### Required for All Services

```bash
# Environment
NODE_ENV=development|production
REACT_APP_ENVIRONMENT=development|production

# Service URLs
REACT_APP_BACKEND_URL=<backend-url>
REACT_APP_KIOSK_URL=<kiosk-url>
REACT_APP_ADMIN_URL=<admin-url>

# API Configuration
REACT_APP_API_URL=<backend-url>
REACT_APP_WS_URL=<backend-ws-url>

# Payment Configuration
REACT_APP_PAYMENT_MODE=mock|sandbox|production
REACT_APP_ENABLE_MOCK_PAYMENTS=true|false
REACT_APP_PAYMENT_ACCOUNT=1234567890

# UI Configuration
REACT_APP_SHOW_DEBUG_INFO=true|false
REACT_APP_LOG_LEVEL=debug|info|warn|error
```

## Environment Files by Service

### Backend (.env files)

- `.env.development` - Local development
- `.env.production` - Production deployment
- `.env.test` - Testing environment

### Frontend Apps (.env files)

- `.env.development` - Local development
- `.env.production` - Production build
- `.env.local` - Local overrides (gitignored)

## Best Practices

1. **Centralized Configuration**: All environment variables are managed in the shared package
2. **Type Safety**: All configuration is typed with TypeScript
3. **Environment Detection**: Automatic detection of development vs production
4. **Fallback Values**: Sensible defaults for all configuration
5. **Service URLs**: Centralized service URL management
6. **Validation**: Runtime validation of environment variables
