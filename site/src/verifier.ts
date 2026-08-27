export interface ManifestFile {
  path: string;
  size: number;
  sha256: string;
}

export interface ManifestPayload {
  format: string;
  version: number;
  manifest_id: string;
  created_at: string;
  expires_at?: string;
  signer_public_key: string;
  file_count: number;
  total_bytes: number;
  files: ManifestFile[];
}

export interface Manifest {
  payload: ManifestPayload;
  signature: string;
}

export interface FileLike {
  relativePath: string;
  size: number;
  bytes(): Promise<ArrayBuffer>;
}

export interface Comparison {
  missing: string[];
  altered: string[];
  unexpected: string[];
}

export function parseManifest(text: string): Manifest {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The manifest is not valid JSON. Choose the plain manifest.json file.");
  }
  if (!value || typeof value !== "object" || !("payload" in value) || !("signature" in value)) {
    throw new Error("This JSON file is not a Remote File Handoff Manifest receipt.");
  }
  const manifest = value as Manifest;
  const payload = manifest.payload;
  if (payload.format !== "remote-file-handoff-manifest" || payload.version !== 1) {
    throw new Error("This manifest format or version is not supported by the browser verifier.");
  }
  if (!Array.isArray(payload.files) || payload.file_count !== payload.files.length) {
    throw new Error("The manifest inventory is incomplete or malformed.");
  }
  let previous = "";
  let total = 0;
  for (const entry of payload.files) {
    if (!entry || typeof entry.path !== "string" || !isSafePath(entry.path)) {
      throw new Error("The manifest contains an unsafe or invalid relative path.");
    }
    if (previous && previous >= entry.path) {
      throw new Error("Manifest paths are not unique and sorted.");
    }
    if (!Number.isSafeInteger(entry.size) || entry.size < 0 || !/^[0-9a-f]{64}$/.test(entry.sha256)) {
      throw new Error(`The inventory entry for ${entry.path} is malformed.`);
    }
    previous = entry.path;
    total += entry.size;
  }
  if (total !== payload.total_bytes) throw new Error("The manifest byte total is inconsistent.");
  return manifest;
}

export async function verifySignature(manifest: Manifest, publicKeyText: string): Promise<void> {
  const match = publicKeyText.trim().match(/^RFHM-ED25519-PUBLIC-1\n([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("The sender public key has an invalid header or encoding.");
  const trusted = base64Bytes(match[1]);
  const embedded = base64Bytes(manifest.payload.signer_public_key);
  if (!equalBytes(trusted, embedded)) {
    throw new Error("The manifest signer does not match the trusted sender key.");
  }
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("raw", ownedBuffer(trusted), { name: "Ed25519" }, false, ["verify"]);
  } catch {
    throw new Error("This browser cannot verify Ed25519 signatures. Use the handoff CLI instead.");
  }
  const valid = await crypto.subtle.verify(
    "Ed25519",
    key,
    ownedBuffer(base64Bytes(manifest.signature)),
    new TextEncoder().encode(JSON.stringify(manifest.payload)),
  );
  if (!valid) throw new Error("The manifest signature is invalid. Do not trust this receipt.");
}

export async function compareInventory(expected: ManifestFile[], actualFiles: FileLike[]): Promise<Comparison> {
  const actual = new Map(actualFiles.map((file) => [file.relativePath, file]));
  const expectedPaths = new Set(expected.map((entry) => entry.path));
  const missing: string[] = [];
  const altered: string[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(8, expected.length) }, async () => {
    while (cursor < expected.length) {
      const entry = expected[cursor++];
      const file = actual.get(entry.path);
      if (!file) {
        missing.push(entry.path);
      } else if (file.size !== entry.size || (await sha256(await file.bytes())) !== entry.sha256) {
        altered.push(entry.path);
      }
    }
  });
  await Promise.all(workers);
  const unexpected = [...actual.keys()].filter((path) => !expectedPaths.has(path));
  return {
    missing: missing.sort(),
    altered: altered.sort(),
    unexpected: unexpected.sort(),
  };
}

function isSafePath(path: string): boolean {
  return Boolean(path) && !path.startsWith("/") && !path.includes("\\") && path.split("/").every((part) => part && part !== "." && part !== "..");
}

async function sha256(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64Bytes(value: string): Uint8Array {
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch {
    throw new Error("The manifest contains invalid cryptographic data.");
  }
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

function ownedBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}
