import { expect, resetDemoState, test } from "./fixtures";

test("owner manages menu availability and customer-facing visibility", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard");

  await expect(
    appPage.getByRole("heading", { name: "Pilot operations" }),
  ).toBeVisible();
  await expect(appPage.getByText("REVENUE TODAY")).toBeVisible();
  await expect(
    appPage.getByText("Launch checklist", { exact: true }),
  ).toBeVisible();

  await appPage.goto("/dashboard/menu");
  await appPage.getByLabel("New category name").fill("Seasonal");
  await appPage.getByRole("button", { name: "Add category" }).click();
  await expect(appPage.getByLabel("Seasonal category name")).toBeVisible();

  await appPage.getByLabel("New category name").fill(" seasonal ");
  await appPage.getByRole("button", { name: "Add category" }).click();
  await expect(
    appPage.getByText("Category names must be unique."),
  ).toBeVisible();

  await appPage.getByLabel("Name", { exact: true }).fill("Midnight Mocha");
  await expect(appPage.getByText("Customer menu preview")).toBeVisible();
  await expect(
    appPage.locator(".card--spine").getByText("Midnight Mocha"),
  ).toBeVisible();
  await appPage
    .getByLabel("Description", { exact: true })
    .fill("Dark cocoa · espresso · smoked salt");
  await appPage.getByLabel("Price (USD)", { exact: true }).fill("7.25");
  await expect(appPage.locator(".card--spine")).toContainText("$7.25");
  await appPage.getByRole("button", { name: "Save item" }).click();

  let itemRow = appPage
    .locator("div.rounded-lg.border.p-4")
    .filter({ hasText: "Midnight Mocha" });
  await expect(itemRow).toContainText("$7.25");
  await expect(itemRow).toContainText("Active");

  await itemRow.getByRole("button", { name: "Edit" }).click();
  await appPage.getByLabel("Price (USD)", { exact: true }).fill("7.50");
  await appPage.getByRole("button", { name: "Update item" }).click();

  itemRow = appPage
    .locator("div.rounded-lg.border.p-4")
    .filter({ hasText: "Midnight Mocha" });
  await expect(itemRow).toContainText("$7.50");

  await itemRow.getByRole("button", { name: "Hide" }).click();
  await expect(itemRow).toContainText("Hidden");
  await appPage.goto("/cafe/black-rabbit/order");
  await expect(
    appPage.getByText("Midnight Mocha", { exact: true }),
  ).toHaveCount(0);

  await appPage.goto("/dashboard/menu");
  itemRow = appPage
    .locator("div.rounded-lg.border.p-4")
    .filter({ hasText: "Midnight Mocha" });
  await itemRow.getByRole("button", { name: "Activate" }).click();
  await appPage.goto("/cafe/black-rabbit/order");
  await expect(
    appPage.getByText("Midnight Mocha", { exact: true }),
  ).toBeVisible();
});

test("owner customer and reward views render", async ({ appPage }) => {
  await resetDemoState(appPage);

  await appPage.goto("/dashboard/customers");
  await expect(
    appPage.getByRole("heading", { name: "126 regulars & counting." }),
  ).toBeVisible();
  await expect(appPage.getByText("Jordan Lee")).toBeVisible();

  await appPage.goto("/dashboard/rewards");
  await expect(appPage.getByText("Rewards earned")).toBeVisible();
  await expect(
    appPage.getByText("Redeem a reward", { exact: true }),
  ).toBeVisible();
});

test("owner sees seeded launch readiness in demo mode", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard/setup");

  await expect(
    appPage.getByRole("heading", { name: "Launch readiness" }),
  ).toBeVisible();
  await expect(
    appPage.getByText("Demo mode is on.", { exact: false }),
  ).toBeVisible();
  await expect(appPage.getByText("Cafe profile", { exact: true })).toBeVisible();
  await expect(
    appPage.getByText("Demo mode always simulates an open, orderable cafe."),
  ).toBeVisible();
  await expect(appPage.getByText("Payments", { exact: true })).toBeVisible();
  await expect(
    appPage.getByText("Loyalty & SMS", { exact: true }),
  ).toBeVisible();
  await expect(
    appPage.getByText("Twilio Verify is configured directly in the"),
  ).toBeVisible();
});

test("owner manages tables and QR links in demo mode", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard/tables");

  await appPage.getByLabel("New table label").fill("9");
  await appPage.getByRole("button", { name: "Add table" }).click();
  await expect(appPage.getByLabel("9 table label")).toBeVisible();

  await appPage.getByLabel("New table label").fill(" 9 ");
  await appPage.getByRole("button", { name: "Add table" }).click();
  await expect(
    appPage.getByText("Table labels must be unique."),
  ).toBeVisible();

  const tableRow = appPage
    .locator("div.rounded-lg.border.p-4")
    .filter({ has: appPage.getByLabel("9 table label") });
  await tableRow.getByRole("button", { name: "Copy link" }).click();
  await expect(tableRow.getByText(/\/cafe\/black-rabbit\/order\?t=9/)).toBeVisible();
});

test("owner manages staff access in demo mode", async ({ appPage }) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard/staff");

  await expect(
    appPage.getByRole("heading", { name: "Staff access" }),
  ).toBeVisible();
  await expect(appPage.getByText("Dustin")).toBeVisible();

  await appPage.getByLabel("Name").fill("Priya Staff");
  await appPage.getByLabel("Phone").fill("555-0199");
  await appPage.getByRole("button", { name: "Add staff" }).click();

  await expect(appPage.getByText("Priya Staff")).toBeVisible();
  const staffRow = appPage
    .locator("div.rounded-lg.border.p-4")
    .filter({ hasText: "Priya Staff" });
  await staffRow.getByRole("button", { name: /Remove/ }).click();
  await expect(appPage.getByText("Priya Staff")).not.toBeVisible();
});

test("owner sees seeded pilot metrics and launch checklist in demo mode", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard");

  await expect(
    appPage.getByRole("heading", { name: "Pilot operations" }),
  ).toBeVisible();

  // Demo seed: 4 orders (2 paid, 1 refunded, 1 failed), 1 failed payment.
  await expect(appPage.getByText("ORDERS TODAY")).toBeVisible();
  await expect(appPage.getByText("FAILED PAYMENTS TODAY")).toBeVisible();
  await expect(
    appPage.getByText("1 payment failed today.", { exact: false }),
  ).toBeVisible();

  await expect(appPage.getByText("Most ordered (recent)")).toBeVisible();
  await expect(appPage.getByText("The Plague")).toBeVisible();

  await expect(appPage.getByText("Menu ready", { exact: true })).toBeVisible();
  await expect(appPage.getByText("Demo walkthrough")).toBeVisible();
  await expect(
    appPage.getByText("Sandbox payment test"),
  ).toBeVisible();
  await expect(appPage.getByText("Manual step").first()).toBeVisible();
});
