import { expect, resetDemoState, test } from "./fixtures";

test("staff receives and completes a paid customer order", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/cafe/black-rabbit/order");

  await appPage.getByRole("button", { name: "Add one The Plague" }).click();
  await appPage.getByLabel("Name", { exact: true }).fill("Staff Flow Test");
  await appPage.getByLabel("Notes").fill("No citrus");
  await appPage.getByRole("button", { name: "Continue to payment" }).click();
  await appPage.getByRole("button", { name: /Pay \$/ }).click();

  const confirmation = await appPage.locator("body").innerText();
  const orderId = confirmation.match(/#(BR-\d{4})/)?.[1];
  expect(orderId).toBeTruthy();

  await appPage.goto("/staff/orders");
  let orderCard = appPage
    .locator('[data-slot="card"]')
    .filter({ hasText: orderId });

  await expect(orderCard).toContainText("Staff Flow Test");
  await expect(orderCard).toContainText("No citrus");
  await expect(orderCard).toContainText("paid");

  await orderCard.getByRole("button", { name: "Mark making" }).click();
  orderCard = appPage
    .locator('[data-slot="card"]')
    .filter({ hasText: orderId });
  await expect(
    orderCard.getByRole("button", { name: "Mark ready" }),
  ).toBeVisible();

  await orderCard.getByRole("button", { name: "Mark ready" }).click();
  orderCard = appPage
    .locator('[data-slot="card"]')
    .filter({ hasText: orderId });
  await expect(
    orderCard.getByRole("button", { name: "Mark completed" }),
  ).toBeVisible();

  await orderCard.getByRole("button", { name: "Mark completed" }).click();
  const completedColumn = appPage.locator("section").filter({
    has: appPage.getByRole("heading", { name: "Completed" }),
  });
  orderCard = completedColumn
    .locator('[data-slot="card"]')
    .filter({ hasText: orderId });
  await expect(orderCard).toContainText("Staff Flow Test");
  await expect(orderCard.getByRole("button")).toHaveCount(0);

  await appPage.reload();
  const reloadedCompletedColumn = appPage.locator("section").filter({
    has: appPage.getByRole("heading", { name: "Completed" }),
  });
  await expect(
    reloadedCompletedColumn
      .locator('[data-slot="card"]')
      .filter({ hasText: orderId }),
  ).toBeVisible();
});

test("staff board surfaces cancelled and payment-failed orders as problems", async ({
  appPage,
}) => {
  await resetDemoState(appPage);
  await appPage.goto("/staff/orders");

  const problemsColumn = appPage.locator("section").filter({
    has: appPage.getByRole("heading", { name: "Problems" }),
  });
  await expect(problemsColumn).toContainText("Priya");
  await expect(problemsColumn).toContainText("Cancelled");
  await expect(problemsColumn).toContainText("Sam");
  await expect(problemsColumn).toContainText("payment failed");
  await expect(
    problemsColumn.locator('[data-slot="card"]').getByRole("button"),
  ).toHaveCount(0);
});
