import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { join, normalize } from "node:path";
import test from "node:test";
import { chromium } from "playwright";
import axe from "axe-core";

const dist = join(process.cwd(), "dist/site");

function contentType(pathname) {
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const path = normalize(join(dist, pathname));
    if (!path.startsWith(`${dist}/`) || !statSync(path, { throwIfNoEntry: false })?.isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": contentType(path) });
    response.end(await readFile(path));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  return {
    url: `http://localhost:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

async function launchBrowser() {
  return chromium.launch({ args: ["--disable-gpu"] });
}

test("production landing page keeps command scrollers keyboard-accessible and is clean in mobile axe", async () => {
  const server = await startStaticServer();
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(server.url, { waitUntil: "networkidle" });
    const scrollers = page.locator(".tracks code, .terminal pre");
    assert.equal(await scrollers.count(), 4);
    assert.equal(await page.locator(".tracks code").nth(2).innerText(), "handoff verify manifest.json ./files -p sender.pub");
    for (let index = 0; index < await scrollers.count(); index += 1) {
      const scroller = scrollers.nth(index);
      await expectFocusableScroller(scroller);
    }
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
      return result.violations
        .filter((violation) => ["serious", "critical"].includes(violation.impact))
        .map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => node.target) }));
    });
    assert.deepEqual(violations, []);
  } finally {
    await browser.close();
    await server.close();
  }
});

async function expectFocusableScroller(locator) {
  assert.equal(await locator.getAttribute("tabindex"), "0");
  await locator.focus();
  assert.equal(await locator.evaluate((element) => document.activeElement === element), true);
}

test("production landing page registers its service worker, controls a reload, and serves the shell offline", async () => {
  const server = await startStaticServer();
  const browser = await launchBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(server.url, { waitUntil: "networkidle" });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: "networkidle" });
    const { controlled, scriptUrl } = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
      return {
        controlled: Boolean(navigator.serviceWorker.controller),
        scriptUrl: registration?.active?.scriptURL ?? "",
      };
    });
    assert.equal(controlled, true);
    assert.match(scriptUrl, /\/sw\.js$/);
    await context.setOffline(true);
    const offlineResponse = await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(offlineResponse?.ok(), true);
    assert.match(await page.locator("h1").innerText(), /Prove the whole folder arrived/);
  } finally {
    await browser.close();
    await server.close();
  }
});

test("deployment configuration protects responses and keeps versioned assets immutable", async () => {
  const config = JSON.parse(await readFile(join(dist, "staticwebapp.config.json"), "utf8"));
  assert.match(config.globalHeaders["Content-Security-Policy"], /default-src 'self'/);
  assert.match(config.globalHeaders["Permissions-Policy"], /camera=\(\)/);
  assert.match(config.globalHeaders["Strict-Transport-Security"], /max-age=31536000/);
  const headersFor = (route) => config.routes.find((entry) => entry.route === route)?.headers?.["Cache-Control"];
  assert.equal(headersFor("/assets/*"), "public, max-age=31536000, immutable");
  assert.equal(headersFor("/relay-hero.webp"), "public, max-age=31536000, immutable");
  assert.equal(headersFor("/sw.js"), "no-cache, no-store, must-revalidate");
});
