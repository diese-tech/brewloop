import { expect, resetDemoState, test } from "./fixtures";

test.fixme(
  "new loyalty signups appear in the owner customer list",
  async ({ appPage }) => {
    await resetDemoState(appPage);
    await appPage.goto("/cafe/black-rabbit/rewards");
    await appPage.getByLabel("Phone or email").fill("owner-sync@example.com");
    await appPage.getByLabel("Name (optional)").fill("Owner Sync Test");
    await appPage.getByRole("button", { name: "Join / check rewards" }).click();

    await appPage.goto("/dashboard/customers");
    await expect(appPage.getByText("Owner Sync Test")).toBeVisible();
  },
);

test.fixme("owner can look up and redeem a reward", async ({ appPage }) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard/rewards");
  await appPage.getByPlaceholder("Phone or email").fill("jordan@example.com");
  await appPage.getByRole("button", { name: "Look up member" }).click();

  await expect(appPage.getByText("Jordan Lee")).toBeVisible();
  await expect(
    appPage.getByRole("button", { name: "Redeem reward" }),
  ).toBeVisible();
});

test.fixme("owner routes require authentication", async ({ appPage }) => {
  await appPage.goto("/dashboard");
  await expect(appPage).toHaveURL(/\/login/);
});

test.fixme("staff routes require authentication", async ({ appPage }) => {
  await appPage.goto("/staff/orders");
  await expect(appPage).toHaveURL(/\/login/);
});
