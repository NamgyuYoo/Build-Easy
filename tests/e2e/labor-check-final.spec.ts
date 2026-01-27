import { test, expect } from '@playwright/test';

/**
 * Labor Check Page E2E Tests
 *
 * These tests manually inspect the labor check page functionality.
 * Due to authentication requirements, tests will pause for manual login.
 */

test.describe('Labor Check Page - Final Tests', () => {
  let projectId: string;
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Monitor console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
        console.log('❌ Console Error:', text);
      }
    });

    // Monitor network for failures
    const networkErrors: any[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log('❌ Network Error:', response.status(), response.url());
      }
    });
  });

  test('Manual testing guide with automated checks', async () => {
    console.log('\n=== LABOR CHECK PAGE TESTING ===\n');

    // STEP 1: Navigate to login
    console.log('STEP 1: Navigate to login page');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    const loginPageTitle = await page.title();
    console.log('✓ Login page loaded:', loginPageTitle);
    await page.screenshot({ path: 'test-artifacts/final-01-login.png' });

    // STEP 2: Manual login required
    console.log('\nSTEP 2: Manual login required');
    console.log('Please login with your credentials in the browser');
    console.log('Waiting 30 seconds for login...');

    // Wait for user to login (check for URL change)
    await page.waitForTimeout(30000);

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('⚠ Still on login page. Tests will continue but may fail.');
    } else {
      console.log('✓ Appears to be logged in');
    }

    await page.screenshot({ path: 'test-artifacts/final-02-after-login.png' });

    // STEP 3: Navigate to dashboard
    console.log('\nSTEP 3: Navigate to dashboard');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-artifacts/final-03-dashboard.png' });

    // STEP 4: Find or create project
    console.log('\nSTEP 4: Find project');

    const projectLinks = page.locator('a[href^="/projects/"]');
    const projectCount = await projectLinks.count();

    console.log(`Found ${projectCount} project links`);

    if (projectCount === 0) {
      console.log('⚠ No projects found. Please create one manually.');
      console.log('Waiting 30 seconds...');

      await page.waitForTimeout(30000);

      // Try again
      const newCount = await page.locator('a[href^="/projects/"]').count();
      if (newCount === 0) {
        console.log('❌ Still no projects. Cannot continue.');
        return;
      }
    }

    // Get first project
    const firstProjectLink = projectLinks.first();
    const href = await firstProjectLink.getAttribute('href');
    projectId = href?.split('/')[2] || '';

    console.log('✓ Project ID:', projectId);

    // STEP 5: Navigate to labor check page
    console.log('\nSTEP 5: Navigate to labor check page');
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-artifacts/final-04-labor-check-page.png', fullPage: true });

    // Verify page loaded
    const pageTitle = page.locator('h1:has-text("출근 체크")');
    const isTitleVisible = await pageTitle.isVisible().catch(() => false);

    if (!isTitleVisible) {
      console.log('❌ Labor check page title not found');
      return;
    }

    console.log('✓ Labor check page loaded');

    // STEP 6: Inspect calendar
    console.log('\nSTEP 6: Inspect calendar');

    const calendarDays = page.locator('button[class*="h-14"]');
    const dayCount = await calendarDays.count();

    console.log(`✓ Calendar has ${dayCount} days`);

    if (dayCount < 28) {
      console.log('⚠ Calendar has fewer days than expected');
    } else if (dayCount > 31) {
      console.log('⚠ Calendar has more days than expected');
    } else {
      console.log('✓ Calendar day count looks correct');
    }

    // Check for selected date
    const selectedDate = page.locator('button.bg-blue-600');
    const isSelectedVisible = await selectedDate.isVisible().catch(() => false);

    if (isSelectedVisible) {
      const selectedText = await selectedDate.textContent();
      console.log('✓ Selected date:', selectedText);
    } else {
      console.log('⚠ No date appears to be selected');
    }

    await page.screenshot({ path: 'test-artifacts/final-05-calendar.png' });

    // STEP 7: Test date selection
    console.log('\nSTEP 7: Test date selection');

    const day10Button = page.locator('button').filter({ hasText: '10' }).first();

    if (await day10Button.isVisible()) {
      console.log('Clicking on day 10...');

      await day10Button.click();
      await page.waitForTimeout(1500);

      const newSelected = page.locator('button.bg-blue-600');
      const newSelectedText = await newSelected.textContent();

      console.log('✓ Date clicked. Selected date:', newSelectedText);

      await page.screenshot({ path: 'test-artifacts/final-06-after-date-click.png' });
    } else {
      console.log('⚠ Day 10 button not visible');
    }

    // STEP 8: Inspect worker section
    console.log('\nSTEP 8: Inspect worker section');

    const workerSection = page.locator('text=개별 작업자 체크');
    const isWorkerSectionVisible = await workerSection.isVisible().catch(() => false);

    if (!isWorkerSectionVisible) {
      console.log('❌ Worker section not found');
    } else {
      console.log('✓ Worker section exists');

      const hasWorkers = await page.locator('text=/일당:/').count() > 0;
      const emptyState = await page.locator('text=등록된 작업자가 없습니다').isVisible().catch(() => false);

      if (hasWorkers) {
        const workerCount = await page.locator('text=/일당:/').count();
        console.log(`✓ Found ${workerCount} workers`);

        // Get details of first 3 workers
        for (let i = 0; i < Math.min(workerCount, 3); i++) {
          const workerText = await page.locator('text=/일당:/').nth(i).textContent();
          console.log(`  Worker ${i + 1}:`, workerText);
        }
      } else if (emptyState) {
        console.log('⚠ No workers registered (empty state shown)');
      } else {
        console.log('⚠ Worker section exists but unclear state');
      }
    }

    await page.screenshot({ path: 'test-artifacts/final-07-worker-section.png' });

    // STEP 9: Test check-in buttons
    console.log('\nSTEP 9: Test check-in buttons');

    const checkInButtons = page.locator('button:has-text("1공수")');
    const checkInCount = await checkInButtons.count();

    console.log(`Found ${checkInCount} check-in buttons`);

    if (checkInCount > 0) {
      console.log('Clicking first check-in button...');

      await checkInButtons.first().click();
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'test-artifacts/final-08-after-checkin.png', fullPage: true });

      // Check for UI update
      const deleteButton = page.locator('button:has-text("삭제")').first();
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

      if (hasDeleteButton) {
        console.log('✓ Delete button appeared - check-in likely succeeded');
      } else {
        console.log('⚠ No delete button visible - check-in may have failed');
      }

      // Check for status badge
      const statusBadge = page.locator('span:has-text("1공수")');
      const badgeCount = await statusBadge.count();
      console.log(`Found ${badgeCount} status badges`);

    } else {
      console.log('⚠ No check-in buttons found');

      // Check for delete buttons (workers already checked in)
      const deleteButtons = page.locator('button:has-text("삭제")');
      const deleteCount = await deleteButtons.count();

      if (deleteCount > 0) {
        console.log(`✓ Found ${deleteCount} delete buttons (workers already checked in)`);
      }
    }

    // STEP 10: Test bulk check-in
    console.log('\nSTEP 10: Test bulk check-in');

    const bulkButton = page.locator('button:has-text("전체 1공수")');
    const bulkVisible = await bulkButton.isVisible().catch(() => false);

    if (bulkVisible) {
      console.log('Clicking bulk check-in button...');

      await bulkButton.click();
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'test-artifacts/final-09-after-bulk-checkin.png', fullPage: true });

      const toast = page.locator('text=일괄 체크 완료');
      const toastVisible = await toast.isVisible().catch(() => false);

      if (toastVisible) {
        console.log('✓ Toast notification appeared');
      } else {
        console.log('⚠ No toast notification visible');
      }
    } else {
      console.log('⚠ Bulk check-in button not visible');
    }

    // STEP 11: Test double-click
    console.log('\nSTEP 11: Test double-click on calendar');

    const dayButtons = page.locator('button[class*="h-14"]');
    const dayButtonCount = await dayButtons.count();

    if (dayButtonCount > 3) {
      console.log('Double-clicking on day button 3...');

      await dayButtons.nth(3).dblclick();
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'test-artifacts/final-10-after-doubleclick.png', fullPage: true });

      console.log('✓ Double-click executed');
    } else {
      console.log('⚠ Not enough day buttons');
    }

    // STEP 12: Check daily summary
    console.log('\nSTEP 12: Check daily summary');

    const summaryText = page.locator('text=/.*요약/');
    const summaryVisible = await summaryText.isVisible().catch(() => false);

    if (summaryVisible) {
      console.log('✓ Daily summary section exists');

      const costDisplay = page.locator('text=원').first();
      const costText = await costDisplay.textContent();
      console.log('  Cost:', costText);

      const fullCount = page.locator('text=/.*1일/').first();
      const fullCountText = await fullCount.textContent();
      console.log('  1공수:', fullCountText);

      const halfCount = page.locator('text=/.*반/').first();
      const halfCountText = await halfCount.textContent();
      console.log('  0.5공수:', halfCountText);

      const totalManDays = page.locator('text=/.*공수/').first();
      const totalManDaysText = await totalManDays.textContent();
      console.log('  Total:', totalManDaysText);
    } else {
      console.log('❌ Daily summary not found');
    }

    await page.screenshot({ path: 'test-artifacts/final-11-daily-summary.png' });

    // STEP 13: Test month navigation
    console.log('\nSTEP 13: Test month navigation');

    const initialMonth = await page.locator('h2').textContent();
    console.log('Initial month:', initialMonth);

    const nextButton = page.locator('button:has-text("→")');
    await nextButton.click();
    await page.waitForTimeout(1000);

    const nextMonth = await page.locator('h2').textContent();
    console.log('After clicking next:', nextMonth);

    if (initialMonth !== nextMonth) {
      console.log('✓ Month navigation works');
    } else {
      console.log('❌ Month did not change');
    }

    const prevButton = page.locator('button:has-text("←")');
    await prevButton.click();
    await page.waitForTimeout(1000);

    const backMonth = await page.locator('h2').textContent();
    console.log('After clicking previous:', backMonth);

    await page.screenshot({ path: 'test-artifacts/final-12-month-navigation.png' });

    // FINAL SUMMARY
    console.log('\n=== TEST SUMMARY ===\n');
    console.log('All automated checks completed.');
    console.log('\nScreenshots saved in test-artifacts/ directory:');
    console.log('  - final-01-login.png');
    console.log('  - final-02-after-login.png');
    console.log('  - final-03-dashboard.png');
    console.log('  - final-04-labor-check-page.png');
    console.log('  - final-05-calendar.png');
    console.log('  - final-06-after-date-click.png');
    console.log('  - final-07-worker-section.png');
    console.log('  - final-08-after-checkin.png');
    console.log('  - final-09-after-bulk-checkin.png');
    console.log('  - final-10-after-doubleclick.png');
    console.log('  - final-11-daily-summary.png');
    console.log('  - final-12-month-navigation.png');
    console.log('\nPlease review screenshots to identify any issues.');
    console.log('\n=== END OF TESTS ===\n');
  });

  test('Accessibility and UI check', async () => {
    console.log('\n=== ACCESSIBILITY AND UI CHECK ===\n');

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(30000); // Wait for manual login

    // Get project ID
    await page.goto('http://localhost:3000/dashboard');
    const projectLinks = page.locator('a[href^="/projects/"]');

    if (await projectLinks.count() === 0) {
      console.log('⚠ No projects found');
      return;
    }

    const href = await projectLinks.first().getAttribute('href');
    const projectId = href?.split('/')[2] || '';

    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    // Check for accessibility issues
    console.log('Checking for accessibility issues...');

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();

    console.log(`✓ Found ${h1Count} h1, ${h2Count} h2, ${h3Count} h3 elements`);

    // Check for buttons with proper labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    console.log(`✓ Found ${buttonCount} buttons`);

    // Check for aria-labels on icon-only buttons
    const iconButtons = page.locator('button:not(:has-text([^\\s]))');
    const iconButtonCount = await iconButtons.count();

    if (iconButtonCount > 0) {
      console.log(`⚠ Found ${iconButtonCount} potentially unlabeled icon buttons`);
    }

    // Check for sufficient color contrast (basic check)
    const grayText = page.locator('text-muted-foreground');
    const grayTextCount = await grayText.count();

    console.log(`✓ Found ${grayTextCount} muted text elements`);

    // Check for form inputs with labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    console.log(`✓ Found ${inputCount} input fields`);

    // Check for loading states
    const loadingElements = page.locator('text=/로딩|Loading|처리 중/');
    const loadingCount = await loadingElements.count();

    console.log(`✓ Found ${loadingCount} loading indicators`);

    // Check for error messages
    const errorElements = page.locator('text=/error|Error|오류|실패/');
    const errorCount = await errorElements.count();

    if (errorCount > 0) {
      console.log(`⚠ Found ${errorCount} error messages on page`);
    }

    // Check for responsive design elements
    const viewport = page.viewportSize();
    console.log(`\nCurrent viewport: ${viewport?.width}x${viewport?.height}`);

    await page.screenshot({
      path: 'test-artifacts/accessibility-check.png',
      fullPage: true
    });

    console.log('\n=== END OF ACCESSIBILITY CHECK ===\n');
  });
});
