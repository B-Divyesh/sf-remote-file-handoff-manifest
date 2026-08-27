import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("page accessibility shell", () => {
  for (const page of ["index.html", "privacy/index.html", "terms/index.html"]) {
    it(`${page} has the required semantic landmarks`, () => {
      const html = readFileSync(resolve("site", page), "utf8");
      expect(html).toMatch(/<html lang="en">/);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toMatch(/<main[\s>]/);
      expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
      for (const image of html.matchAll(/<img\b[^>]*>/g)) expect(image[0]).toMatch(/\balt=/);
    });
  }
});
