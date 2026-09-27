import { expect, test, type Page } from '@playwright/test';

const runtimeErrors: string[] = [];
const referralPath = '/frontline/referral/REF-2026-00125';
const patientPath = '/frontline/patient/DEMO-00125';
const gapTitle = 'Missed ANC Check 3 & Essential Ultrasonography';
const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lV8AAAAASUVORK5CYII=', 'base64');

const observeRuntime = async (page: Page) => {
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('net::ERR_NETWORK_ACCESS_DENIED')) runtimeErrors.push(message.text());
  });
  await page.route(/https:\/\/[^/]+\.tile\.openstreetmap\.org\//, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: transparentPixel })
  );
};

const chooseRole = async (page: Page, name: 'Frontline Worker' | 'Facility / Clinician') => {
  await page.goto('/login');
  await page.getByRole('button', { name }).click();
};

const switchRole = async (page: Page, label: 'Frontline (ASHA)' | 'Facility (Clinician)') => {
  const current = page.getByRole('button', { name: /Frontline \(ASHA\)|Facility \(Clinician\)/ }).first();
  await current.click();
  await page.getByRole('option', { name: new RegExp(label.replace(/[()]/g, '\\$&')) }).click();
};

const completeReachHandshake = async (page: Page) => {
  await page.goto(referralPath);
  await expect(page.getByLabel('Visual-only synthetic QR-style pattern for referral REF-2026-00125 and passcode SH-28491. It is not scannable.')).toBeVisible();
  await expect(page.getByText('SH-28491', { exact: true })).toBeVisible();
  await page.getByLabel('Referral token').fill('REF-2026-00125');
  await page.getByLabel('Handshake passcode').fill('SH-28491');
  await page.getByRole('button', { name: 'Verify Handshake · Simulated' }).click();
  await expect(page.getByText(/REACH VERIFIED · The synthetic handshake was verified/)).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  runtimeErrors.length = 0;
  await observeRuntime(page);
});

test.afterEach(() => {
  expect(runtimeErrors, 'browser console and page runtime errors').toEqual([]);
});

test('all requested routes render and unknown records are safe', async ({ page }) => {
  const routes = [
    '/login', '/frontline/dashboard', patientPath, '/frontline/screening/DEMO-00125',
    '/frontline/care-gaps', referralPath, '/frontline/closure/DEMO-00125',
    '/facility/dashboard', '/facility/referral/REF-2026-00125', '/facility/closure/DEMO-00125',
    '/district/intelligence', '/frontline/facilities',
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  }
  for (const route of ['/frontline/patient/UNKNOWN-999', '/frontline/referral/UNKNOWN-999', '/facility/referral/UNKNOWN-999']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'Referral not found' }).or(page.getByRole('heading', { name: 'Patient not found' }))).toBeVisible();
  }
});

test('login roles, shell navigation, history, and client-side route changes work', async ({ page }) => {
  await chooseRole(page, 'Frontline Worker');
  await expect(page).toHaveURL(/frontline\/dashboard$/);
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole('navigation').getByRole('button', { name: /Care Gaps/ }).click();
  await expect(page).toHaveURL(/frontline\/care-gaps$/);
  await expect(page.locator('header')).toBeVisible();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  await page.goBack();
  await expect(page).toHaveURL(/frontline\/dashboard$/);
  await page.goForward();
  await expect(page).toHaveURL(/frontline\/care-gaps$/);
  await switchRole(page, 'Facility (Clinician)');
  await expect(page).toHaveURL(/facility\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'CHC Bikrampur' })).toBeVisible();
  await switchRole(page, 'Frontline (ASHA)');
  await expect(page).toHaveURL(/frontline\/dashboard$/);
});

test('frontline dashboard, profile, and screening retain synthetic patient context', async ({ page }) => {
  await page.goto('/frontline/dashboard');
  await expect(page.getByText('Sunita Devi').first()).toBeVisible();
  await expect(page.getByText('DEMO-00125').first()).toBeVisible();
  await page.getByRole('button', { name: "Continue Sunita's Case" }).click();
  await expect(page.getByRole('heading', { name: /Patient Profile for Sunita Devi/ })).toBeAttached();
  await expect(page.getByText(/42y/).first()).toBeVisible();
  await expect(page.getByText('Meena Bai').first()).toBeVisible();
  await page.getByRole('button', { name: 'Open Screening Placeholder' }).click();
  await expect(page.getByRole('heading', { name: 'Screening for Sunita Devi' })).toBeAttached();
  await expect(page.getByText('CURRENT VALUE ONLY').first()).toBeVisible();
  await expect(page.getByText('142/92 mmHg').first()).toBeVisible();
  await page.getByRole('button', { name: 'Save Screening' }).click();
  await expect(page.getByRole('button', { name: 'Saved for This Session' })).toBeVisible();
  await expect(page.getByText('Screening preview saved')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Patient Profile' }).click();
  await expect(page).toHaveURL(/frontline\/patient\/DEMO-00125$/);
});

test('Care Gap Center and Patient Profile agree, and facility directory and map controls work', async ({ page }) => {
  await page.goto('/frontline/care-gaps');
  await expect(page.getByRole('heading', { name: gapTitle })).toHaveCount(1);
  await expect(page.getByText('Expected step', { exact: true })).toBeVisible();
  await expect(page.getByText('Current state', { exact: true })).toBeVisible();
  await expect(page.getByText('EVIDENCE CONFIRMED').first()).toBeVisible();
  await expect(page.getByText(/GAP-2026-081/)).toBeVisible();
  await page.getByRole('button', { name: 'Open Patient Profile' }).click();
  await expect(page.getByRole('heading', { name: gapTitle })).toBeVisible();

  await page.goto('/frontline/facilities');
  for (const name of ['PHC Kalyanpur', 'CHC Bikrampur', 'District Hospital Sadar']) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByText('12.4 km')).toBeVisible();
  await expect(page.getByText('~35 min')).toBeVisible();

  await page.goto(referralPath);
  await expect(page.getByText('Sunita Devi').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: gapTitle })).toBeVisible();
  await expect(page.getByRole('region', { name: /Interactive map showing a synthetic patient/ })).toBeVisible();
  await expect(page.locator('.facility-map-pin')).toHaveCount(4);
  await expect(page.locator('.facility-map-patient')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'CHC Bikrampur', exact: true }).first()).toBeVisible();
  const phcCard = page.getByRole('article', { name: /PHC Kalyanpur/ });
  await phcCard.getByRole('button', { name: 'Select this facility' }).click();
  await expect(phcCard.getByRole('button', { name: 'Selected referral option' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Continue with selected option' }).click();
  await expect(page.getByText('Facility option selected')).toBeVisible();
});

test('arrival timeout remains terminal and the engine explains the operational gap', async ({ page }) => {
  await page.goto(referralPath);
  await page.getByRole('button', { name: 'Simulate Missed Arrival' }).click();
  await expect(page.getByText('TIMEOUT · SIMULATED', { exact: false }).first()).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: /Care Gaps/ }).click();
  await expect(page.getByText(/timed out before arrival was confirmed/i).first()).toBeVisible();
  await expect(page.getByText(/TIMEOUT/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate Arrival' })).toHaveCount(0);
});

test('timeout recovery starts, completes, and creates a separate pending referral cycle', async ({ page }) => {
  await page.goto(referralPath);
  await page.getByRole('button', { name: 'Simulate Missed Arrival' }).click();
  await expect(page.getByText('TIMEOUT · SIMULATED', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate Arrival' })).toHaveCount(0);
  await page.getByRole('navigation').getByRole('button', { name: /Care Gaps/ }).click();
  await expect(page.getByText(/Expected reach step was not completed|Missed ANC Check/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Start Follow-up' }).click();
  await expect(page.getByText('FOLLOW-UP IN PROGRESS · SIMULATED')).toBeVisible();
  await page.getByRole('button', { name: 'Complete Follow-up' }).click();
  await expect(page.getByText('FOLLOW-UP COMPLETED · SIMULATED')).toBeVisible();
  await page.getByRole('button', { name: 'Re-refer Patient' }).click();
  await expect(page).toHaveURL(/reReferFrom=REF-2026-00125/);
  await expect(page.getByRole('button', { name: 'Create Re-referral' })).toBeEnabled();
  await page.getByRole('button', { name: 'Create Re-referral' }).click();
  await expect(page).toHaveURL(/REF-2026-00125-R1$/);
  await expect(page.getByText('REACH PENDING · SIMULATED STATE')).toBeVisible();

  await page.getByRole('navigation').getByRole('button', { name: /Dashboard/ }).click();
  await page.getByRole('button', { name: "Continue Sunita's Case" }).click();
  await expect(page.getByText('REF-2026-00125-R1').first()).toBeVisible();
  await expect(page.getByText('REF-2026-00125 · simulated event · no timestamp recorded').first()).toBeVisible();
  await expect(page.getByText('REF-2026-00125-R1 · simulated event · no timestamp recorded')).toHaveCount(0);
  await expect(page.getByText('FOLLOW-UP COMPLETED').first()).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: /Care Gaps/ }).click();
  await expect(page.getByText(/Referral timed out before arrival was confirmed/i).first()).toBeVisible();
  await expect(page.getByText(/FOLLOW UP COMPLETED/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simulate Arrival' })).toHaveCount(0);
});

test('follow-up controls fit mobile, tablet, and desktop viewports', async ({ page }) => {
  await page.goto(referralPath);
  await page.getByRole('button', { name: 'Simulate Missed Arrival' }).click();
  for (const viewport of [{ width: 390, height: 780 }, { width: 768, height: 780 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    if (viewport.width === 390) await page.getByRole('navigation').getByRole('button', { name: /Care Gaps/ }).click();
    const followUp = page.getByRole('button', { name: 'Start Follow-up' });
    await followUp.scrollIntoViewIfNeeded();
    await expect(followUp).toBeVisible();
    const dimensions = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(dimensions.document).toBeLessThanOrEqual(viewport.width);
    expect(dimensions.body).toBeLessThanOrEqual(viewport.width);
    const controlBox = await followUp.boundingBox();
    const navBox = await page.locator('nav').boundingBox();
    expect(controlBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(controlBox!.y + controlBox!.height).toBeLessThanOrEqual(navBox!.y + 1);
  }
  await page.getByRole('button', { name: 'Start Follow-up' }).click();
  await page.getByRole('button', { name: 'Complete Follow-up' }).click();
  for (const viewport of [{ width: 390, height: 780 }, { width: 768, height: 780 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole('heading', { name: /Follow-up playbook/ })).toBeVisible();
    const reRefer = page.getByRole('button', { name: 'Re-refer Patient' });
    await expect(reRefer).toHaveAccessibleName('local_hospital Re-refer Patient');
    await reRefer.scrollIntoViewIfNeeded();
    const reReferBox = await reRefer.boundingBox();
    const navBox = await page.locator('nav').boundingBox();
    expect(reReferBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(reReferBox!.y + reReferBox!.height).toBeLessThanOrEqual(navBox!.y + 1);
  }
});

test('handshake and complete cross-role golden path share lifecycle and evidence', async ({ page }) => {
  await page.goto(referralPath);
  await expect(page.getByText('REF-2026-00125', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('SH-28491', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy Token' })).toBeVisible();
  await expect(page.getByLabel(/synthetic QR-style pattern/)).toBeVisible();

  await page.getByLabel('Referral token').fill('WRONG-ID');
  await page.getByLabel('Handshake passcode').fill('WRONG-CODE');
  await page.getByRole('button', { name: 'Verify Handshake · Simulated' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('did not match');
  await expect(page.getByText('REACH PENDING · SIMULATED', { exact: true })).toBeVisible();
  await page.getByLabel('Referral token').fill('REF-2026-00125');
  await page.getByLabel('Handshake passcode').fill('SH-28491');
  await page.getByRole('button', { name: 'Verify Handshake · Simulated' }).click();
  await expect(page.getByText(/REACH VERIFIED · The synthetic handshake was verified/)).toBeVisible();

  await switchRole(page, 'Facility (Clinician)');
  await expect(page.getByRole('heading', { name: 'CHC Bikrampur' })).toBeVisible();
  await expect(page.getByText('REF-2026-00125', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('REACH VERIFIED · SIMULATED', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'View Referral Details' }).click();
  await expect(page).toHaveURL(/facility\/referral\/REF-2026-00125$/);
  await expect(page.getByRole('button', { name: 'Record Care Received · Simulated' })).toBeVisible();
  await page.getByRole('button', { name: 'Record Care Received · Simulated' }).click();
  await expect(page.getByText('CARE RECEIVED · SIMULATED', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/SYNTHETIC_FACILITY_RECORD/)).toBeVisible();

  await switchRole(page, 'Frontline (ASHA)');
  await expect(page.getByText('CARE RECEIVED · SIMULATED', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: "Continue Sunita's Case" }).click();
  await expect(page.getByText('CARE RECEIVED · SIMULATED', { exact: true }).first()).toBeVisible();
  await switchRole(page, 'Facility (Clinician)');
  await page.getByRole('button', { name: 'View Referral Details' }).click();
  await page.getByRole('button', { name: 'Confirm Closure · Simulated' }).click();
  await expect(page.getByText('CLOSURE CONFIRMED · SIMULATED', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Evidence recorded for expected care step/).first()).toBeVisible();

  await switchRole(page, 'Frontline (ASHA)');
  await expect(page.getByText('CLOSURE CONFIRMED · SIMULATED', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: "Continue Sunita's Case" }).click();
  await expect(page.getByRole('heading', { name: 'CLOSURE CONFIRMED · SIMULATED' })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: /Care Gaps/ }).click();
  await expect(page.getByRole('heading', { name: gapTitle })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /No supported care gaps/ })).toBeVisible();
});

test('responsive primary screens fit and their key controls clear the fixed navigation', async ({ page }) => {
  const screens = [
    { path: '/frontline/dashboard', action: 'Continue Sunita\'s Case' },
    { path: patientPath, action: 'View Referral Details' },
    { path: '/frontline/screening/DEMO-00125', action: 'Save Screening' },
    { path: '/frontline/care-gaps', action: 'Open Patient Profile' },
    { path: referralPath, action: 'Continue with selected option' },
    { path: '/facility/dashboard', action: 'View Referral Details' },
  ];
  for (const viewport of [{ width: 390, height: 780 }, { width: 768, height: 780 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const screen of screens) {
      await page.goto(screen.path);
      const action = page.getByRole('button', { name: screen.action }).first();
      await action.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 120));
      await expect(action).toBeVisible();
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
      expect(dimensions.document, `${screen.path} document overflow at ${viewport.width}px`).toBeLessThanOrEqual(viewport.width);
      expect(dimensions.body, `${screen.path} body overflow at ${viewport.width}px`).toBeLessThanOrEqual(viewport.width);
      const actionBox = await action.boundingBox();
      const navBox = await page.locator('nav').boundingBox();
      expect(actionBox).not.toBeNull();
      expect(navBox).not.toBeNull();
      expect(actionBox!.y + actionBox!.height, `${screen.path} action is obscured by bottom nav`).toBeLessThanOrEqual(navBox!.y + 1);
    }

    await page.goto('/facility/referral/REF-2026-00125');
    await page.getByLabel('Referral token').fill('REF-2026-00125');
    await page.getByLabel('Handshake passcode').fill('SH-28491');
    await page.getByRole('button', { name: 'Verify Handshake · Simulated' }).click();
    const careAction = page.getByRole('button', { name: 'Record Care Received · Simulated' });
    await careAction.scrollIntoViewIfNeeded();
    await expect(careAction).toBeVisible();
    const careBox = await careAction.boundingBox();
    const bottomNavBox = await page.locator('nav').boundingBox();
    expect(careBox!.y + careBox!.height).toBeLessThanOrEqual(bottomNavBox!.y + 1);
    const detailDimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(detailDimensions.document).toBeLessThanOrEqual(viewport.width);
    expect(detailDimensions.body).toBeLessThanOrEqual(viewport.width);
    await careAction.click();
    const closureAction = page.getByRole('button', { name: 'Confirm Closure · Simulated' });
    await closureAction.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect(closureAction).toBeVisible();
    const closureBox = await closureAction.boundingBox();
    const closureNavBox = await page.locator('nav').boundingBox();
    expect(closureBox!.y + closureBox!.height).toBeLessThanOrEqual(closureNavBox!.y + 1);
  }
});

test('primary forms and actions have headings, labels, names, and keyboard access', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('button').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Frontline Worker' })).toBeFocused();
  await page.getByRole('button', { name: 'Frontline Worker' }).click();
  await page.goto('/facility/referral/REF-2026-00125');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByLabel('Referral token')).toBeVisible();
  await expect(page.getByLabel('Handshake passcode')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verify Handshake · Simulated' })).toBeVisible();
});
