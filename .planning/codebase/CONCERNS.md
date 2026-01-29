# Codebase Concerns

**Analysis Date:** 2026-01-29

## Tech Debt

### Large Component Files
**Labor Check Page Complexity:**
- File: `src/app/(dashboard)/projects/[id]/labor/check/page.tsx`
- Issue: 631 lines - too large for maintainability
- Impact: Hard to navigate, test, and modify
- Fix approach: Extract smaller components (WorkerCalendar, DailySummary, WorkerActions)

### Upload Route Security
**File: `src/app/api/upload/image/route.ts`**
- Issue: Basic file type validation only
- Impact: Potential upload of malicious files
- Fix approach: Add virus scanning, file content validation, quarantine system

## Security Considerations

### Environment Variable Exposure
**Files: Multiple API routes**
- Issue: Using `!` assertion for missing env vars without fallbacks
- Risk: Runtime crashes if not configured
- Current mitigation: Basic checks in routes
- Recommendations: Use `.env.example` validation, graceful degradation

### Input Validation Gaps
**OCR Route:**
- File: `src/app/api/ocr/receipt/route.ts`
- Risk: No image size validation before processing
- Impact: Large files could cause server timeout/cost issues
- Recommendation: Add max dimensions/bytes before OpenAI API call

### API Response Structure
**Multiple routes**
- Risk: Inconsistent error formats
- Current: Some routes return `error`, others return `{ success, data/error }`
- Recommendation: Standardize all API responses to follow `{ success, data?, error?, meta? }`

## Performance Bottlenecks

### Large File Components
**Files over 400 lines:**
- `src/app/(dashboard)/projects/[id]/labor/check/page.tsx` (631 lines)
- `src/app/(dashboard)/expenses/new/page.tsx` (462 lines)
- `src/app/(dashboard)/projects/[id]/expenses/page.tsx` (416 lines)
- Impact: Slow initial load, large JavaScript bundles
- Improvement path: Code splitting, lazy loading, component extraction

### Image Processing
**OCR Route:**
- Issue: No caching for duplicate image processing
- Impact: Multiple API calls for same image = wasted credits
- Improvement path: Add image hash caching, store results in DB

## Fragile Areas

### Hardcoded Magic Numbers
**Upload Route:**
- File: `src/app/api/upload/image/route.ts`
- Issue: `10 * 1024 * 1024` (10MB) hardcoded
- Fragile: Configuration changes require code updates
- Safe modification: Extract to constants/config file

### Date Parsing Logic
**Multiple components**
- Issue: `date-fns` v3 usage with manual string formatting
- Risk: Date parsing errors from unexpected formats
- Safe modification: Use `zod` for date validation, standardize formats

## Missing Critical Features

### Error Handling
**API Routes:**
- Issue: Generic catch blocks lose specific error information
- Blocks: Proper error logging and monitoring
- Gap: No structured error codes or retry mechanisms

### Rate Limiting
**All API routes:**
- Issue: No protection against abuse
- Risk: DDoS, API cost overruns (OpenAI)
- Gap: Missing rate limiting middleware

### Data Validation
**Some API routes:**
- Issue: Mixed validation approaches (some use zod, others don't)
- Risk: Invalid data could pass through
- Gap: No centralized validation schema

## Test Coverage Gaps

**Missing test types:**
- Integration tests for API routes
- E2E tests for critical user flows
- Component testing for complex interactions
- Database RLS policy testing

**Specific untested areas:**
- File upload flow
- OCR image processing
- Worker check-in/out system
- Project budget calculations

---

*Concerns audit: 2026-01-29*