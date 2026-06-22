import { expect, resetDemoState, test } from "./fixtures";

test.describe("customer experience", () => {
  test.beforeEach(async ({ appPage }) => {
    await resetDemoState(appPage);
  });

  test("loads the portal and joins loyalty", async ({ appPage }) => {
    await expect(
      appPage.getByRole("heading", { name: "Enter the rabbit hole." }),
    ).toBeVisible();
    await expect(
      appPage.getByRole("link", { name: /Join \/ check rewards/ }),
    ).toBeVisible();
    await expect(
      appPage.getByRole("link", { name: "Order now" }),
    ).toBeVisible();

    await appPage.goto("/cafe/black-rabbit/rewards");
    await appPage.getByLabel("Phone or email").fill("customer@example.com");
    await appPage.getByLabel("Name (optional)").fill("Customer Test");
    await appPage.getByRole("button", { name: "Join / check rewards" }).click();

    await expect(appPage.getByText("Welcome, Customer Test.")).toBeVisible();

    await appPage.reload();
    await appPage.getByLabel("Phone or email").fill("customer@example.com");
    await appPage.getByRole("button", { name: "Join / check rewards" }).click();
    await expect(appPage.getByText("Welcome, Customer Test.")).toBeVisible();
  });

  test("submits and pays for a pickup order", async ({ appPage }) => {
    await appPage.goto("/cafe/black-rabbit/order");

    await appPage
      .getByRole("button", { name: "Add one Be My Frankenstein" })
      .click();
    await appPage.getByLabel("Name", { exact: true }).fill("Pickup Test");
    await appPage.getByLabel("Phone (optional)").fill("555-0110");
    await appPage.getByLabel("Notes").fill("Oat milk, extra hot");
    await appPage.getByRole("button", { name: "Continue to payment" }).click();

    await expect(
      appPage.getByRole("heading", { name: "Pay for your order." }),
    ).toBeVisible();
    await appPage.getByRole("button", { name: "20%" }).click();
    await expect(
      appPage.getByRole("button", { name: "Pay $7.80" }),
    ).toBeVisible();
    await appPage.getByRole("button", { name: "Pay $7.80" }).click();

    await expect(
      appPage.getByRole("heading", { name: "You’re in the queue." }),
    ).toBeVisible();
    await expect(appPage.getByText("Pickup", { exact: true })).toBeVisible();
    await expect(appPage.getByText("Total paid")).toBeVisible();
    await expect(appPage.getByText("$7.80", { exact: true })).toBeVisible();
    await expect(appPage.getByText(/Visa ••42/i)).toBeVisible();
  });

  test("preserves the table number and submits a table order", async ({
    appPage,
  }) => {
    await appPage.goto("/cafe/black-rabbit/order?t=12");

    await expect(appPage.getByLabel("Table number")).toHaveValue("12");
    await appPage.getByRole("button", { name: "Add one Ghost Malone" }).click();
    await appPage.getByLabel("Name", { exact: true }).fill("Table Test");
    await appPage.getByRole("button", { name: "Continue to payment" }).click();
    await appPage.getByRole("button", { name: /Pay \$/ }).click();

    await expect(
      appPage.getByText("Table 12", { exact: true }).last(),
    ).toBeVisible();
    await expect(appPage.getByText("Total paid")).toBeVisible();
  });
});
