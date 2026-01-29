# Coding Conventions

**Analysis Date:** 2024-01-29

## Naming Patterns

**Files:**
- PascalCase for components: `Button.tsx`
- kebab-case for pages: `new/page.tsx`
- snake_case for API routes: `upload/image/route.ts`
- camelCase for test files: `utils.test.ts`

**Functions:**
- camelCase for utility functions: `formatCurrency`, `formatDate`
- PascalCase for React component functions: `Button`
- PascalCase for type interfaces: `Worker`, `Project`

**Variables:**
- camelCase for regular variables: `supabase`, `validated`, `user`
- snake_case for SQL query results: `project_data`, `labor_logs`
- const for all variable declarations

**Types:**
- PascalCase for interfaces: `Expense`, `LaborLog`
- camelCase for type unions: `ExpenseCategory = "material" | "food" | "fuel" | "labor" | "other"`
- snake_case for enum values: `status: "full" | "half"`

## Code Style

**Formatting:**
- Prettier with ESLint (extends `next/core-web-vitals`)
- TypeScript with strict mode enabled
- 4-space indentation
- No trailing commas
- Semicolons at end of statements

**Linting:**
- ESLint configured with Next.js default rules
- No console.log statements in production code
- Limited console.error usage for logging errors

## Import Organization

**Order:**
1. External packages
2. Absolute imports from `@/`
3. Relative imports (minimal)

**Path Aliases:**
- `@/*` maps to `./src/*`
- Used consistently throughout the codebase

**Example Pattern:**
```typescript
import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
```

## Error Handling

**API Routes:**
```typescript
try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "인증되지 않았습니다" },
      { status: 401 }
    );
  }

  // ... business logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: "프로젝트 생성 중 오류가 발생했습니다" },
    { status: 500 }
  );
}
```

**Client Components:**
- Always wrap async operations in try/catch
- Use error boundaries for React components
- Display user-friendly error messages in Korean

## Logging

**Framework:** console.error for errors only

**Patterns:**
```typescript
// For API errors
console.error("Project fetch error:", projectError);

// For client errors
throw new Error("사용자 친화적인 메시지");
```

## Comments

**When to Comment:**
- Complex business logic
- Non-obvious API endpoints
- RLS policies
- Workarounds for known issues

**No JSDoc/TSDoc:**
- Not consistently used throughout the codebase
- Type definitions are self-explanatory

## Function Design

**Size:**
- Most functions under 50 lines
- Components under 200 lines
- API routes typically 50-100 lines

**Parameters:**
- Prefer named parameters with default values
- Use destructuring for object parameters
- Minimal parameters (3-4 max)

**Return Values:**
- Consistent return types: `NextResponse.json({ success: true, data })`
- Always include success status
- Handle edge cases explicitly

## Module Design

**Exports:**
- Named exports preferred over default exports
- Components always default export
- Utility functions named export

**No Barrel Files:**
- Not used in this codebase
- Imports are directly from specific files

## Type Safety

**Strict TypeScript:**
- Enabled with strict mode
- Always use type annotations
- Optional types for internal helpers
- Generic types for utilities

**Interface Pattern:**
```typescript
export interface Expense {
  id: string;
  project_id: string;
  amount: number;
  category: string;
  // ... other fields
}
```

## React Component Patterns

**Forward Ref:**
```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

## API Response Format

**Standard Response:**
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

---

*Convention analysis: 2024-01-29*