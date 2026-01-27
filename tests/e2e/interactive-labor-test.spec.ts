import { test, expect } from '@playwright/test';

test.describe('Labor Check Page - Interactive Debugging', () => {
  test('manual test with pause for inspection', async ({ page }) => {
    console.log('\n=== STARTING INTERACTIVE TEST ===\n');

    // Step 1: Go to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-artifacts/debug-01-login-page.png' });
    console.log('✓ Login page loaded');

    // Step 2: Try to login (you can pause here to manually login)
    console.log('\nStep 2: Attempting login...');
    console.log('Note: If login fails, you can manually login in the browser');

    // Try with common test credentials
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    await page.screenshot({ path: 'test-artifacts/debug-02-after-login.png' });

    // If still on login page, try manual intervention
    if (currentUrl.includes('/login')) {
      console.log('\n⚠ Login failed. Please manually login in the browser window.');
      console.log('Press Enter in the terminal when done...');
      await page.pause();
    }

    // Step 3: Navigate to projects
    console.log('\nStep 3: Navigating to projects...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-artifacts/debug-03-dashboard.png' });

    // Check for projects
    const projectLinks = page.locator('a[href^="/projects/"]');
    const projectCount = await projectLinks.count();

    console.log(`Found ${projectCount} projects`);

    if (projectCount === 0) {
      console.log('\n⚠ No projects found. Creating one...');

      // Create a project
      await page.goto('http://localhost:3000/projects/new');
      await page.waitForTimeout(1000);

      await page.fill('input[name="name"]', 'Test Project ' + Date.now());
      await page.fill('input[name="location"]', 'Test Location');
      await page.fill('input[name="start_date"]', '2026-01-01');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'test-artifacts/debug-04-after-project-create.png' });
    }

    // Step 4: Get project ID and navigate to labor check
    console.log('\nStep 4: Navigating to labor check page...');

    const url = page.url();
    let projectId = '';

    if (url.includes('/projects/')) {
      projectId = url.split('/').pop() || '';
    } else {
      // Get from project list
      await page.goto('http://localhost:3000/dashboard');
      const links = page.locator('a[href^="/projects/"]');
      const href = await links.first().getAttribute('href');
      projectId = href?.split('/')[2] || '';
    }

    console.log('Project ID:', projectId);

    if (!projectId) {
      console.log('❌ Could not find project ID');
      return;
    }

    // Navigate to labor check page
    await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-artifacts/debug-05-labor-check-page.png', fullPage: true });
    console.log('✓ Labor check page loaded');

    // Step 5: Inspect the page
    console.log('\nStep 5: Inspecting page elements...');

    // Check for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Check title
    const title = page.locator('h1');
    if (await title.isVisible()) {
      const titleText = await title.textContent();
      console.log('✓ Page title:', titleText);
    }

    // Check calendar
    const calendarDays = page.locator('button[class*="h-14"]');
    const dayCount = await calendarDays.count();
    console.log(`✓ Calendar has ${dayCount} days`);

    // Check workers
    const workerSection = page.locator('text=개별 작업자 체크');
    if (await workerSection.isVisible()) {
      console.log('✓ Worker section exists');

      const hasWorkers = await page.locator('text=/일당:/').count() > 0;
      if (hasWorkers) {
        const workerCount = await page.locator('text=/일당:/').count();
        console.log(`✓ Found ${workerCount} workers`);
      } else {
        console.log('⚠ No workers found (showing empty state?)');
      }
    }

    // Check check-in buttons
    const checkInButtons = page.locator('button:has-text("1공수")');
    const buttonCount = await checkInButtons.count();
    console.log(`✓ Found ${buttonCount} check-in buttons`);

    // Check bulk buttons
    const bulkButton = page.locator('button:has-text("전체 1공수")');
    if (await bulkButton.isVisible()) {
      console.log('✓ Bulk check-in button exists');
    }

    // Check summary
    const summary = page.locator('text=/.*요약/');
    if (await summary.isVisible()) {
      console.log('✓ Daily summary exists');
    }

    // Step 6: Test interactions
    console.log('\nStep 6: Testing interactions...');

    // Test clicking a date
    if (dayCount > 5) {
      console.log('Testing date selection...');
      await calendarDays.nth(5).click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-artifacts/debug-06-after-date-click.png' });
      console.log('✓ Date clicked');
    }

    // Test check-in button
    if (buttonCount > 0) {
      console.log('Testing check-in button...');
      await checkInButtons.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-artifacts/debug-07-after-checkin.png', fullPage: true });
      console.log('✓ Check-in button clicked');
    } else {
      console.log('⚠ No check-in buttons to test');

      // Check if workers already checked in
      const deleteButtons = page.locator('button:has-text("삭제")');
      const deleteCount = await deleteButtons.count();
      if (deleteCount > 0) {
        console.log(`✓ Found ${deleteCount} delete buttons (workers already checked in)`);
      }
    }

    // Test bulk check-in
    const bulkVisible = await bulkButton.isVisible().catch(() => false);
    if (bulkVisible) {
      console.log('Testing bulk check-in...');
      await bulkButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-artifacts/debug-08-after-bulk-checkin.png', fullPage: true });
      console.log('✓ Bulk check-in clicked');
    }

    // Test double-click
    if (dayCount > 2) {
      console.log('Testing double-click...');
      await calendarDays.nth(2).dblclick();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-artifacts/debug-09-after-doubleclick.png', fullPage: true });
      console.log('✓ Double-click performed');
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('\nScreenshots saved in test-artifacts/ directory');
    console.log('Please review the screenshots to identify issues.\n');

    // Pause for manual inspection
    console.log('\nPausing for manual inspection...');
    console.log('Press Enter or close the browser to continue...');
    await page.pause();
  });
});
