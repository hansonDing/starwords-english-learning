import { test, expect } from 'playwright/test';

const BASE_URL = 'https://d235c6bkn2rd4.ok.kimi.link';

test.describe('Leaderboard Page Navigation', () => {
  test('should navigate to leaderboard and back to home', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    console.log('✅ Home page loaded');

    await page.goto(`${BASE_URL}/#/leaderboard`);
    await page.waitForTimeout(1000);
    console.log('✅ Leaderboard loaded');

    await expect(page.locator('h1')).toContainText('评分天梯');
    console.log('✅ Leaderboard title confirmed');

    const backBtn = page.locator('button').first();
    await expect(backBtn).toBeVisible();
    console.log('✅ Back button visible');

    await backBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked back');

    // Verify back on home by checking StarWords title
    await expect(page.locator('text=StarWords').first()).toBeVisible();
    console.log('✅ Back on Home page');
  });

  test('should navigate between all pages without freeze', async ({ page }) => {
    // Collect console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Home
    await page.goto(BASE_URL);
    await page.waitForTimeout(800);
    console.log('✅ Home');

    // Leaderboard
    await page.goto(`${BASE_URL}/#/leaderboard`);
    await page.waitForTimeout(800);
    await expect(page.locator('h1')).toContainText('评分天梯');
    console.log('✅ Leaderboard');

    // Video
    await page.goto(`${BASE_URL}/#/video`);
    await page.waitForTimeout(800);
    await expect(page.locator('h1')).toContainText('每日动画');
    console.log('✅ Video');

    // Login
    await page.goto(`${BASE_URL}/#/login`);
    await page.waitForTimeout(800);
    await expect(page.locator('text=欢迎回来')).toBeVisible();
    console.log('✅ Login');

    // Back to Home
    await page.goto(BASE_URL);
    await page.waitForTimeout(800);
    await expect(page.locator('text=StarWords').first()).toBeVisible();
    console.log('✅ Home final');

    // Verify no React errors
    const reactErrors = errors.filter(e =>
      e.includes('React') || e.includes('undefined') || e.includes('null')
    );
    expect(reactErrors).toHaveLength(0);
    console.log('✅ No React errors');
  });

  test('leaderboard should not freeze with useEffect loop', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/leaderboard`);
    await page.waitForTimeout(1000);
    console.log('✅ Leaderboard loaded');

    // Wait 3 seconds - old bug would freeze page here
    await page.waitForTimeout(3000);

    const title = await page.locator('h1').textContent();
    expect(title).toContain('评分天梯');
    console.log('✅ Still responsive after 3s');

    // Verify content rendered (no users yet, so show empty state or title)
    await expect(page.locator('h1')).toContainText('评分天梯');
    console.log('✅ Content rendered correctly');
  });
});
