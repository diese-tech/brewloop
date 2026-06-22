import { expect, resetDemoState, test } from "./fixtures";

test("owner manages menu availability and customer-facing visibility", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/dashboard");

  await expect(
    appPage.getByRole("heading", { name: "Good evening, Dustin." }),
  ).toBeVisible();
  await expect(appPage.getByText("SALES TODAY")).toBeVisible();

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
  await appPage
    .getByLabel("Description", { exact: true })
    .fill("Dark cocoa · espresso · smoked salt");
  await appPage.getByLabel("Price (USD)", { exact: true }).fill("7.25");
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
