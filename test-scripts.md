
# Test Scripts to Add to package.json

Add these scripts to your package.json manually:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Running Tests

- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:run` - Run tests once and exit
- `npm run test:coverage` - Run tests with coverage report

## Test Structure

- `src/test/setup.ts` - Global test setup and mocks
- `src/test/utils.tsx` - Custom render utilities
- `src/**/__tests__/*.test.{ts,tsx}` - Individual test files
