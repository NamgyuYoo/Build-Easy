# Labor Check Page - E2E Test Report

## Test Environment
- URL: http://localhost:3000
- Test Date: 2026-01-27
- Page: `/projects/{id}/labor/check`

## Code Analysis Summary

### Page Components
Based on analysis of `/src/app/(dashboard)/projects/[id]/labor/check/page.tsx`:

1. **Calendar Grid** - Shows all days in current month
2. **Daily Summary Card** - Shows cost breakdown for selected date
3. **Individual Worker Check-in Section** - Lists all workers with check-in buttons
4. **Bulk Check-in Buttons** - "전체 1공수" and "전체 0.5공수" buttons

### Key Functionality to Test

#### 1. Calendar Date Selection
**Location:** Lines 240-363
- Click on different dates
- Selected date should be highlighted (bg-blue-600)
- Calendar shows check count badges for each date
- Double-click on date triggers bulk check-in for that date

**Expected Behavior:**
- Clicking a date updates `selectedDate` state
- Calendar re-renders with new selection highlighted
- Worker list updates to show logs for selected date
- Daily summary updates for selected date

**Potential Issues:**
- Date formatting must match exactly ("yyyy-MM-dd")
- Timezone issues could cause date mismatch
- State updates might not trigger re-renders

#### 2. Individual Worker Check-in
**Location:** Lines 66-91 (handleCheckIn function)
- Click "1공수" or "0.5공수" button next to worker
- API call to POST /api/labor-logs
- UI should update to show checked-in status

**Expected Behavior:**
```typescript
POST /api/labor-logs
{
  project_id: string,
  worker_id: string,
  work_date: string, // "yyyy-MM-dd" format
  status: "full" | "half"
}
```

**Potential Issues:**
- No loading indicator feedback on individual buttons
- No toast notification on success
- If API fails silently, user doesn't know
- Race condition if clicking multiple buttons quickly

#### 3. Bulk Check-in All Workers
**Location:** Lines 114-156 (handleCheckInAll function)
- Click "전체 1공수" or "전체 0.5공수" button
- Makes parallel API calls for all unchecked workers
- Shows toast notification on completion

**Expected Behavior:**
- Only checks in workers not already checked in for that date
- Shows toast: "일괄 체크 완료"
- Updates UI with new check-ins

**Potential Issues:**
- No loading state on buttons during API calls
- If some API calls fail, partial success might occur
- No indication of which workers succeeded/failed
- Promise.all() waits for all, but errors are caught in try/catch

#### 4. Double-click on Calendar Date
**Location:** Lines 265-322 (handleDoubleClick function)
- Double-click a date to bulk check-in all workers for that date
- Only checks in workers not already checked in
- Shows toast with count

**Expected Behavior:**
- Bulk check-in for double-clicked date
- Selects that date after checking in
- Shows toast: "일괄 체크 완료 - N명을 1공수로 체크했습니다"

**Potential Issues:**
- Double-click might be hard to trigger on mobile
- No visual feedback during double-click
- If all workers already checked, shows different toast

#### 5. Daily Summary Display
**Location:** Lines 159-174 (getDailySummary function)
- Shows total cost, man-days for selected date
- Updates when date changes or check-ins occur

**Expected Behavior:**
- Calculates: fullCount, halfCount, totalManDays, totalCost
- Updates automatically when laborLogs state changes
- Shows: "당일 노무비", "1공수", "0.5공수", "총합 공수"

**Potential Issues:**
- Depends on workers being loaded (for wage calculation)
- If worker wage is missing, calculation uses 0
- No error handling if worker not found

#### 6. Worker List Display
**Location:** Lines 422-497
- Shows all workers or empty state
- Each worker shows name, daily wage, check-in buttons OR status + delete button

**Expected Behavior:**
- Loading state while fetching data
- Empty state if no workers registered
- For each worker:
  - If checked in: status badge + delete button
  - If not checked in: 0.5공수 + 1공수 buttons

**Potential Issues:**
- Loading state might not show clearly
- If many workers, list could be long
- No pagination or virtual scrolling

### API Endpoints Used

#### POST /api/labor-logs
**File:** `/src/app/api/labor-logs/route.ts`

**Behavior:**
- Creates new labor log OR updates existing if duplicate
- Validates project ownership
- Returns created/updated log

**Potential Issues:**
- If duplicate exists, updates status silently
- No indication to client if update vs create occurred
- Zod validation error messages in Korean

#### GET /api/projects/{id}/labor
**File:** `/src/app/api/projects/[id]/labor/route.ts` (need to check)

**Expected Behavior:**
- Returns all labor logs for project
- Used to refresh data after check-ins

#### DELETE /api/labor-logs/{id}
**File:** `/src/app/api/labor-logs/[id]/route.ts`

**Expected Behavior:**
- Deletes labor log
- Used by "삭제" button

### Data Flow

1. **Initial Load:**
   ```
   useEffect -> fetchData()
     -> GET /api/workers (all workers for user)
     -> GET /api/projects/{id}/labor (all logs for project)
   ```

2. **Check-in Flow:**
   ```
   handleCheckIn()
     -> POST /api/labor-logs
     -> GET /api/projects/{id}/labor (refresh)
     -> setLaborLogs() (update state)
   ```

3. **Date Change Flow:**
   ```
   onClick(date) -> setSelectedDate(date)
     -> Component re-renders
     -> getLogForDate() filters laborLogs for new date
     -> getDailySummary() recalculates
   ```

### Identified Potential Bugs

#### Bug 1: No Success Feedback on Individual Check-in
**Location:** Line 66-91
**Issue:** When checking in individual worker, no toast notification shown
**Expected:** Should show "체크 완료" toast
**Impact:** User doesn't know if check-in succeeded

#### Bug 2: Race Condition on Rapid Clicks
**Location:** Line 66-91
**Issue:** `saving` state is global, so clicking multiple worker buttons quickly causes issues
**Expected:** Each button should have its own loading state
**Impact:** User might click same button multiple times

#### Bug 3: Double-click Might Trigger Single Click Too
**Location:** Line 265-322
**Issue:** Double-click handler has `e.stopPropagation()` but might still trigger single click first
**Expected:** Should only trigger double-click action
**Impact:** Date selection changes AND bulk check-in happens

#### Bug 4: Missing Error Toast on Individual Check-in Failure
**Location:** Line 86-87
**Issue:** Error only logged to console, no user notification
**Expected:** Should show toast with error message
**Impact:** User doesn't know check-in failed

#### Bug 5: Daily Summary Shows 0 if Worker Not Found
**Location:** Line 168
**Issue:** `worker?.daily_wage || 0` - shows 0 if worker missing
**Expected:** Should handle missing worker gracefully
**Impact:** Incorrect cost calculation

#### Bug 6: Bulk Check-in Partial Success Handling
**Location:** Line 117-136
**Issue:** Promise.all() waits for all, but if some fail, still shows success toast
**Expected:** Should show how many succeeded vs failed
**Impact:** User thinks all checked in, but some might have failed

#### Bug 7: No Loading State During Data Refresh
**Location:** Line 82-84
**Issue:** After check-in, fetches new data but no loading indicator
**Expected:** Should show loading state while refreshing
**Impact:** UI might show stale data briefly

#### Bug 8: Date Format Inconsistency
**Location:** Line 75, 120, 130, 295
**Issue:** Using `format(date, "yyyy-MM-dd")` throughout
**Risk:** Timezone issues could cause off-by-one errors
**Expected:** Should use UTC or consistent timezone handling
**Impact:** Check-ins might be saved for wrong date

### Test Cases

#### TC1: Calendar Date Selection
**Steps:**
1. Load labor check page
2. Note currently selected date (highlighted blue)
3. Click on different date (e.g., day 10)
4. Verify selection moved to clicked date
5. Verify daily summary updated for new date
6. Verify worker list updated for new date

**Expected Result:** Date selection works, UI updates correctly

#### TC2: Individual Worker Check-in - 1공수
**Steps:**
1. Load labor check page
2. Select date with no check-ins
3. Find worker with "1공수" button visible
4. Click "1공수" button
5. Wait 2 seconds
6. Verify button changed to status badge
7. Verify "삭제" button appeared
8. Verify daily summary updated

**Expected Result:** Worker checked in, UI updates

#### TC3: Individual Worker Check-in - 0.5공수
**Steps:** Same as TC2 but click "0.5공수" button

**Expected Result:** Worker checked in as 0.5, UI updates

#### TC4: Bulk Check-in All Workers
**Steps:**
1. Load labor check page
2. Select date with no check-ins
3. Click "전체 1공수" button
4. Wait 3 seconds
5. Verify toast notification appeared
6. Verify all workers show "1공수" status
7. Verify daily summary updated

**Expected Result:** All workers checked in, notification shown

#### TC5: Double-click on Calendar Date
**Steps:**
1. Load labor check page
2. Find date with no check-ins (not day 1)
3. Double-click on that date
4. Wait 3 seconds
5. Verify toast notification appeared
6. Verify date is selected
7. Verify workers checked in for that date

**Expected Result:** Bulk check-in for double-clicked date

#### TC6: Remove Worker Check-in
**Steps:**
1. Load labor check page with existing check-ins
2. Find worker with "삭제" button
3. Click "삭제" button
4. Wait 2 seconds
5. Verify delete button gone
6. Verify check-in buttons reappeared
7. Verify daily summary updated

**Expected Result:** Check-in removed, UI updates

#### TC7: Month Navigation
**Steps:**
1. Note current month displayed
2. Click "→" button
3. Verify month changed to next month
4. Click "←" button
5. Verify month changed back

**Expected Result:** Month navigation works

#### TC8: Check Count Badges
**Steps:**
1. Check in some workers for a date
2. Go to different date
3. Go back to original date
4. Verify badge shows correct count

**Expected Result:** Badges accurately reflect check-in count

#### TC9: Daily Summary Calculation
**Steps:**
1. Check in 2 workers as 1공수
2. Check in 1 worker as 0.5공수
3. Verify summary shows:
   - 1공수: 2
   - 0.5공수: 1
   - 총합: 2.5공수
   - 당일 노무비: correct total

**Expected Result:** Summary calculations are correct

#### TC10: Error Handling - Network Failure
**Steps:**
1. Open DevTools Network tab
2. Throttle network to "Offline"
3. Try to check in worker
4. Verify error message shown

**Expected Result:** Graceful error handling with user feedback

### Testing Checklist

- [ ] Can login successfully
- [ ] Can navigate to labor check page
- [ ] Calendar displays correct month
- [ ] Can select different dates
- [ ] Selected date is highlighted
- [ ] Check count badges display correctly
- [ ] Worker list shows all workers
- [ ] Can check in individual worker (1공수)
- [ ] Can check in individual worker (0.5공수)
- [ ] UI updates after individual check-in
- [ ] Delete button appears after check-in
- [ ] Can delete check-in
- [ ] Bulk check-in works for all workers
- [ ] Bulk check-in shows toast notification
- [ ] Double-click on date works
- [ ] Daily summary updates after check-in
- [ ] Daily summary calculations are correct
- [ ] Month navigation works
- [ ] No console errors
- [ ] No network errors
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

### Manual Testing Instructions

To manually test the labor check page:

1. **Setup:**
   - Ensure dev server running: `npm run dev`
   - Open http://localhost:3000
   - Login or create account
   - Create a test project
   - Create 3-5 test workers with different daily wages

2. **Test Flow:**
   - Navigate to project labor check page
   - Go through each test case above
   - Take screenshots at each step
   - Note any errors or unexpected behavior
   - Check browser console for errors
   - Check Network tab for failed requests

3. **Edge Cases to Test:**
   - Check in on last day of month
   - Check in on first day of month
   - Check in all workers, then bulk check-in again
   - Check in worker, delete, check in again
   - Rapidly click check-in buttons
   - Switch dates while check-in is loading
   - Check in with no workers registered
   - Check in with many workers (10+)

4. **Data Validation:**
   - Verify check-ins saved to database correctly
   - Verify date format is correct
   - Verify status is "full" or "half"
   - Verify project_id and worker_id are correct

### Automated Test Implementation

For automated E2E tests, use Playwright with the following approach:

```typescript
// 1. Setup test data before tests
beforeAll(async () => {
  // Create test user
  // Create test project
  // Create test workers
});

// 2. Test each feature
test('calendar date selection', async ({ page }) => {
  // Navigate to labor check page
  // Click on date
  // Verify selection
});

test('individual worker check-in', async ({ page }) => {
  // Navigate to labor check page
  // Click check-in button
  // Verify UI update
  // Verify API call
});

// 3. Cleanup after tests
afterAll(async () => {
  // Delete test data
});
```

### Next Steps

1. Run manual testing following the test cases
2. Document all bugs found
3. Prioritize bugs by severity
4. Create fixes for identified bugs
5. Add automated tests for critical flows
6. Re-test after fixes
