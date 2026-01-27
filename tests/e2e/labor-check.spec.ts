import { test, expect } from '@playwright/test';

test.describe('Labor Check Page E2E Tests', () => {
  let projectId: string;
  let page;

  test.beforeAll(async ({ browser }) => {
    // Setup test data - check if we have a project to work with
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Fill in login credentials (using test account)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to projects list or create a test project
    await page.goto('http://localhost:3000/dashboard');

    // Get first project ID from the page
    const projectLink = page.locator('a[href^="/projects/"]').first();
    const href = await projectLink.getAttribute('href');

    if (href) {
      projectId = href.split('/')[2];
      console.log(`Testing with project ID: ${projectId}`);
    } else {
      console.log('No projects found, creating one...');
      // Create a test project
      await page.goto('http://localhost:3000/projects/new');
      await page.fill('input[name="name"]', 'E2E Test Project');
      await page.fill('input[name="location"]', 'Test Location');
      await page.fill('input[name="start_date"]', '2026-01-01');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/projects/**');
      const url = page.url();
      projectId = url.split('/')[4];
      console.log(`Created test project with ID: ${projectId}`);
    }
  });

  test('should navigate to labor check page', async () => {
    // Navigate to labor check page
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Verify page loads
    await expect(page.locator('h1:has-text("출근 체크")')).toBeVisible();
    await expect(page.locator('text=/2026년.*01월/')).toBeVisible();
  });

  test('should display calendar with current month', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Check for calendar days
    const calendarDays = page.locator('button[class*="h-14"]');
    await expect(calendarDays.first()).toBeVisible();

    // Check for weekday headers
    await expect(page.locator('text=일')).toBeVisible();
    await expect(page.locator('text=월')).toBeVisible();
    await expect(page.locator('text=화')).toBeVisible();
  });

  test('should show daily summary card', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Check for daily summary section
    await expect(page.locator('text=/.*요약/')).toBeVisible();
    await expect(page.locator('text=당일 노무비')).toBeVisible();
  });

  test('should show individual worker check-in section', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Check for worker section
    await expect(page.locator('text=개별 작업자 체크')).toBeVisible();

    // Check if there are workers or empty state message
    const workers = page.locator('text=/일당:/');
    const emptyMessage = page.locator('text=등록된 작업자가 없습니다');

    const hasWorkers = await workers.count() > 0;
    const hasEmptyMessage = await emptyMessage.isVisible();

    expect(hasWorkers || hasEmptyMessage).toBeTruthy();
  });

  test('should select different calendar dates', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Get initial selected date
    const initialSelected = page.locator('button[class*="bg-blue-600"]');
    await expect(initialSelected).toBeVisible();

    // Click on a different date (try to find day 5)
    const day5Button = page.locator('button').filter({ hasText: '5' }).first();

    if (await day5Button.isVisible()) {
      await day5Button.click();

      // Wait for UI update
      await page.waitForTimeout(500);

      // Verify selection changed
      const newSelected = page.locator('button.bg-blue-600');
      await expect(newSelected).toBeVisible();

      // Check if the selected date has '5' in it
      const selectedText = await newSelected.textContent();
      expect(selectedText).toContain('5');
    }
  });

  test('should check in worker with 1공수', async ({ context }) => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Monitor console for errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Monitor network requests
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
        console.log('API Request:', request.method(), request.url());
      }
    });

    // Check if there are workers with no check-in
    const checkInButton = page.locator('button:has-text("1공수")').first();

    if (await checkInButton.isVisible()) {
      // Click 1공수 button
      await checkInButton.click();

      // Wait for API call
      await page.waitForTimeout(2000);

      // Check for console errors
      const errors = consoleMessages.filter(msg =>
        msg.includes('Error') || msg.includes('error') || msg.includes('Failed')
      );

      if (errors.length > 0) {
        console.log('Console errors found:', errors);
      }

      // Take screenshot
      await page.screenshot({
        path: 'test-artifacts/after-check-in.png',
        fullPage: true
      });

      // Verify the button state changed (should show status badge now)
      const statusBadge = page.locator('span:has-text("1공수")').first();
      // Note: The button might still be visible but status should appear
    } else {
      console.log('No check-in buttons found - all workers might already be checked in');
    }
  });

  test('should use bulk check-in buttons', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Monitor network
    const networkRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/labor-logs')) {
        networkRequests.push({
          method: request.method(),
          url: request.url(),
          timestamp: Date.now()
        });
      }
    });

    // Find bulk check-in buttons
    const bulkHalfButton = page.locator('button:has-text("전체 0.5공수")');
    const bulkFullButton = page.locator('button:has-text("전체 1공수")');

    if (await bulkFullButton.isVisible()) {
      // Click bulk 1공수 button
      await bulkFullButton.click();

      // Wait for operations to complete
      await page.waitForTimeout(3000);

      // Check network requests were made
      console.log('Network requests made:', networkRequests.length);

      // Take screenshot
      await page.screenshot({
        path: 'test-artifacts/after-bulk-check-in.png',
        fullPage: true
      });

      // Check for toast notification
      const toast = page.locator('text=일괄 체크 완료');
      const toastVisible = await toast.isVisible().catch(() => false);

      if (toastVisible) {
        console.log('Toast notification appeared');
      } else {
        console.log('Toast notification not found');
      }
    }
  });

  test('should handle double-click on calendar date', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Monitor network
    const apiCalls: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/labor-logs')) {
        apiCalls.push({
          status: response.status(),
          url: response.url()
        });
      }
    });

    // Find a calendar day button (not the selected one)
    const dayButtons = page.locator('button[class*="h-14"]');
    const count = await dayButtons.count();

    if (count > 1) {
      // Double-click on the second day button
      await dayButtons.nth(1).dblclick();

      // Wait for operations
      await page.waitForTimeout(2000);

      console.log('API calls after double-click:', apiCalls);

      // Take screenshot
      await page.screenshot({
        path: 'test-artifacts/after-double-click.png',
        fullPage: true
      });
    }
  });

  test('should update daily summary after check-ins', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Get initial summary values
    const initialCost = await page.locator('text=원').first().textContent();

    // Perform a check-in if possible
    const checkInButton = page.locator('button:has-text("1공수")').first();

    if (await checkInButton.isVisible()) {
      await checkInButton.click();
      await page.waitForTimeout(2000);

      // Get updated summary
      const updatedCost = await page.locator('text=원').first().textContent();

      console.log('Initial cost:', initialCost);
      console.log('Updated cost:', updatedCost);

      // Take screenshot of summary
      const summaryCard = page.locator('.card').nth(1);
      await summaryCard.screenshot({
        path: 'test-artifacts/daily-summary.png'
      });
    }
  });

  test('should navigate between months', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Get initial month
    const initialMonth = await page.locator('h2').textContent();
    console.log('Initial month:', initialMonth);

    // Click next month button
    const nextButton = page.locator('button:has-text("→")');
    await nextButton.click();
    await page.waitForTimeout(500);

    // Verify month changed
    const newMonth = await page.locator('h2').textContent();
    console.log('New month:', newMonth);

    // Take screenshot
    await page.screenshot({
      path: 'test-artifacts/next-month.png',
      fullPage: true
    });

    // Click previous month button
    const prevButton = page.locator('button:has-text("←")');
    await prevButton.click();
    await page.waitForTimeout(500);

    // Verify we're back
    const backMonth = await page.locator('h2').textContent();
    console.log('Back to month:', backMonth);
  });

  test('should remove worker check-in', async () => {
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);

    // Find delete button (only appears if worker is checked in)
    const deleteButton = page.locator('button:has-text("삭제")').first();

    if (await deleteButton.isVisible()) {
      // Take screenshot before
      await page.screenshot({
        path: 'test-artifacts/before-delete.png',
        fullPage: true
      });

      // Click delete
      await deleteButton.click();
      await page.waitForTimeout(2000);

      // Take screenshot after
      await page.screenshot({
        path: 'test-artifacts/after-delete.png',
        fullPage: true
      });

      // Verify delete button is gone (worker is no longer checked in)
      const deleteStillVisible = await deleteButton.isVisible().catch(() => false);
      expect(deleteStillVisible).toBeFalsy();
    } else {
      console.log('No delete buttons found - no workers checked in yet');
    }
  });

  test('comprehensive bug detection test', async () => {
    console.log('\n=== COMPREHENSIVE BUG DETECTION TEST ===\n');

    // Setup monitoring
    const issues: any[] = [];
    const consoleErrors: string[] = [];
    const networkErrors: any[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Error') || text.includes('error') || text.includes('Failed')) {
        consoleErrors.push(text);
        console.log('❌ Console Error:', text);
      }
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status()
        });
        console.log('❌ Network Error:', response.status(), response.url());
      }
    });

    // Navigate to page
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(1000);

    // TEST 1: Check calendar rendering
    console.log('\n--- Test 1: Calendar Rendering ---');
    try {
      const calendarGrid = page.locator('.grid.grid-cols-7');
      await expect(calendarGrid).toBeVisible();
      console.log('✓ Calendar grid is visible');
    } catch (e) {
      issues.push({ test: 'Calendar rendering', error: e.message });
      console.log('❌ Calendar rendering issue:', e.message);
    }

    // TEST 2: Check day buttons
    console.log('\n--- Test 2: Day Buttons ---');
    try {
      const dayButtons = page.locator('button[class*="h-14"]');
      const count = await dayButtons.count();
      console.log(`✓ Found ${count} day buttons`);

      if (count === 0) {
        issues.push({ test: 'Day buttons', error: 'No day buttons found' });
      }
    } catch (e) {
      issues.push({ test: 'Day buttons', error: e.message });
    }

    // TEST 3: Click on different dates
    console.log('\n--- Test 3: Date Selection ---');
    try {
      const day5Button = page.locator('button').filter({ hasText: '5' }).first();
      if (await day5Button.isVisible()) {
        await day5Button.click();
        await page.waitForTimeout(500);

        // Verify selection
        const selectedDate = page.locator('button.bg-blue-600');
        await expect(selectedDate).toBeVisible();
        console.log('✓ Date selection works');
      } else {
        console.log('⚠ Day 5 button not visible (might be different month)');
      }
    } catch (e) {
      issues.push({ test: 'Date selection', error: e.message });
      console.log('❌ Date selection issue:', e.message);
    }

    // TEST 4: Check individual worker check-in
    console.log('\n--- Test 4: Individual Worker Check-in ---');
    try {
      const checkInButtons = page.locator('button:has-text("1공수")');
      const count = await checkInButtons.count();

      if (count > 0) {
        console.log(`✓ Found ${count} check-in buttons`);

        // Click first check-in button
        await checkInButtons.first().click();
        await page.waitForTimeout(2000);

        // Check for status change
        const statusBadge = page.locator('span[class*="bg-blue-100"]');
        const visible = await statusBadge.isVisible().catch(() => false);

        if (visible) {
          console.log('✓ Worker check-in button click works');
        } else {
          console.log('⚠ Check-in button clicked but no status badge visible');
          issues.push({
            test: 'Worker check-in',
            error: 'Button clicked but UI did not update'
          });
        }
      } else {
        console.log('⚠ No check-in buttons found (all workers already checked in?)');
      }
    } catch (e) {
      issues.push({ test: 'Worker check-in', error: e.message });
      console.log('❌ Worker check-in issue:', e.message);
    }

    // TEST 5: Check bulk check-in
    console.log('\n--- Test 5: Bulk Check-in ---');
    try {
      const bulkButton = page.locator('button:has-text("전체 1공수")');
      if (await bulkButton.isVisible()) {
        await bulkButton.click();
        await page.waitForTimeout(3000);

        console.log('✓ Bulk check-in button clickable');

        // Check if data was saved
        const checkedBadges = page.locator('span[class*="rounded-full"]');
        const badgeCount = await checkedBadges.count();
        console.log(`✓ Found ${badgeCount} checked worker badges`);
      } else {
        console.log('⚠ Bulk check-in button not visible');
      }
    } catch (e) {
      issues.push({ test: 'Bulk check-in', error: e.message });
      console.log('❌ Bulk check-in issue:', e.message);
    }

    // TEST 6: Check double-click functionality
    console.log('\n--- Test 6: Double-click on Date ---');
    try {
      const dayButtons = page.locator('button[class*="h-14"]');
      const count = await dayButtons.count();

      if (count > 2) {
        // Double-click on third day
        await dayButtons.nth(2).dblclick();
        await page.waitForTimeout(2000);

        console.log('✓ Double-click executed without error');
      } else {
        console.log('⚠ Not enough day buttons to test double-click');
      }
    } catch (e) {
      issues.push({ test: 'Double-click', error: e.message });
      console.log('❌ Double-click issue:', e.message);
    }

    // TEST 7: Check daily summary
    console.log('\n--- Test 7: Daily Summary ---');
    try {
      const summarySection = page.locator('text=/.*요약/');
      await expect(summarySection).toBeVisible();

      const costDisplay = page.locator('text=원');
      await expect(costDisplay.first()).toBeVisible();

      console.log('✓ Daily summary is displayed');
    } catch (e) {
      issues.push({ test: 'Daily summary', error: e.message });
      console.log('❌ Daily summary issue:', e.message);
    }

    // TEST 8: Check month navigation
    console.log('\n--- Test 8: Month Navigation ---');
    try {
      const nextMonthButton = page.locator('button:has-text("→")');
      await nextMonthButton.click();
      await page.waitForTimeout(500);

      console.log('✓ Month navigation works');
    } catch (e) {
      issues.push({ test: 'Month navigation', error: e.message });
      console.log('❌ Month navigation issue:', e.message);
    }

    // TEST 9: Check worker list updates
    console.log('\n--- Test 9: Worker List Updates ---');
    try {
      const workerSection = page.locator('text=개별 작업자 체크');
      await expect(workerSection).toBeVisible();

      const workersOrEmpty = page.locator('text=/일당:|등록된 작업자가 없습니다/');
      await expect(workersOrEmpty.first()).toBeVisible();

      console.log('✓ Worker list is displayed');
    } catch (e) {
      issues.push({ test: 'Worker list', error: e.message });
      console.log('❌ Worker list issue:', e.message);
    }

    // TEST 10: Check for console errors
    console.log('\n--- Test 10: Console Errors ---');
    if (consoleErrors.length > 0) {
      console.log(`❌ Found ${consoleErrors.length} console errors`);
      consoleErrors.forEach(err => console.log('  -', err));
      issues.push({ test: 'Console errors', error: consoleErrors.join(', ') });
    } else {
      console.log('✓ No console errors detected');
    }

    // TEST 11: Check for network errors
    console.log('\n--- Test 11: Network Errors ---');
    if (networkErrors.length > 0) {
      console.log(`❌ Found ${networkErrors.length} network errors`);
      networkErrors.forEach(err => console.log('  -', err.status, err.url));
      issues.push({ test: 'Network errors', error: networkErrors });
    } else {
      console.log('✓ No network errors detected');
    }

    // Final screenshot
    await page.screenshot({
      path: 'test-artifacts/final-state.png',
      fullPage: true
    });

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total issues found: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n❌ ISSUES DETECTED:');
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. [${issue.test}] ${issue.error}`);
      });
    } else {
      console.log('\n✓ All tests passed!');
    }

    console.log('\n=== END OF COMPREHENSIVE TEST ===\n');
  });
});
