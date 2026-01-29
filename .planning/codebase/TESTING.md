# Testing Patterns

**Analysis Date:** 2024-01-29

## Test Framework

**Runner:**
- Vitest v4.0.18
- Config: `vitest.config.ts`
- Test environment: jsdom
- Setup file: `src/test/setup.ts`

**Assertion Library:**
- Testing Library DOM matchers
- Vitest built-in assertions
- Custom matchers for Korean UI elements

**Run Commands:**
```bash
npm run test              # Run all tests
npm run test:ui          # Run with UI
npm run test:coverage     # Run with coverage
```

## Test File Organization

**Location:**
- Tests co-located with source files in `__tests__` directories
- API routes: `src/app/api/**/__tests__/**`
- Components: `src/components/**/__tests__/**`
- Utilities: `src/lib/**/__tests__/**`

**Naming:**
- `*.test.{ts,tsx}` for unit tests
- `*.spec.{ts,tsx}` for integration tests
- Match source file names with `.test.` prefix

**Structure:**
```
src/
├── lib/
│   └── __tests__/
│       └── utils.test.ts
├── components/
│   └── ui/
│       └── __tests__/
│           └── button.test.tsx
├── hooks/
│   └── __tests__/
│       └── use-toast.test.ts
└── test/
    ├── setup.ts          # Global test setup
    └── vite.d.ts         # Type declarations
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component Name', () => {
  beforeEach(() => {
    // Setup before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.useRealTimers();
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

**Patterns:**
- Arrange-Act-Assert pattern
- One test per logical assertion
- Descriptive test names
- Consistent test groupings

## Mocking

**Framework:** Vitest mocking with `vi.fn()`

**Patterns:**
```typescript
// Mock function
const handleClick = vi.fn();

// Mock async operation
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } })
  },
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockResolvedValue({ data: [], error: null })
};

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    // ... other methods
  }),
}));
```

**What to Mock:**
- Supabase API calls
- Next.js navigation
- File system operations
- External APIs (OpenAI, etc.)

**What NOT to Mock:**
- React DOM components
- Browser APIs (when using jsdom)
- Built-in JavaScript functions

## Fixtures and Factories

**Test Data:**
```typescript
// Mock project data
const mockProject = {
  id: '123',
  name: 'Test Project',
  budget: 1000000,
  status: 'active' as const,
  user_id: 'user123',
  created_at: '2024-01-01'
};

// Mock worker data
const mockWorker = {
  id: 'worker123',
  name: '김철수',
  daily_wage: 150000,
  user_id: 'user123'
};
```

**Location:**
- No dedicated fixtures directory
- Mock data defined inline or in setup
- Consistent mock data across tests

## Coverage

**Requirements:** V8 coverage provider enabled

**View Coverage:**
```bash
npm run test:coverage
# Report saved to coverage/
```

**Configuration:**
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'src/test/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/types/**',
    'tests/e2e/',
  ],
}
```

**Excluded Files:**
- Test files themselves
- Type definitions
- Configuration files
- Setup and utility files

## Test Types

**Unit Tests:**
- Focus on individual functions
- Pure utility functions
- Component props and state
- Mock external dependencies

**Component Tests:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('should call onClick handler', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>Click me</Button>);

  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

**Integration Tests:**
- API routes with mocked dependencies
- Database interactions
- Authentication flows
- Form submissions

**E2E Tests:**
- Playwright configuration exists but tests minimal
- Located in `tests/e2e/`
- Not actively developed

## Common Patterns

**Async Testing:**
```typescript
test('should fetch data', async () => {
  vi.mocked(supabase.from).mockResolvedValue({
    select: vi.fn().mockResolvedValue({
      data: mockData,
      error: null
    })
  });

  const result = await fetchData();
  expect(result).toEqual(mockData);
});
```

**Error Testing:**
```typescript
test('should handle error', () => {
  vi.mocked(supabase.from).mockResolvedValue({
    select: vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Error' }
    })
  });

  await expect(fetchData()).rejects.toThrow('Error');
});
```

**Testing React Components:**
```typescript
test('should render with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});

test('should be disabled when prop is true', () => {
  render(<Button disabled>Disabled</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

## Test Isolation

**Cleanup Pattern:**
```typescript
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

**Mock Reset:**
- Always reset mocks after tests
- Use `vi.clearAllTimers()` for timer mocks
- Cleanup DOM with Testing Library's `cleanup()`

## Test Environment Setup

**Global Setup:**
```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock environment variables
global.process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};
```

## Playwright E2E Configuration

**Config File:** `playwright.config.ts`
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

---

*Testing analysis: 2024-01-29*