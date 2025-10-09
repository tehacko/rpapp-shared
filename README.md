# @pi-kiosk/shared

Shared components, utilities, and types for the Pi Kiosk system.

## Installation

```bash
npm install @pi-kiosk/shared
```

## Usage

### Components

```tsx
import { ErrorDisplay, LoadingSpinner } from '@pi-kiosk/shared';

function MyComponent() {
  return (
    <div>
      <LoadingSpinner />
      <ErrorDisplay error={new Error('Something went wrong')} />
    </div>
  );
}
```

### Types

```tsx
import { Product, ApiResponse, KioskStatus } from '@pi-kiosk/shared';

const product: Product = {
  id: 1,
  name: 'Coffee',
  price: 25.0,
  description: 'Fresh coffee',
  image: '☕',
  quantityInStock: 10,
  clickedOn: 0,
  numberOfPurchases: 0,
};
```

### Hooks

```tsx
import { useApi, useErrorHandler } from '@pi-kiosk/shared';

function MyComponent() {
  const api = useApi();
  const { handleError } = useErrorHandler();

  // Use the hooks...
}
```

### Utilities

```tsx
import { formatPrice, validateEmail } from '@pi-kiosk/shared';

const price = formatPrice(25.5); // "25,50 Kč"
const isValid = validateEmail('user@example.com'); // true
```

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
