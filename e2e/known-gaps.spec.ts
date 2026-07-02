import { expect, test } from "./fixtures";

// These two need a production-mode Playwright harness: in demo mode
// requireCafeMember short-circuits to a fake owner, so the /login redirect
// never fires. Tracked in docs/KNOWN_GAPS.md under Testing.
test.fixme("owner routes require authentication", async ({ appPage }) => {
  await appPage.goto("/dashboard");
  await expect(appPage).toHaveURL(/\/login/);
});

test.fixme("staff routes require authentication", async ({ appPage }) => {
  await appPage.goto("/staff/orders");
  await expect(appPage).toHaveURL(/\/login/);
});
