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
    await expect(appPage.getByText(/Visa ending in 4242/i)).toBeVisible();
  });

  test("removes an item from the order summary", async ({ appPage }) => {
    await appPage.goto("/cafe/black-rabbit/order");

    await appPage
      .getByRole("button", { name: "Add one Be My Frankenstein" })
      .click();
    await appPage.getByLabel("Name", { exact: true }).fill("Remove Test");
    await expect(
      appPage.getByText("1× Be My Frankenstein"),
    ).toBeVisible();
    await expect(
      appPage.getByRole("button", { name: "Continue to payment" }),
    ).toBeEnabled();

    await appPage
      .getByRole("button", { name: "Remove Be My Frankenstein from order" })
      .click();

    await expect(
      appPage.getByText("1× Be My Frankenstein"),
    ).not.toBeVisible();
    await expect(
      appPage.getByText("Add a potion to begin your order."),
    ).toBeVisible();
    await expect(
      appPage.getByRole("button", { name: "Continue to payment" }),
    ).toBeDisabled();
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

  test("opts in to loyalty at checkout and tracks the order afterward", async ({
    appPage,
  }) => {
    await appPage.goto("/cafe/black-rabbit/order");

    await appPage
      .getByRole("button", { name: "Add one Be My Frankenstein" })
      .click();
    await appPage.getByLabel("Name", { exact: true }).fill("Loyalty Test");
    await appPage.getByRole("button", { name: "Continue to payment" }).click();

    await appPage
      .getByLabel("Phone for rewards")
      .fill("555-0199");
    await appPage.getByRole("button", { name: /Pay \$/ }).click();

    await expect(
      appPage.getByRole("heading", { name: "You’re in the queue." }),
    ).toBeVisible();

    await appPage.goto("/cafe/black-rabbit/rewards");
    await appPage.getByLabel("Phone or email").fill("555-0199");
    await appPage.getByRole("button", { name: "Join / check rewards" }).click();
    await expect(appPage.getByText(/Welcome, Loyalty Test\./)).toBeVisible();
  });

  test("tracks a placed order on the order-status page", async ({
    appPage,
  }) => {
    await appPage.goto("/cafe/black-rabbit/order");

    await appPage
      .getByRole("button", { name: "Add one Be My Frankenstein" })
      .click();
    await appPage.getByLabel("Name", { exact: true }).fill("Status Test");
    await appPage.getByRole("button", { name: "Continue to payment" }).click();
    await appPage.getByRole("button", { name: /Pay \$/ }).click();

    await appPage.getByRole("link", { name: "Track your order" }).click();

    await expect(
      appPage.getByRole("heading", { name: /Order #BR-\d+/ }),
    ).toBeVisible();
    await expect(appPage.getByText("Order received")).toBeVisible();
    await expect(appPage.getByText("Paid", { exact: true })).toBeVisible();
    await expect(
      appPage.getByText("1× Be My Frankenstein"),
    ).toBeVisible();
  });
});
