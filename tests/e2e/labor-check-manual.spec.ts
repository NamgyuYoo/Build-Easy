import { test, expect } from '@playwright/test';

test.describe('Labor Check Page - Manual Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to login page
    await page.goto('http://localhost:3000/login');
  });

  test('Step 1: Login and navigate to dashboard', async ({ page }) => {
    console.log('TEST: Login functionality');

    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait a bit for navigation
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'test-artifacts/01-after-login.png',
      fullPage: true
    });

    // Check current URL
    const url = page.url();
    console.log('Current URL after login:', url);

    // Check if we're on dashboard or still on login
    const onLogin = page.url().includes('/login');
    const onDashboard = page.url().includes('/dashboard');

    if (onLogin) {
      console.log('❌ Still on login page - login failed or needs different credentials');
      const errorMessage = page.locator('text=/로그인에 실패|인증되지 않았습니다/');
      const hasError = await errorMessage.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await errorMessage.textContent();
        console.log('Error message:', errorText);
      }
    } else if (onDashboard) {
      console.log('✓ Successfully logged in and redirected to dashboard');
    } else {
      console.log('⚠ Redirected to unexpected page:', url);
    }
  });

  test('Step 2: Find and navigate to a project', async ({ page }) => {
    // First login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('TEST: Find project');

    // Take screenshot of dashboard
    await page.screenshot({
      path: 'test-artifacts/02-dashboard.png',
      fullPage: true
    });

    // Look for project links
    const projectLinks = page.locator('a[href^="/projects/"]');
    const count = await projectLinks.count();

    console.log(`Found ${count} project links`);

    if (count > 0) {
      // Get first project link
      const firstLink = projectLinks.first();
      const href = await firstLink.getAttribute('href');
      console.log('First project link:', href);

      // Click it
      await firstLink.click();
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({
        path: 'test-artifacts/03-project-page.png',
        fullPage: true
      });

      console.log('Current URL:', page.url());
    } else {
      console.log('⚠ No projects found - need to create one');
    }
  });

  test('Step 3: Navigate to labor check page', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Navigate to first project
    const projectLinks = page.locator('a[href^="/projects/"]');
    const count = await projectLinks.count();

    if (count === 0) {
      console.log('⚠ No projects found, skipping test');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    console.log('TEST: Navigate to labor check page');

    // Get project ID from URL
    const url = page.url();
    const projectId = url.split('/').pop();
    console.log('Project ID:', projectId);

    // Navigate to labor check page
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'test-artifacts/04-labor-check-page.png',
      fullPage: true
    });

    // Verify we're on the right page
    const title = page.locator('h1:has-text("출근 체크")');
    const isTitleVisible = await title.isVisible().catch(() => false);

    if (isTitleVisible) {
      console.log('✓ Successfully navigated to labor check page');
    } else {
      console.log('❌ Labor check page title not found');
    }
  });

  test('Step 4: Test calendar date selection', async ({ page }) => {
    // Setup: Login and navigate to labor check page
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const projectLinks = page.locator('a[href^="/projects/"]');
    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const projectId = url.split('/').pop();
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    console.log('TEST: Calendar date selection');

    // Take initial screenshot
    await page.screenshot({
      path: 'test-artifacts/05-before-date-click.png'
    });

    // Find a date button (try day 10)
    const day10Button = page.locator('button').filter({ hasText: '10' }).first();

    if (await day10Button.isVisible()) {
      console.log('Clicking on day 10');

      await day10Button.click();
      await page.waitForTimeout(1000);

      // Take screenshot after click
      await page.screenshot({
        path: 'test-artifacts/06-after-date-click.png'
      });

      // Check if selection changed
      const selectedDate = page.locator('button.bg-blue-600');
      const isSelectedVisible = await selectedDate.isVisible().catch(() => false);

      if (isSelectedVisible) {
        console.log('✓ Date selection appears to work');
        const selectedText = await selectedDate.textContent();
        console.log('Selected date:', selectedText);
      } else {
        console.log('❌ No selected date visible after click');
      }
    } else {
      console.log('⚠ Day 10 button not visible');
    }
  });

  test('Step 5: Test worker check-in buttons', async ({ page }) => {
    // Setup
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const projectLinks = page.locator('a[href^="/projects/"]');
    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const projectId = url.split('/').pop();
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    console.log('TEST: Worker check-in buttons');

    // Monitor console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Look for check-in buttons
    const checkInButtons = page.locator('button:has-text("1공수")');
    const count = await checkInButtons.count();

    console.log(`Found ${count} "1공수" buttons`);

    if (count > 0) {
      // Take screenshot before
      await page.screenshot({
        path: 'test-artifacts/07-before-checkin.png',
        fullPage: true
      });

      // Click first button
      console.log('Clicking first check-in button...');
      await checkInButtons.first().click();
      await page.waitForTimeout(3000);

      // Take screenshot after
      await page.screenshot({
        path: 'test-artifacts/08-after-checkin.png',
        fullPage: true
      });

      // Check for console errors
      if (consoleErrors.length > 0) {
        console.log('❌ Console errors detected:');
        consoleErrors.forEach(err => console.log('  -', err));
      } else {
        console.log('✓ No console errors');
      }

      // Check if UI updated
      const deleteButton = page.locator('button:has-text("삭제")').first();
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

      if (hasDeleteButton) {
        console.log('✓ Delete button appeared - check-in may have worked');
      } else {
        console.log('❌ No delete button visible - check-in may not have worked');
      }
    } else {
      console.log('⚠ No check-in buttons found');

      // Check if all workers already checked in
      const deleteButtons = page.locator('button:has-text("삭제")');
      const deleteCount = await deleteButtons.count();

      if (deleteCount > 0) {
        console.log(`✓ All ${deleteCount} workers already checked in`);
      } else {
        console.log('⚠ No check-in buttons and no delete buttons - no workers?');
      }

      // Take screenshot to see state
      await page.screenshot({
        path: 'test-artifacts/09-no-checkin-buttons.png',
        fullPage: true
      });
    }
  });

  test('Step 6: Test bulk check-in buttons', async ({ page }) => {
    // Setup
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const projectLinks = page.locator('a[href^="/projects/"]');
    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const projectId = url.split('/').pop();
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    console.log('TEST: Bulk check-in buttons');

    // Look for bulk check-in button
    const bulkButton = page.locator('button:has-text("전체 1공수")');
    const isVisible = await bulkButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✓ Bulk check-in button found');

      // Take screenshot before
      await page.screenshot({
        path: 'test-artifacts/10-before-bulk-checkin.png'
      });

      // Click bulk button
      console.log('Clicking bulk check-in button...');
      await bulkButton.click();
      await page.waitForTimeout(3000);

      // Take screenshot after
      await page.screenshot({
        path: 'test-artifacts/11-after-bulk-checkin.png',
        fullPage: true
      });

      // Check for toast notification
      const toast = page.locator('text=일괄 체크 완료');
      const toastVisible = await toast.isVisible().catch(() => false);

      if (toastVisible) {
        console.log('✓ Toast notification appeared');
      } else {
        console.log('⚠ No toast notification visible');
      }
    } else {
      console.log('⚠ Bulk check-in button not visible');

      // Take screenshot to see state
      await page.screenshot({
        path: 'test-artifacts/12-no-bulk-button.png',
        fullPage: true
      });
    }
  });

  test('Step 7: Test double-click on calendar date', async ({ page }) => {
    // Setup
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const projectLinks = page.locator('a[href^="/projects/"]');
    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const projectId = url.split('/').pop();
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    console.log('TEST: Double-click on calendar date');

    // Find a calendar day
    const dayButtons = page.locator('button[class*="h-14"]');
    const count = await dayButtons.count();

    console.log(`Found ${count} calendar day buttons`);

    if (count > 2) {
      // Take screenshot before
      await page.screenshot({
        path: 'test-artifacts/13-before-double-click.png'
      });

      // Double-click on third day button
      console.log('Double-clicking on day button...');
      await dayButtons.nth(2).dblclick();
      await page.waitForTimeout(3000);

      // Take screenshot after
      await page.screenshot({
        path: 'test-artifacts/14-after-double-click.png',
        fullPage: true
      });

      console.log('✓ Double-click executed');
    } else {
      console.log('⚠ Not enough day buttons');
    }
  });

  test('Step 8: Check daily summary display', async ({ page }) => {
    // Setup
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const projectLinks = page.locator('a[href^="/projects/"]');
    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const projectId = url.split('/').pop();
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    console.log('TEST: Daily summary display');

    // Check for summary section
    const summaryText = page.locator('text=/.*요약/');
    const isSummaryVisible = await summaryText.isVisible().catch(() => false);

    if (isSummaryVisible) {
      console.log('✓ Daily summary section is visible');

      // Get cost display
      const costDisplay = page.locator('text=원').first();
      const costText = await costDisplay.textContent();
      console.log('Cost display:', costText);

      // Get man-days display
      const manDaysDisplay = page.locator('text=/.*공수/');
      const manDaysText = await manDaysDisplay.first().textContent();
      console.log('Man-days display:', manDaysText);

      // Take screenshot
      await page.screenshot({
        path: 'test-artifacts/15-daily-summary.png'
      });
    } else {
      console.log('❌ Daily summary not found');

      // Take screenshot to debug
      await page.screenshot({
        path: 'test-artifacts/16-no-summary.png',
        fullPage: true
      });
    }
  });

  test('Step 9: Full page inspection and bug detection', async ({ page }) => {
    console.log('\n=== FULL PAGE INSPECTION ===\n');

    // Setup
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const projectLinks = page.locator('a[href^="/projects/"]');
    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    await projectLinks.first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const projectId = url.split('/').pop();
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    // Collect all issues
    const issues: any[] = [];

    // Check 1: Page title
    console.log('\n--- Check 1: Page Title ---');
    const title = page.locator('h1');
    if (await title.isVisible()) {
      const titleText = await title.textContent();
      console.log('✓ Page title:', titleText);
    } else {
      console.log('❌ Page title not found');
      issues.push('Page title missing');
    }

    // Check 2: Calendar grid
    console.log('\n--- Check 2: Calendar Grid ---');
    const calendarDays = page.locator('button[class*="h-14"]');
    const dayCount = await calendarDays.count();
    console.log(`✓ Calendar has ${dayCount} days`);

    if (dayCount < 28) {
      console.log('❌ Calendar has fewer days than expected');
      issues.push('Calendar days count abnormal');
    }

    // Check 3: Selected date
    console.log('\n--- Check 3: Selected Date ---');
    const selectedDate = page.locator('button.bg-blue-600');
    if (await selectedDate.isVisible()) {
      console.log('✓ Selected date is highlighted');
    } else {
      console.log('⚠ No selected date highlighted');
    }

    // Check 4: Worker section
    console.log('\n--- Check 4: Worker Section ---');
    const workerSection = page.locator('text=개별 작업자 체크');
    if (await workerSection.isVisible()) {
      console.log('✓ Worker section exists');

      // Check for workers or empty state
      const hasWorkers = await page.locator('text=/일당:/').count() > 0;
      const emptyState = await page.locator('text=등록된 작업자가 없습니다').isVisible().catch(() => false);

      if (hasWorkers) {
        const workerCount = await page.locator('text=/일당:/').count();
        console.log(`✓ Found ${workerCount} workers`);
      } else if (emptyState) {
        console.log('⚠ No workers registered (empty state shown)');
      } else {
        console.log('⚠ Worker section exists but no workers or empty state');
        issues.push('Worker section state unclear');
      }
    } else {
      console.log('❌ Worker section not found');
      issues.push('Worker section missing');
    }

    // Check 5: Check-in buttons
    console.log('\n--- Check 5: Check-in Buttons ---');
    const checkInButtons = page.locator('button:has-text("1공수")');
    const checkInCount = await checkInButtons.count();

    if (checkInCount > 0) {
      console.log(`✓ Found ${checkInCount} check-in buttons`);
    } else {
      console.log('⚠ No check-in buttons (all checked in or no workers)');

      // Check for delete buttons instead
      const deleteButtons = page.locator('button:has-text("삭제")');
      const deleteCount = await deleteButtons.count();

      if (deleteCount > 0) {
        console.log(`✓ Found ${deleteCount} delete buttons (workers already checked in)`);
      }
    }

    // Check 6: Bulk check-in buttons
    console.log('\n--- Check 6: Bulk Check-in Buttons ---');
    const bulkButton = page.locator('button:has-text("전체 1공수")');
    if (await bulkButton.isVisible()) {
      console.log('✓ Bulk check-in button visible');
    } else {
      console.log('⚠ Bulk check-in button not visible');
    }

    // Check 7: Daily summary
    console.log('\n--- Check 7: Daily Summary ---');
    const summary = page.locator('text=/.*요약/');
    if (await summary.isVisible()) {
      console.log('✓ Daily summary section visible');

      const costText = await page.locator('text=원').first().textContent();
      console.log('  Cost:', costText);
    } else {
      console.log('❌ Daily summary not found');
      issues.push('Daily summary missing');
    }

    // Check 8: Month navigation
    console.log('\n--- Check 8: Month Navigation ---');
    const nextButton = page.locator('button:has-text("→")');
    const prevButton = page.locator('button:has-text("←")');

    if (await nextButton.isVisible() && await prevButton.isVisible()) {
      console.log('✓ Month navigation buttons visible');
    } else {
      console.log('❌ Month navigation buttons missing');
      issues.push('Month navigation missing');
    }

    // Check 9: Console errors
    console.log('\n--- Check 9: Console Errors ---');
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Trigger some interaction to catch errors
    await page.waitForTimeout(1000);

    if (consoleErrors.length > 0) {
      console.log(`❌ Found ${consoleErrors.length} console errors`);
      consoleErrors.forEach(err => console.log('  -', err));
      issues.push(`Console errors: ${consoleErrors.join(', ')}`);
    } else {
      console.log('✓ No console errors');
    }

    // Final screenshot
    await page.screenshot({
      path: 'test-artifacts/17-full-page-final.png',
      fullPage: true
    });

    // Summary
    console.log('\n=== INSPECTION SUMMARY ===');
    if (issues.length > 0) {
      console.log(`\n❌ ISSUES FOUND (${issues.length}):`);
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    } else {
      console.log('\n✓ No critical issues detected');
    }

    console.log('\n=== END OF INSPECTION ===\n');
  });
});
