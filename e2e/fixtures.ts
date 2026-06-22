import {
  expect,
  test as base,
  type ConsoleMessage,
  type Page,
} from "@playwright/test";

type AppFixtures = {
  appPage: Page;
};

function consoleError(message: ConsoleMessage) {
  return message.type() === "error" ? message.text() : null;
}

export const test = base.extend<AppFixtures>({
  appPage: async ({ page }, runFixture) => {
    const errors: string[] = [];

    page.on("console", (message) => {
      const error = consoleError(message);
      if (error) errors.push(error);
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await runFixture(page);

    expect(errors, "Browser console and page errors").toEqual([]);
  },
});

export { expect };

export async function resetDemoState(page: Page) {
  await page.goto("/cafe/black-rabbit");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
}
