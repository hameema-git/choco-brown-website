import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ viewport: { width: 1440, height: 1000 } });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
});

test("menu filters and full menu show the right products", async ({ page }) => {
  await expect(page.locator(".product")).toHaveCount(4);
  await page.getByRole("button", { name: "Donuts", exact: true }).click();
  await expect(page.locator(".product")).toHaveCount(2);
  await expect(page.locator(".product").first()).toContainText(
    "Chocolate Donut",
  );
  await page.getByRole("button", { name: "Filled buns", exact: true }).click();
  await expect(page.locator(".product")).toHaveCount(4);
  await expect(page.locator(".product").last()).toContainText(
    "White Chocolate Bun",
  );
  await page.getByRole("button", { name: "See the full menu" }).click();
  await expect(page.locator(".product")).toHaveCount(6);
  await page.getByRole("button", { name: "Back to the favourites" }).click();
  await expect(page.locator(".product")).toHaveCount(4);
});

test("product details, quantity controls, totals, and removing items work", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "View Milk Chocolate Bun details" })
    .click();
  const detail = page.getByRole("dialog", { name: "Milk Chocolate Bun" });
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("allergens");
  await detail.getByRole("button", { name: "Add a little happiness" }).click();
  await expect(detail).not.toBeVisible();
  await page
    .getByRole("button", { name: "Open your bag, 1 item", exact: true })
    .click();
  const bag = page.getByRole("dialog");
  await expect(bag.locator(".order-total strong")).toHaveText("\u20b935");
  await bag.getByRole("button", { name: "Add one Milk Chocolate Bun" }).click();
  await expect(bag.locator(".order-total strong")).toHaveText("\u20b970");
  await bag
    .getByRole("button", { name: "Remove one Milk Chocolate Bun" })
    .click();
  await expect(bag.locator(".order-total strong")).toHaveText("\u20b935");
  await bag
    .getByRole("button", { name: "Remove Milk Chocolate Bun from bag" })
    .click();
  await expect(bag).toContainText("A lot of possibility.");
  await bag.getByRole("button", { name: "Explore the menu" }).click();
  await expect(bag).not.toBeVisible();
});

test("cart survives a refresh and storage rejects unknown or invalid items", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Classic Cream Bun to bag" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open your bag, 1 item", exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "choco-brown-bag",
      JSON.stringify({
        "milk-choco": 2,
        "cream-bun": -3,
        unknown: 9,
        "choco-donut": 999,
        "dark-choco": "3",
      }),
    ),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open your bag, 2 items", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("choco-brown-bag") || "{}"),
    ),
  ).toEqual({ "milk-choco": 2 });
  await page.evaluate(() =>
    localStorage.setItem("choco-brown-bag", "not valid json"),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open your bag, 0 items", exact: true }),
  ).toBeVisible();
});

test("WhatsApp checkout validates the name and prepares the full order request", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Milk Chocolate Bun to bag" })
    .click();
  await page
    .getByRole("button", { name: "Add Classic Cream Bun to bag" })
    .click();
  await page
    .getByRole("button", { name: "Open your bag, 2 items", exact: true })
    .click();
  const bag = page.getByRole("dialog");
  await bag.getByRole("button", { name: "Continue to pickup" }).click();
  await bag.getByLabel("Your name").fill("  ");
  await bag.getByRole("button", { name: "Request on WhatsApp" }).click();
  await expect(bag.getByRole("alert")).toContainText(
    "Please tell us your name",
  );
  await bag.getByLabel("Your name").fill("Anu");
  await bag.getByLabel("Preferred store").selectOption("Eroor");
  await bag.getByLabel("Pickup day").selectOption("Tomorrow");
  await bag.getByLabel("Pickup time", { exact: true }).fill("16:30");
  await bag.getByLabel("A little note").fill("Pickup around 4 pm, please.");
  await page.evaluate(() => {
    window.open = (url) => {
      document.documentElement.dataset.openedUrl = String(url);
      return null;
    };
  });
  await bag.getByRole("button", { name: "Request on WhatsApp" }).click();
  await expect(
    bag.getByRole("heading", { name: "Your request is ready." }),
  ).toBeVisible();
  await expect(bag).toContainText("not a confirmed order");
  const url = new URL(
    await page.evaluate(() => document.documentElement.dataset.openedUrl || ""),
  );
  expect(url.origin + url.pathname).toBe("https://wa.me/917025454597");
  const message = url.searchParams.get("text");
  expect(message).toContain("*NEW ORDER - CHOCO BROWN*");
  expect(message).toContain("Name: Anu");
  expect(message).toContain("Type: Pickup");
  expect(message).toContain("Store: Eroor");
  expect(message).toContain("Pickup: Tomorrow, 4:30 PM");
  expect(message).toContain("Please confirm my order.");
  expect(message).toContain("1. Milk Chocolate Bun x 1 = \u20b935");
  expect(message).toContain("2. Classic Cream Bun x 1 = \u20b925");
  expect(message).toContain("*Total: \u20b960*");
  expect(message).toContain("Note: Pickup around 4 pm, please.");
  const fallbackLink = await bag
    .getByRole("link", { name: "Open WhatsApp again" })
    .getAttribute("href");
  expect(new URL(fallbackLink || "").href).toBe(url.href);
});

test("delivery options open the proper external platforms", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Order online", exact: true }).click();
  const bag = page.getByRole("dialog");
  await expect(bag).toContainText("Your craving. Your couch.");
  await expect(bag.getByRole("link", { name: /swiggy/ })).toHaveAttribute(
    "href",
    "https://www.swiggy.com/search?query=Choco%20Brown",
  );
  await expect(bag.getByRole("link", { name: /zomato/ })).toHaveAttribute(
    "href",
    "https://www.zomato.com/kochi/choco-brown-vennala",
  );
  await bag.getByRole("button", { name: /Rather pick it up/ }).click();
  await expect(bag).toContainText("A lot of possibility.");
});

test("locations and review highlights are interactive", async ({ page }) => {
  await page.getByRole("button", { name: /02 Eroor/ }).click();
  await expect(page.locator("#store-1")).toContainText("Pulse Nagar Road");
  await expect(
    page.locator("#store-1").getByRole("link", { name: "Get directions" }),
  ).toHaveAttribute("href", /destination=Choco%20Brown%20Eroor%20Kochi/);
  await expect(page.locator("#store-0")).toHaveCount(0);
  await expect(page.locator(".testimonial-card")).toHaveCount(3);
  await expect(page.locator(".testimonial-card").first()).toContainText(
    "ON OUR BUNS",
  );
  await expect(
    page.getByRole("link", { name: /Read Google reviews/ }),
  ).toHaveAttribute("href", /google\.com\/maps\/search/);
  await expect(
    page.getByRole("link", { name: /Read Zomato reviews/ }),
  ).toHaveAttribute("href", /zomato\.com\/kochi\/choco-brown-vennala/);
});

test("store maps offer alternatives when Google is blocked", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const store = page.locator("#store-0");
  if ((await store.count()) === 0) {
    await page.getByRole("button", { name: /01 Vennala/ }).click();
  }
  await expect(store).toContainText("Arakkakadavu Road");
  const frame = store.locator(".store-map iframe");
  await expect(frame).toHaveAttribute(
    "src",
    /openstreetmap\.org\/export\/embed\.html/,
  );
  await expect(
    store.getByRole("link", { name: /OpenStreetMap directions/ }),
  ).toHaveAttribute("href", /openstreetmap\.org\/directions\?to=/);
  await expect(
    store.getByRole("link", { name: /Google search/ }),
  ).toHaveAttribute("href", /google\.com\/maps\/search/);
  await expect(store).toContainText(/If Google Maps shows/);
  await store.getByRole("button", { name: /Copy address/ }).click();
  await expect(store.getByRole("status")).toContainText("Address copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Arakkakadavu Road",
  );
});

test("dialogs trap keyboard focus, close on Escape, and restore scrolling", async ({
  page,
}) => {
  const opener = page.getByRole("button", {
    name: "Open your bag, 0 items",
    exact: true,
  });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("quantity limits prevent oversized accidental orders", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "choco-brown-bag",
      JSON.stringify({ "milk-choco": 20 }),
    ),
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Add one Milk Chocolate Bun" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Open your bag, 20 items", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Add one Milk Chocolate Bun" }),
  ).toBeDisabled();
});

test("responsive layouts never overflow horizontally", async ({ page }) => {
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(100);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("mobile navigation and pickup bag work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Our menu" })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Add Dark Chocolate Bun to bag" })
    .click();
  await page
    .getByRole("button", { name: "Open your bag, 1 item", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue to pickup" }).click();
  await expect(page.getByRole("dialog").getByLabel("Your name")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((element) => element.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await page.getByRole("button", { name: "Close order bag" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the storefront passes automated accessibility checks", async ({
  page,
}) => {
  for (const section of ["#menu", "#story", ".love-section", "#visit"]) {
    await page.locator(section).scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(500);
  const desktop = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(desktop.violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.waitForTimeout(250);
  const mobile = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(mobile.violations).toEqual([]);
});

test("pickup and delivery dialogs pass automated accessibility checks", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Milk Chocolate Bun to bag" })
    .click();
  await page
    .getByRole("button", { name: "Open your bag, 1 item", exact: true })
    .click();
  for (const state of ["bag", "details", "delivery"]) {
    if (state === "details")
      await page.getByRole("button", { name: "Continue to pickup" }).click();
    if (state === "delivery")
      await page.getByRole("button", { name: "Get it delivered" }).click();
    await page.waitForTimeout(200);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
