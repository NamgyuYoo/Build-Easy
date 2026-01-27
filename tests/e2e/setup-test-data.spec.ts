import { test, expect } from '@playwright/test';

test.describe('Setup Test Data for Labor Check Tests', () => {
  test('create test user and project', async ({ page, context }) => {
    console.log('\n=== SETTING UP TEST DATA ===\n');

    // Navigate to login/signup page
    await page.goto('http://localhost:3000/login');

    // Generate random email for testing
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    console.log('Test email:', testEmail);

    // Fill in form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Click signup button
    await page.click('button:has-text("회원가입")');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'test-artifacts/setup-after-signup.png',
      fullPage: true
    });

    // Check if signup successful
    const url = page.url();
    console.log('After signup URL:', url);

    if (url.includes('/dashboard')) {
      console.log('✓ Signup successful, on dashboard');

      // Now create a project
      await page.goto('http://localhost:3000/projects/new');
      await page.waitForTimeout(1000);

      // Fill project form
      await page.fill('input[name="name"]', 'E2E Test Project');
      await page.fill('input[name="location"]', 'Test Location');
      await page.fill('input[name="start_date"]', '2026-01-01');

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({
        path: 'test-artifacts/setup-after-project-create.png',
        fullPage: true
      });

      // Check if project created
      const projectUrl = page.url();
      console.log('After project creation URL:', projectUrl);

      if (projectUrl.includes('/projects/')) {
        const projectId = projectUrl.split('/').pop();
        console.log('✓ Project created with ID:', projectId);

        // Now create some workers
        await page.goto('http://localhost:3000/workers');
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({
          path: 'test-artifacts/setup-workers-page.png',
          fullPage: true
        });

        // Look for "new worker" button or link
        const newWorkerButton = page.locator('a[href="/workers/new"], button:has-text("새 작업자"), button:has-text("작업자 추가")');

        if (await newWorkerButton.first().isVisible()) {
          await newWorkerButton.first().click();
          await page.waitForTimeout(1000);

          // Create a few test workers
          const workers = [
            { name: '테스트 작업자1', dailyWage: '150000' },
            { name: '테스트 작업자2', dailyWage: '160000' },
            { name: '테스트 작업자3', dailyWage: '140000' },
          ];

          for (const worker of workers) {
            await page.fill('input[name="name"]', worker.name);
            await page.fill('input[name="daily_wage"]', worker.dailyWage);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);

            console.log(`✓ Created worker: ${worker.name}`);

            // Go back to workers page for next worker
            await page.goto('http://localhost:3000/workers');
            await page.waitForTimeout(1000);

            const addAnotherButton = page.locator('a[href="/workers/new"], button:has-text("새 작업자")');
            if (await addAnotherButton.first().isVisible()) {
              await addAnotherButton.first().click();
              await page.waitForTimeout(1000);
            }
          }

          console.log('✓ All test workers created');
        } else {
          console.log('⚠ Could not find "new worker" button');
        }

        // Save test credentials for other tests
        console.log('\n=== TEST CREDENTIALS ===');
        console.log('Email:', testEmail);
        console.log('Password:', testPassword);
        console.log('Project ID:', projectId);
        console.log('=========================\n');

        // Write to file for other tests to use
        const fs = require('fs');
        fs.writeFileSync(
          'test-artifacts/test-credentials.json',
          JSON.stringify({
            email: testEmail,
            password: testPassword,
            projectId: projectId
          }, null, 2)
        );
        console.log('✓ Test credentials saved to test-artifacts/test-credentials.json');

      } else {
        console.log('❌ Project creation may have failed');
      }

    } else if (url.includes('/login')) {
      console.log('⚠ Still on login page after signup');
      const errorText = await page.locator('text=/error|Error|실패|failed/').textContent();
      console.log('Error message:', errorText);
    } else {
      console.log('⚠ Unexpected URL after signup:', url);
    }

    console.log('\n=== SETUP COMPLETE ===\n');
  });
});
