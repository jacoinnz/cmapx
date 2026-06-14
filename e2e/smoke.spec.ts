import { test, expect } from "@playwright/test";

// End-to-end smoke: complete the whole wizard, reach results, export the PDF.
// Runs against the built static export (see playwright.config webServer).
test("complete the assessment and export a PDF report", async ({ page }) => {
  await page.goto("/");

  // Landing
  await expect(
    page.getByRole("heading", { name: /How strong is your business/i })
  ).toBeVisible();
  await expect(page.getByText(/We store nothing/i)).toBeVisible();

  // Walk all six sections, answering "Yes" to every question, then advancing.
  for (let section = 0; section < 6; section++) {
    const yesButtons = page.getByRole("button", { name: "Yes", exact: true });
    await expect(yesButtons.first()).toBeVisible();
    const count = await yesButtons.count();
    for (let i = 0; i < count; i++) {
      await yesButtons.nth(i).click();
    }

    const advance = page.getByRole("button", { name: /Next|See my results/ });
    await expect(advance).toBeEnabled();
    await advance.click();
  }

  // Results: all "Yes" => top maturity level.
  await expect(page.locator(".maturity-level")).toHaveText("Strong");
  await expect(page.getByText(/Level 5 of 5/i)).toBeVisible();

  // Radar chart rendered (Recharts emits an SVG surface).
  await expect(page.locator("svg.recharts-surface")).toBeVisible();

  // SWOT + insurance sections present.
  await expect(page.getByText(/Strengths/i).first()).toBeVisible();
  await expect(
    page.getByText(/Strong case for cyber liability insurance/i)
  ).toBeVisible();
  // Privacy Act 2020 surfaced in the threats/insurance reasoning.
  await expect(page.getByText(/Privacy Act 2020/i).first()).toBeVisible();
  // Disclaimer present.
  await expect(page.getByText(/not financial or insurance advice/i)).toBeVisible();

  // Export: clicking the button produces a PDF download in the browser.
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download my report/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("my-cyber-maturity-report.pdf");
});
