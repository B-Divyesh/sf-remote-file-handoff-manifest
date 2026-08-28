import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("page accessibility shell", () => {
  for (const page of ["index.html", "demo/index.html", "privacy/index.html", "terms/index.html", "404.html"]) {
    it(`${page} has the required semantic landmarks`, () => {
      const html = readFileSync(resolve("site", page), "utf8");
      expect(html).toMatch(/<html lang="en">/);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toMatch(/<main[\s>]/);
      expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
      expect(html).toMatch(/rel="canonical"/);
      expect(html).toMatch(/property="og:image"/);
      expect(html).toMatch(/name="twitter:card"/);
      expect(html).toMatch(/rel="apple-touch-icon"/);
      for (const image of html.matchAll(/<img\b[^>]*>/g)) expect(image[0]).toMatch(/\balt=/);
    });
  }

  it("keeps round-two metadata, legal wording, and command-line language concrete", () => {
    const home = readFileSync(resolve("site/index.html"), "utf8");
    const privacy = readFileSync(resolve("site/privacy/index.html"), "utf8");
    const terms = readFileSync(resolve("site/terms/index.html"), "utf8");
    const readme = readFileSync(resolve("README.md"), "utf8");

    expect(home).toMatch(/<title>Remote File Handoff Manifest — verify every file<\/title>/);
    expect(home).toMatch(/Install one command-line tool/);
    expect(home).not.toMatch(/Build one Rust binary/);
    expect(privacy).toMatch(/does not control the host’s request or security logs/);
    expect(privacy).not.toMatch(/short-lived/);
    expect(terms).not.toMatch(/Material changes appear here/);
    expect(readme).toMatch(/The command-line demo uses the files/);
    expect(readme).toMatch(/Install the command-line tool from source/);
    expect(readme).toMatch(/Add `--json` before a command to print JSON for scripts/);
    expect(readme).toMatch(/File and system errors exit `1`/);
    expect(readme).not.toMatch(/CLI demo|command-line binary|machine-readable|Operational failures/);
  });
});
