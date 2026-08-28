import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import axe from "axe-core";

const base = (process.argv[2] ?? "https://remote-file-handoff-manifest.sociobot.in").replace(/\/$/, "");
const output = resolve(process.argv[3] ?? "artifacts/live-polish-2");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-gpu"] });
const evidence = { base, checkedAt: new Date().toISOString(), routes: {}, links: [], consoleErrors: [] };

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.addInitScript({ content: axe.source });
  page.on("console", (message) => {
    const expectedMissingRouteError = page.url().includes("missing-polish-2") && message.text().includes("status of 404");
    if (message.type() === "error" && !expectedMissingRouteError) evidence.consoleErrors.push(message.text());
  });

  const home = await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(home?.status(), 200);
  assert.equal(await page.title(), "Remote File Handoff Manifest — verify every file");
  assert.equal(await page.locator("h1").innerText(), "Verify every file in a folder handoff.");
  assert.match(await page.locator(".lede").innerText(), /freelancers and small teams/);
  assert.equal(await page.locator(".hero .button.primary").count(), 1);
  assert.equal(await page.locator(".action-note").innerText(), "Opens a failed handoff with exact missing, changed, and extra paths.");
  await page.screenshot({ path: resolve(output, "home-mobile.png"), fullPage: true });
  await page.evaluate(() => localStorage.setItem("real:polish-2", "keep"));

  const requestOrigins = [];
  page.on("request", (request) => requestOrigins.push(new URL(request.url()).origin));
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.waitForURL("**/demo/");
  await page.locator(".demo-result-details").getByText("notes/unrequested.txt").waitFor();
  assert.equal(await page.getByText("Demo — sample data, nothing is saved").count(), 1);
  assert.equal(await page.evaluate(() => localStorage.getItem("real:polish-2")), "keep");
  for (const selector of ["#demo-recording", ".demo-result-details li"]) {
    assert.equal(await page.locator(selector).first().evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.bottom > 0 && box.top < innerHeight;
    }), true);
  }
  const result = await page.locator(".demo-result-details").innerText();
  assert.match(result, /exports\/delivery-checklist\.txt/);
  assert.match(result, /brand\/logo-notes\.md/);
  assert.match(result, /notes\/unrequested\.txt/);
  assert.equal(requestOrigins.every((origin) => origin === new URL(base).origin), true);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.locator(".demo-result-details").getByText("notes/unrequested.txt").waitFor();
  assert.equal(await page.getByRole("link", { name: "Start for real" }).getAttribute("href"), "/");
  await page.screenshot({ path: resolve(output, "demo-mobile.png"), fullPage: true });

  await page.goto(base + "/#how");
  await page.locator("#how").scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollBy(0, 137));
  const priorScroll = await page.evaluate(() => scrollY);
  await page.evaluate(() => document.querySelector('.site-header a[href="/privacy/"]').click());
  await page.waitForURL("**/privacy/");
  assert.doesNotMatch(await page.locator("main").innerText(), /short-lived/);
  assert.match(await page.locator("main").innerText(), /does not control the host’s request or security logs/);
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.activeElement === document.querySelector("h1"));
  await page.waitForFunction((expected) => Math.abs(scrollY - expected) < 8, priorScroll);

  for (const route of ["/", "/demo/", "/privacy/", "/terms/", "/missing-polish-2"]) {
    const response = await page.goto(base + route, { waitUntil: "networkidle" });
    const expectedStatus = route.includes("missing") ? 404 : 200;
    assert.equal(response?.status(), expectedStatus);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("main").count(), 1);
    const violations = await page.evaluate(async () => (await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    })).violations.filter((item) => ["serious", "critical"].includes(item.impact)).map((item) => item.id));
    assert.deepEqual(violations, []);
    evidence.routes[route] = { status: response.status(), title: await page.title(), axeSeriousCritical: violations.length };
  }
  assert.doesNotMatch(await page.goto(base + "/terms/").then(() => page.locator("main").innerText()), /Material changes appear here/);
  await page.goto(base + "/missing-polish-2");
  await page.screenshot({ path: resolve(output, "not-found-mobile.png"), fullPage: true });

  await page.goto(base, { waitUntil: "networkidle" });
  const hrefs = await page.locator("a[href]").evaluateAll((links) => [...new Set(links.map((link) => link.href).filter((href) => href.startsWith("http")))]);
  for (const href of hrefs) {
    const response = await context.request.get(href);
    assert.equal(response.status() >= 200 && response.status() < 400, true, href + " returned " + response.status());
    evidence.links.push({ href, status: response.status() });
  }
  assert.deepEqual(evidence.consoleErrors, []);
  await context.close();

  const offline = await browser.newContext();
  const offlinePage = await offline.newPage();
  await offlinePage.goto(base + "/demo/", { waitUntil: "networkidle" });
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  await offlinePage.reload({ waitUntil: "networkidle" });
  assert.equal(await offlinePage.evaluate(() => Boolean(navigator.serviceWorker.controller)), true);
  await offline.setOffline(true);
  assert.equal((await offlinePage.reload({ waitUntil: "domcontentloaded" }))?.ok(), true);
  await offlinePage.locator(".demo-result-details").getByText("notes/unrequested.txt").waitFor();
  evidence.offlineDemo = true;
  await offline.close();

  await writeFile(resolve(output, "live-check.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
