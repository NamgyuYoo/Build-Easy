const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n=== MANUAL TESTING SCRIPT ===\n');
  console.log('Browser opened. Please follow these steps:\n');

  // Step 1: Go to login page
  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);

  console.log('\n✓ Login page loaded');
  console.log('2. Please manually login with your credentials');
  console.log('   Press Enter in terminal when ready...\n');

  // Wait for user to press Enter
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  // Check current state
  const currentUrl = page.url();
  console.log(`\nCurrent URL: ${currentUrl}`);

  if (currentUrl.includes('/dashboard')) {
    console.log('✓ Logged in successfully');
  } else {
    console.log('⚠ Still on login page or other page');
  }

  // Step 3: Navigate to projects
  console.log('\n3. Navigating to dashboard...');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);

  // Check for projects
  const projectLinks = await page.locator('a[href^="/projects/"]').count();
  console.log(`Found ${projectLinks} projects`);

  if (projectLinks === 0) {
    console.log('\n⚠ No projects found.');
    console.log('Please create a project manually or check database.');
    console.log('Press Enter when ready...\n');

    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  // Step 4: Get project ID
  let projectId = '';
  const url = page.url();

  if (url.includes('/projects/')) {
    projectId = url.split('/').pop();
  } else {
    const href = await page.locator('a[href^="/projects/"]').first().getAttribute('href');
    if (href) {
      projectId = href.split('/')[2];
      await page.locator('a[href^="/projects/"]').first().click();
      await page.waitForTimeout(1000);
    }
  }

  console.log(`\n✓ Project ID: ${projectId}`);

  // Step 5: Navigate to labor check page
  console.log('\n4. Navigating to labor check page...');
  await page.goto(`http://localhost:3000/projects/${projectId}/labor/check`);
  await page.waitForTimeout(2000);

  console.log('✓ Labor check page loaded');

  // Take screenshots for each test
  console.log('\n5. Taking initial screenshot...');
  await page.screenshot({ path: 'test-artifacts/manual-01-initial.png', fullPage: true });

  // Set up console monitoring
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });

  // TEST 1: Click different calendar dates
  console.log('\n\n=== TEST 1: Calendar Date Selection ===');
  console.log('Clicking on date 10...');

  const day10Button = page.locator('button').filter({ hasText: '10' }).first();
  if (await day10Button.isVisible()) {
    await day10Button.click();
    await page.waitForTimeout(1500);

    const selectedDate = page.locator('button.bg-blue-600');
    const isSelected = await selectedDate.isVisible();

    console.log(isSelected ? '✓ Date selection appears to work' : '❌ Date selection failed');

    await page.screenshot({ path: 'test-artifacts/manual-02-after-date-click.png', fullPage: true });
  } else {
    console.log('⚠ Day 10 button not visible');
  }

  // TEST 2: Check individual worker check-in
  console.log('\n\n=== TEST 2: Individual Worker Check-in ===');

  const checkInButtons = page.locator('button:has-text("1공수")');
  const buttonCount = await checkInButtons.count();

  console.log(`Found ${buttonCount} check-in buttons`);

  if (buttonCount > 0) {
    console.log('Clicking first check-in button...');

    await checkInButtons.first().click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-artifacts/manual-03-after-checkin.png', fullPage: true });

    // Check if UI updated
    const deleteButton = page.locator('button:has-text("삭제")').first();
    const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

    if (hasDeleteButton) {
      console.log('✓ Delete button appeared - check-in may have worked');
    } else {
      console.log('❌ No delete button visible - check-in may not have saved');
    }
  } else {
    console.log('⚠ No check-in buttons found');

    const deleteButtons = page.locator('button:has-text("삭제")');
    const deleteCount = await deleteButtons.count();

    if (deleteCount > 0) {
      console.log(`✓ All ${deleteCount} workers already checked in`);
    } else {
      console.log('⚠ No check-in buttons and no delete buttons - check worker list');

      const emptyMessage = page.locator('text=등록된 작업자가 없습니다');
      const hasEmpty = await emptyMessage.isVisible().catch(() => false);

      if (hasEmpty) {
        console.log('✓ Empty state shown - no workers registered');
      }
    }
  }

  // TEST 3: Bulk check-in
  console.log('\n\n=== TEST 3: Bulk Check-in ===');

  const bulkButton = page.locator('button:has-text("전체 1공수")');
  const bulkVisible = await bulkButton.isVisible().catch(() => false);

  if (bulkVisible) {
    console.log('Clicking bulk check-in button...');

    await bulkButton.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-artifacts/manual-04-after-bulk-checkin.png', fullPage: true });

    const toast = page.locator('text=일괄 체크 완료');
    const toastVisible = await toast.isVisible().catch(() => false);

    console.log(toastVisible ? '✓ Toast notification appeared' : '⚠ No toast notification');
  } else {
    console.log('⚠ Bulk check-in button not visible');
  }

  // TEST 4: Double-click on calendar
  console.log('\n\n=== TEST 4: Double-click on Calendar Date ===');

  const dayButtons = page.locator('button[class*="h-14"]');
  const dayCount = await dayButtons.count();

  if (dayCount > 3) {
    console.log('Double-clicking on day 3...');

    await dayButtons.nth(3).dblclick();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-artifacts/manual-05-after-doubleclick.png', fullPage: true });

    console.log('✓ Double-click executed');
  } else {
    console.log('⚠ Not enough day buttons');
  }

  // TEST 5: Check daily summary
  console.log('\n\n=== TEST 5: Daily Summary Display ===');

  const summaryText = page.locator('text=/.*요약/');
  const summaryVisible = await summaryText.isVisible().catch(() => false);

  if (summaryVisible) {
    console.log('✓ Daily summary section is visible');

    const costDisplay = page.locator('text=원').first();
    const costText = await costDisplay.textContent();
    console.log(`  Cost: ${costText}`);

    const manDaysDisplay = page.locator('text=/.*공수/').first();
    const manDaysText = await manDaysDisplay.textContent();
    console.log(`  Man-days: ${manDaysText}`);
  } else {
    console.log('❌ Daily summary not found');
  }

  // TEST 6: Check worker list for selected date
  console.log('\n\n=== TEST 6: Worker List Display ===');

  const workerSection = page.locator('text=개별 작업자 체크');
  const workerSectionVisible = await workerSection.isVisible().catch(() => false);

  if (workerSectionVisible) {
    console.log('✓ Worker section exists');

    const workers = page.locator('text=/일당:/');
    const workerCount = await workers.count();

    if (workerCount > 0) {
      console.log(`✓ Showing ${workerCount} workers`);

      // Check worker details
      for (let i = 0; i < Math.min(workerCount, 3); i++) {
        const workerText = await workers.nth(i).textContent();
        console.log(`  Worker ${i + 1}: ${workerText}`);
      }
    } else {
      console.log('⚠ No workers shown in list');
    }
  } else {
    console.log('❌ Worker section not found');
  }

  // TEST 7: Month navigation
  console.log('\n\n=== TEST 7: Month Navigation ===');

  const initialMonth = await page.locator('h2').textContent();
  console.log(`Initial month: ${initialMonth}`);

  const nextButton = page.locator('button:has-text("→")');
  await nextButton.click();
  await page.waitForTimeout(1000);

  const newMonth = await page.locator('h2').textContent();
  console.log(`After clicking next: ${newMonth}`);

  console.log(initialMonth !== newMonth ? '✓ Month navigation works' : '❌ Month did not change');

  // Final summary
  console.log('\n\n=== TEST SUMMARY ===');
  console.log(`Console errors detected: ${consoleErrors.length}`);

  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors:');
    consoleErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  }

  console.log('\n\n=== TESTING COMPLETE ===');
  console.log('Screenshots saved in test-artifacts/ directory');
  console.log('\nPress Enter to close browser...');

  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  await browser.close();
  console.log('\n✓ Browser closed');
})();
