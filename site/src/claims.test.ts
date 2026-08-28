import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, normalize, resolve } from "node:path";
import { chromium, type Browser } from "playwright";
import { createHash } from "node:crypto";

const binary = resolve("target/debug/handoff");
const dist = resolve("dist/site");
let server: Server;
let origin = "";
let browser: Browser;

beforeAll(async () => {
  server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = normalize(join(dist, pathname));
    if (!file.startsWith(`${dist}/`) || !statSync(file, { throwIfNoEntry: false })?.isFile()) {
      response.writeHead(404, { "content-type": "text/html" }).end(readFileSync(join(dist, "404.html")));
      return;
    }
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".json") ? "application/json" : "application/octet-stream";
    response.writeHead(200, { "content-type": type }).end(readFileSync(file));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("test server did not start");
  origin = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ args: ["--disable-gpu"] });
});

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done()));
});

function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), "handoff-claim-"));
  mkdirSync(join(root, "source"));
  return root;
}

function run(args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv; expected?: number } = {}) {
  const result = spawnSync(binary, args, { cwd: options.cwd, env: { ...process.env, ...options.env }, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(options.expected ?? 0);
  return result;
}

describe("public claim contract", () => {
  it("@claim:signed-list-roundtrip creates signed JSON and HTML and reports every discrepancy", () => {
    expect((readFileSync(resolve("Cargo.toml"), "utf8").match(/\[\[bin\]\]/g) ?? []).length).toBe(1);
    const root = workspace();
    const source = join(root, "source");
    writeFileSync(join(source, "alpha.txt"), "alpha\n");
    writeFileSync(join(source, "beta.txt"), "beta\n");
    run(["keygen", "-o", join(root, "sender.key")]);
    run(["create", source, "-k", join(root, "sender.key"), "-o", join(root, "list")]);
    const manifest = JSON.parse(readFileSync(join(root, "list/manifest.json"), "utf8"));
    const html = readFileSync(join(root, "list/manifest.html"), "utf8");
    expect(statSync(join(root, "list/manifest.html")).isFile()).toBe(true);
    expect(html).toMatch(/SIGNED FILE LIST/);
    expect(html).toMatch(/Folder handoff signed file list/);
    expect(html).toMatch(/Signed file list ID/);
    expect(html).not.toMatch(/SIGNED \/\/ RECEIPT|File handoff manifest|This receipt|<dt>Manifest<\/dt>|<h2>Inventory<\/h2>/);
    expect(manifest.payload.files.map((file: { path: string }) => file.path)).toEqual(["alpha.txt", "beta.txt"]);
    expect(manifest.payload.files[0]).toEqual({ path: "alpha.txt", size: 6, sha256: createHash("sha256").update("alpha\n").digest("hex") });
    mkdirSync(join(root, "received"));
    writeFileSync(join(root, "received/alpha.txt"), "changed\n");
    writeFileSync(join(root, "received/extra.txt"), "extra\n");
    const mismatch = run(["--json", "verify", join(root, "list/manifest.json"), join(root, "received"), "-p", join(root, "sender.pub")], { expected: 3 });
    expect(JSON.parse(mismatch.stdout)).toMatchObject({ missing: ["beta.txt"], altered: ["alpha.txt"], unexpected: ["extra.txt"], signature_valid: true });
    manifest.payload.total_bytes += 1;
    writeFileSync(join(root, "list/tampered.json"), JSON.stringify(manifest));
    expect(run(["verify", join(root, "list/tampered.json"), source, "-p", join(root, "sender.pub")], { expected: 4 }).stderr).toMatch(/signature|total/i);
    mkdirSync(join(root, "empty"));
    run(["create", join(root, "empty"), "-k", join(root, "sender.key"), "-o", join(root, "empty-list")]);
    expect(run(["verify", join(root, "empty-list/manifest.json"), join(root, "empty"), "-p", join(root, "sender.pub")]).stdout).toMatch(/0 files/);
  });

  it("@claim:exact-differences-10000 reports only one changed path in a 10,000-file fixture", () => {
    const root = workspace();
    const source = join(root, "source");
    for (let index = 0; index < 10_000; index += 1) writeFileSync(join(source, `item-${String(index).padStart(5, "0")}.txt`), `value ${index}\n`);
    run(["keygen", "-o", join(root, "sender.key")]);
    run(["create", source, "-k", join(root, "sender.key"), "-o", join(root, "list")]);
    writeFileSync(join(source, "item-04217.txt"), "changed\n");
    const result = JSON.parse(run(["--json", "verify", join(root, "list/manifest.json"), source, "-p", join(root, "sender.pub")], { expected: 3 }).stdout);
    expect(result.checked_files).toBe(10_000);
    expect(result.altered).toEqual(["item-04217.txt"]);
    expect(result.missing).toEqual([]);
    expect(result.unexpected).toEqual([]);
  }, 30_000);

  it("@claim:browser-local-private verifies a signed file without uploads, tracking, accounts, or selected-file storage", async () => {
    const runtimeSource = [readFileSync(resolve("src/main.rs"), "utf8"), readFileSync(resolve("src/lib.rs"), "utf8"), readFileSync(resolve("Cargo.toml"), "utf8")].join("\n");
    expect(runtimeSource).not.toMatch(/reqwest|TcpStream|UdpSocket|telemetry|analytics/i);
    const root = workspace();
    writeFileSync(join(root, "source/final.txt"), "approved\n");
    run(["keygen", "-o", join(root, "sender.key")]);
    run(["create", join(root, "source"), "-k", join(root, "sender.key"), "-o", join(root, "list")]);
    const context = await browser.newContext();
    const page = await context.newPage();
    const requests: string[] = [];
    await page.goto(origin, { waitUntil: "networkidle" });
    page.on("request", (request) => requests.push(request.url()));
    await page.evaluate(() => localStorage.setItem("real:marker", "keep"));
    await page.locator("#manifest-file").setInputFiles(join(root, "list/manifest.json"));
    await page.locator("#folder-files").setInputFiles(join(root, "source"));
    await page.locator("#public-key-file").setInputFiles(join(root, "sender.pub"));
    await page.getByRole("button", { name: "Verify selected files" }).click();
    await expect.poll(() => page.locator("#result-title").textContent()).toBe("Selected files match");
    expect(await page.locator("#result-summary").textContent()).toBe("1 file matches the signed file list byte for byte.");
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => ({ keys: Object.keys(localStorage), marker: localStorage.getItem("real:marker") }))).toEqual({ keys: ["real:marker"], marker: "keep" });
    expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
    await context.close();
  });

  it("@claim:isolated-demo opens in one click, shows exact sample paths, and leaves real storage unchanged", async () => {
    const bundledFiles = [
      "examples/client-handoff/brand/logo-notes.md",
      "examples/client-handoff/exports/delivery-checklist.txt",
      "examples/client-handoff/notes/approval.txt",
    ];
    for (const file of bundledFiles) {
      expect(readFileSync(resolve(file), "utf8").trim().length).toBeGreaterThan(40);
      expect(file).toMatch(/\.(md|txt)$/);
    }
    const root = mkdtempSync(join(tmpdir(), "handoff-demo-claim-"));
    writeFileSync(join(root, "real-data.txt"), "keep me");
    const cli = run(["demo"], { cwd: root });
    expect(cli.stdout).toMatch(/temporary workspace/);
    expect(cli.stdout).toMatch(/MISSING: exports\/delivery-checklist\.txt/);
    expect(cli.stdout).toMatch(/CHANGED: brand\/logo-notes\.md/);
    expect(cli.stdout).toMatch(/EXTRA: notes\/unrequested\.txt/);
    expect(readFileSync(join(root, "real-data.txt"), "utf8")).toBe("keep me");
    expect(readdirSync(root)).toEqual(["real-data.txt"]);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin);
    await page.evaluate(() => localStorage.setItem("real:marker", "keep"));
    await page.goto(`${origin}/?demo=1`);
    await expect.poll(() => page.url()).toBe(`${origin}/demo/`);
    await expect.poll(() => page.locator("#demo-result h2").textContent(), { timeout: 4_000 }).toBe("The handoff does not match");
    expect(await page.getByText("Demo — sample data, nothing is saved").count()).toBe(1);
    expect(await page.locator(".demo-result-details").innerText()).toMatch(/exports\/delivery-checklist\.txt[\s\S]*brand\/logo-notes\.md[\s\S]*notes\/unrequested\.txt/);
    expect(await page.evaluate(() => localStorage.getItem("real:marker"))).toBe("keep");
    await page.getByRole("button", { name: "Reset demo" }).click();
    await expect.poll(() => page.locator("#demo-result h2").textContent(), { timeout: 4_000 }).toBe("The handoff does not match");
    expect(await page.getByRole("link", { name: "Start for real" }).getAttribute("href")).toBe("/");
    await context.close();
  });

  it("@claim:offline-reload reopens the demo and completes its check offline after one visit", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${origin}/demo/`, { waitUntil: "networkidle" });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: "networkidle" });
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    const response = await page.reload({ waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBe(true);
    await expect.poll(() => page.locator("#demo-result h2").textContent(), { timeout: 4_000 }).toBe("The handoff does not match");
    await context.close();
  });

  it("@claim:encrypted-outputs encrypts both outputs, hides names, decrypts correctly, and leaves source bytes unchanged", async () => {
    const root = workspace();
    const source = join(root, "source");
    const original = Buffer.from("private client notes\n");
    writeFileSync(join(source, "client-secret.txt"), original);
    run(["keygen", "-o", join(root, "sender.key")]);
    const env = { RFHM_PASSPHRASE: "correct horse battery staple" };
    run(["create", source, "-k", join(root, "sender.key"), "-o", join(root, "private"), "--encrypt"], { env });
    for (const name of ["manifest.json.age", "manifest.html.age"]) {
      const encrypted = readFileSync(join(root, "private", name));
      expect(encrypted.toString("utf8", 0, 64)).toMatch(/age-encryption\.org/);
      expect(encrypted.includes(Buffer.from("client-secret.txt"))).toBe(false);
    }
    run(["verify", join(root, "private/manifest.json.age"), source, "-p", join(root, "sender.pub")], { env });
    expect(readFileSync(join(source, "client-secret.txt"))).toEqual(original);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin);
    await page.locator("#manifest-file").setInputFiles(join(root, "private/manifest.json.age"));
    await page.locator("#folder-files").setInputFiles(source);
    await page.locator("#public-key-file").setInputFiles(join(root, "sender.pub"));
    await page.getByRole("button", { name: "Verify selected files" }).click();
    await expect.poll(() => page.locator("#result-title").textContent()).toBe("Could not verify this handoff");
    expect(await page.locator("#result-summary").innerText()).toMatch(/not valid JSON/);
    await context.close();
  });

  it("@claim:json-script-output emits one parseable object with the documented result fields", () => {
    const root = workspace();
    writeFileSync(join(root, "source/a.txt"), "a");
    const key = JSON.parse(run(["--json", "keygen", "-o", join(root, "sender.key")]).stdout);
    expect(key).toMatchObject({ status: "created" });
    const created = JSON.parse(run(["--json", "create", join(root, "source"), "-k", join(root, "sender.key"), "-o", join(root, "list")]).stdout);
    expect(created).toMatchObject({ status: "created", file_count: 1, encrypted: false });
  });

  it("@claim:package-copy creates a portable directory that verifies separately without changing source files", () => {
    const root = workspace();
    const original = Buffer.from("approved master\n");
    writeFileSync(join(root, "source/master.bin"), original);
    run(["keygen", "-o", join(root, "sender.key")]);
    run(["create", join(root, "source"), "-k", join(root, "sender.key"), "-o", join(root, "list")]);
    run(["package", join(root, "source"), "-m", join(root, "list/manifest.json"), "-o", join(root, "package")]);
    expect(readFileSync(join(root, "source/master.bin"))).toEqual(original);
    expect(readFileSync(join(root, "package/files/master.bin"))).toEqual(original);
    run(["verify", join(root, "package/manifest.json"), join(root, "package/files"), "-p", join(root, "package/signer.pub")]);
  });

  it("@claim:exit-codes returns 0, 1, 2, 3, and 4 for the documented result classes", () => {
    const root = workspace();
    writeFileSync(join(root, "source/a.txt"), "a");
    run(["keygen", "-o", join(root, "sender.key")]);
    run(["create", join(root, "source"), "-k", join(root, "sender.key"), "-o", join(root, "list")]);
    run(["verify", join(root, "list/manifest.json"), join(root, "source"), "-p", join(root, "sender.pub")], { expected: 0 });
    writeFileSync(join(root, "source/a.txt"), "changed");
    run(["verify", join(root, "list/manifest.json"), join(root, "source"), "-p", join(root, "sender.pub")], { expected: 3 });
    const manifest = JSON.parse(readFileSync(join(root, "list/manifest.json"), "utf8"));
    manifest.payload.contact = "tampered@example.test";
    writeFileSync(join(root, "tampered.json"), JSON.stringify(manifest));
    run(["verify", join(root, "tampered.json"), join(root, "source"), "-p", join(root, "sender.pub")], { expected: 4 });
    run(["verify", join(root, "missing.json"), join(root, "source"), "-p", join(root, "sender.pub")], { expected: 1 });
    run(["not-a-command"], { expected: 2 });
  });

  it("@claim:manifest-format enforces version, ordered slash paths, compact payload signatures, fields, and safe relative paths", () => {
    const root = workspace();
    mkdirSync(join(root, "source/nested"));
    writeFileSync(join(root, "source/nested/a.txt"), "a");
    run(["keygen", "-o", join(root, "sender.key")]);
    run(["create", join(root, "source"), "-k", join(root, "sender.key"), "-o", join(root, "list")]);
    const manifest = JSON.parse(readFileSync(join(root, "list/manifest.json"), "utf8"));
    expect(manifest.payload.version).toBe(1);
    expect(manifest.payload.files).toEqual([{ path: "nested/a.txt", size: 1, sha256: createHash("sha256").update("a").digest("hex") }]);
    manifest.payload.created_at = "2026-08-28T00:00:00Z";
    writeFileSync(join(root, "changed-payload.json"), JSON.stringify(manifest));
    run(["verify", join(root, "changed-payload.json"), join(root, "source"), "-p", join(root, "sender.pub")], { expected: 4 });
    const traversal = spawnSync("cargo", ["test", "rejects_traversal_paths", "--quiet"], { encoding: "utf8" });
    expect(traversal.status, traversal.stderr).toBe(0);
  });

  it("@claim:free-mit is licensed under MIT and links its public source without a sign-in gate", async () => {
    expect(readFileSync(resolve("LICENSE"), "utf8")).toMatch(/Permission is hereby granted, free of charge/);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin);
    expect(await page.locator('a[href*="github.com/B-Divyesh"]').count()).toBeGreaterThan(0);
    expect(await page.locator('input[type="password"], input[type="email"]').count()).toBe(0);
    expect(await page.getByText("Free under the MIT License").count()).toBe(1);
    await context.close();
  });
});
