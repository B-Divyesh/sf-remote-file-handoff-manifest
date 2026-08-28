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
});
