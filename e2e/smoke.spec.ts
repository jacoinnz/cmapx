import { test, expect, Page } from "@playwright/test";

// Answer every question in each section with `answerLabel`, advancing until results show.
// Works for any number of sections (business = 6, IT = 8).
async function completeWizard(page: Page, answerLabel: string) {
  for (;;) {
    const buttons = page.getByRole("button", { name: answerLabel, exact: true });
    await expect(buttons.first()).toBeVisible();
    const count = await buttons.count();
    for (let i = 0; i < count; i++) await buttons.nth(i).click();

    const advance = page.getByRole("button", { name: /Next|See my results/ });
    const label = (await advance.textContent()) ?? "";
    await advance.click();
    if (/See my results/.test(label)) break;
  }
}

async function expectPdfDownload(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download my report/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("my-cyber-maturity-report.pdf");
}

test("landing offers both assessment paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Cybersecurity Health Check/i })).toBeVisible();
  await expect(page.getByText(/We store nothing/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Cybersecurity for business owners/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cybersecurity for IT people/i })).toBeVisible();
});

test("business path: complete assessment and export a PDF", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Cybersecurity for business owners/i }).click();
  await expect(page).toHaveURL(/\/business/);

  await completeWizard(page, "Yes");

  await expect(page.getByText("At a glance")).toBeVisible();
  await expect(page.locator(".maturity-level")).toHaveText("Strong");
  await expect(page.locator(".maturity-sub")).toContainText("Level 5 of 5");
  await expect(page.locator("svg.recharts-surface")).toBeVisible();
  await expect(
    page.getByText("Strong case for cyber liability insurance", { exact: true })
  ).toBeVisible();
  await expect(page.getByText(/Privacy Act 2020/i).first()).toBeVisible();
  await expect(page.getByText(/not financial or insurance advice/i)).toBeVisible();

  await expectPdfDownload(page);
});

test("IT path: complete technical assessment with standards coverage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Cybersecurity for IT people/i }).click();
  await expect(page).toHaveURL(/\/it/);

  // 4-level scale; answer "Fully" to everything.
  await completeWizard(page, "Fully");

  await expect(page.getByText("At a glance")).toBeVisible();
  await expect(page.locator(".maturity-level")).toHaveText("Strong");
  await expect(page.locator("svg.recharts-surface")).toBeVisible();
  // Standards coverage matrix is present with the NZ standards.
  await expect(page.getByText(/How you map to NZ standards/i)).toBeVisible();
  const matrix = page.locator(".std-matrix");
  await expect(matrix.getByText("NZISM", { exact: true })).toBeVisible();
  await expect(matrix.getByText("Essential Eight", { exact: true })).toBeVisible();
  // No insurance panel on the IT path.
  await expect(page.getByText(/cyber liability insurance/i)).toHaveCount(0);

  await expectPdfDownload(page);
});
