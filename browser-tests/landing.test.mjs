import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import test from "node:test";
import { chromium } from "playwright";
import axe from "axe-core";

const dist = join(process.cwd(), "dist/site");
const artifacts = join(process.cwd(), "artifacts");

function contentType(pathname) {
  return { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" }[extname(pathname)] ?? "application/octet-stream";
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    const candidate = normalize(join(dist, pathname));
    if (!pathname.endsWith("/") && statSync(candidate, { throwIfNoEntry: false })?.isDirectory()) {
      response.writeHead(301, { location: `${pathname}/` }).end();
      return;
    }
    if (pathname.endsWith("/")) pathname += "index.html";
    const path = normalize(join(dist, pathname));
    if (!path.startsWith(`${dist}/`) || !statSync(path, { throwIfNoEntry: false })?.isFile()) {
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end(await readFile(join(dist, "404.html")));
      return;
    }
    response.writeHead(200, { "content-type": contentType(path) });
    response.end(await readFile(path));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
}

test("first screen names the audience and offers one honest sample action at desktop and mobile", async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ args: ["--disable-gpu"] });
  await mkdir(artifacts, { recursive: true });
  try {
    for (const viewport of [{ width: 390, height: 844, name: "mobile" }, { width: 1440, height: 900, name: "desktop" }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      await page.goto(server.url, { waitUntil: "networkidle" });
      assert.equal(await page.locator("h1").innerText(), "Verify every file in a folder handoff.");
      assert.match(await page.locator(".lede").innerText(), /freelancers and small teams/);
      assert.equal(await page.getByRole("link", { name: "Try it with sample data" }).getAttribute("href"), "/?demo=1");
      assert.equal(await page.locator(".hero .button.primary").count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
      await page.screenshot({ path: join(artifacts, `home-${viewport.name}.png`), fullPage: true });
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); await server.close(); }
});

test("all routes have unique metadata, one h1, shared navigation, large targets, and no serious axe issues", async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ args: ["--disable-gpu"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const titles = new Set();
  try {
    for (const route of ["/", "/demo/", "/privacy/", "/terms/", "/missing-review-path"]) {
      const response = await page.goto(`${server.url}${route}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), route.includes("missing") ? 404 : 200);
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
      assert.equal(await page.locator('meta[property="og:image"]').count(), 1);
      assert.equal(await page.locator('meta[name="twitter:card"]').count(), 1);
      assert.equal(await page.locator('link[rel="apple-touch-icon"]').count(), 1);
      titles.add(await page.title());
      assert.equal(await page.getByRole("link", { name: "Handoff home" }).count(), 1);
      assert.equal(await page.getByRole("link", { name: "Privacy", exact: true }).count() >= 1, true);
      const smallTargets = await page.locator("a:visible, button:visible, input:visible").evaluateAll((items) => items.filter((item) => {
        const box = item.getBoundingClientRect();
        return box.width < 44 || box.height < 44;
      }).map((item) => ({ text: item.textContent?.trim(), tag: item.tagName, width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })));
      assert.deepEqual(smallTargets, []);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } })).violations.filter((item) => ["serious", "critical"].includes(item.impact)).map((item) => item.id));
      assert.deepEqual(violations, []);
    }
    assert.equal(titles.size, 5);
  } finally { await browser.close(); await server.close(); }
});

test("demo direct links, reset, navigation focus, back focus, and not-found routing work", async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ args: ["--disable-gpu"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(`${server.url}/?demo=1`);
    await page.waitForURL("**/demo/");
    assert.equal(await page.title(), "Demo — Remote File Handoff Manifest");
    assert.equal(await page.getByText("Demo — sample data, nothing is saved").count(), 1);
    await page.screenshot({ path: join(artifacts, "demo-mobile.png"), fullPage: true });
    await page.getByRole("link", { name: "Privacy", exact: true }).first().click();
    await page.waitForURL("**/privacy/");
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector("h1")), true);
    await page.goBack();
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector("h1")), true);
    const missing = await page.goto(`${server.url}/definitely-missing-review-1`);
    assert.equal(missing?.status(), 404);
    assert.equal(await page.locator("h1").innerText(), "This handoff path is missing.");
    assert.equal(await page.getByRole("link", { name: "Return home" }).getAttribute("href"), "/");
    await page.screenshot({ path: join(artifacts, "not-found-mobile.png"), fullPage: true });
  } finally { await browser.close(); await server.close(); }
});

test("production service worker controls home and demo offline", async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ args: ["--disable-gpu"] });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${server.url}/demo/`, { waitUntil: "networkidle" });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), true);
    await context.setOffline(true);
    assert.equal((await page.reload({ waitUntil: "domcontentloaded" }))?.ok(), true);
    assert.match(await page.locator("h1").innerText(), /sample handoff/);
  } finally { await browser.close(); await server.close(); }
});

test("deployment configuration has security headers, immutable assets, and a real 404 rule", async () => {
  const config = JSON.parse(await readFile(join(dist, "staticwebapp.config.json"), "utf8"));
  assert.match(config.globalHeaders["Content-Security-Policy"], /default-src 'self'/);
  assert.match(config.globalHeaders["Permissions-Policy"], /camera=\(\)/);
  assert.match(config.globalHeaders["Strict-Transport-Security"], /max-age=31536000/);
  assert.equal(config.routes.find((entry) => entry.route === "/assets/*")?.headers?.["Cache-Control"], "public, max-age=31536000, immutable");
  assert.equal(config.routes.find((entry) => entry.route === "/sw.js")?.headers?.["Cache-Control"], "no-cache, no-store, must-revalidate");
  assert.deepEqual(config.routes.at(-1), { route: "/*", statusCode: 404 });
  assert.deepEqual(config.responseOverrides["404"], { rewrite: "/404.html" });
  const serviceWorker = await readFile(join(dist, "sw.js"), "utf8");
  assert.doesNotMatch(serviceWorker, /\/demo\/index\.html|\/privacy\/index\.html|\/404\.html/);
});
