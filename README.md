# @pi-kiosk/shared

Shared types, API contracts, and error classes for the Pi Kiosk system.

This package contains only **contracts** - types, API endpoints, and error classes that are shared between the backend and frontend applications. All implementation details (components, hooks, utilities, config) have been moved to individual apps.

## Installation

```bash
npm install pi-kiosk-shared
```

## Usage

### Types

```tsx
import type { Product, ApiResponse, KioskStatus, TransactionStatus } from 'pi-kiosk-shared';

const product: Product = {
  id: 1,
  name: 'Coffee',
  price: 25.0,
  description: 'Fresh coffee',
  image: '☕',
  clickedOn: 0,
  numberOfPurchases: 0,
};
```

### API Client

```tsx
import { APIClient, createAPIClient, API_ENDPOINTS } from 'pi-kiosk-shared';

const apiClient = createAPIClient('http://localhost:3015');
const products = await apiClient.get(API_ENDPOINTS.PRODUCTS);
```

### Error Classes

```tsx
import { NetworkError, ValidationError, AppError, getErrorMessage } from 'pi-kiosk-shared';

try {
  // ... some operation
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', getErrorMessage(error));
  }
}
```

## What's NOT in this package

- **Components**: Moved to `rpapp-kiosk/src/shared/components` and `admin-app/src/shared/components`
- **Hooks**: Moved to `rpapp-kiosk/src/shared/hooks` and `admin-app/src/shared/hooks`
- **Utilities**: Moved to `rpapp-kiosk/src/shared/utils` and `admin-app/src/shared/utils`
- **Validation**: Moved to `admin-app/src/shared/validation`
- **Config**: Moved to `rpapp-kiosk/src/config` and `admin-app/src/config`

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## License

MIT
