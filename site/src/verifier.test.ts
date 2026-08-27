import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { join } from "node:path";
import { compareInventory, parseManifest, verifySignature } from "./verifier";

const hashA = "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";

describe("browser verifier", () => {
  it("reports only the exact altered, missing, and unexpected paths", async () => {
    const report = await compareInventory(
      [
        { path: "a.txt", size: 1, sha256: hashA },
        { path: "missing.txt", size: 1, sha256: hashA },
      ],
      [
        { relativePath: "a.txt", size: 2, bytes: async () => new TextEncoder().encode("aa").buffer },
        { relativePath: "extra.txt", size: 1, bytes: async () => new TextEncoder().encode("a").buffer },
      ],
    );
    expect(report).toEqual({ altered: ["a.txt"], missing: ["missing.txt"], unexpected: ["extra.txt"] });
  });

  it("rejects unsafe paths before reading files", () => {
    const bad = {
      payload: {
        format: "remote-file-handoff-manifest",
        version: 1,
        manifest_id: "id",
        created_at: "2026-08-27T00:00:00Z",
        signer_public_key: "x",
        file_count: 1,
        total_bytes: 1,
        files: [{ path: "../secret", size: 1, sha256: hashA }],
      },
      signature: "x",
    };
    expect(() => parseManifest(JSON.stringify(bad))).toThrow(/unsafe/);
  });

  it("verifies a manifest signed by the Rust CLI", async () => {
    const root = mkdtempSync(join(tmpdir(), "rfhm-browser-test-"));
    const source = join(root, "source");
    const key = join(root, "sender.key");
    const receipt = join(root, "receipt");
    mkdirSync(source);
    writeFileSync(join(source, "approved.txt"), "approved\n");
    const binary = resolve("target", "debug", "handoff");
    execFileSync(binary, ["keygen", "-o", key]);
    execFileSync(binary, ["create", source, "-k", key, "-o", receipt]);
    const manifest = parseManifest(readFileSync(join(receipt, "manifest.json"), "utf8"));
    await expect(verifySignature(manifest, readFileSync(join(root, "sender.pub"), "utf8"))).resolves.toBeUndefined();
  });
});
