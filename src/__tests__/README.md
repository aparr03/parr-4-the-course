# Testing Strategy

This directory contains test files for our React application. We use Jest as our test runner and React Testing Library for component testing.

## Test Structure

The tests are organized into the following categories:

1. **Component Tests**: Testing React components in isolation
   - Example: `RecipeCard.test.tsx`

2. **Context Tests**: Testing React context providers and their functionality
   - Example: `AuthContext.test.tsx`

3. **Utility Tests**: Testing utility functions
   - Example: `slugify.test.ts`

4. **Test Utilities**: Common utilities for testing
   - Located in `utils/test-utils.tsx`
   - Provides helpers for rendering with providers, waiting for state updates, and mocking browser APIs

## Running Tests

You can run the tests using the following npm commands:

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Testing Approach

1. **Component Tests**: Focus on user interactions and rendered output, not implementation details
2. **Context Tests**: Verify that context providers correctly manage and distribute state
3. **Utility Tests**: Ensure utility functions produce correct outputs for various inputs

## Mocking Strategy

For external dependencies like Supabase, we use Jest's mocking capabilities in two ways:

1. **Direct Mocks**: Replace module imports with mock implementations
   ```javascript
   jest.mock('../lib/supabase', () => ({ 
     supabase: { /* mock methods */ } 
   }));
   ```

2. **Shared Mocks**: Reuse mock implementation across tests
   ```javascript
   // From __mocks__/supabase.ts
   import { mockUser, mockComments } from '../__mocks__/supabase';
   ```

## Handling Asynchronous Code

We use `act()` and `waitFor()` from React Testing Library to handle async operations:

```tsx
// Wrap render in act for async component initialization
await act(async () => {
  renderWithProviders(<MyComponent />);
});

// Wait for specific UI elements to appear after async operations
await waitFor(() => {
  expect(screen.getByText('Loaded Content')).toBeInTheDocument();
});
```

## Test Examples

### Component Test Example

```tsx
test('renders recipe title', () => {
  render(<RecipeCard recipe={mockRecipe} />, { wrapper: BrowserRouter });
  expect(screen.getByText('Test Recipe')).toBeInTheDocument();
});
```

### Context Test Example

```tsx
test('shows sign in button when not authenticated', async () => {
  render(<AuthProvider><TestComponent /></AuthProvider>);
  await waitFor(() => {
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });
});
```

### Utility Test Example

```tsx
test('converts basic text to slug', () => {
  expect(createSlug('Hello World')).toBe('hello-world');
});
```

## Adding New Tests

When adding new features or components, follow these steps:

1. Create a new test file in this directory
2. Import the component or function to be tested
3. Use the test utilities from `./utils/test-utils.tsx` for consistent testing
4. Write tests that cover the main functionality
5. Ensure tests are independent of each other
6. Focus on behavior, not implementation details 