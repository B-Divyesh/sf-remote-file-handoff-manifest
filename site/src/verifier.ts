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
    throw new Error("This file is not valid JSON. Choose the plain manifest.json file.");
  }
  if (!value || typeof value !== "object" || !("payload" in value) || !("signature" in value)) {
    throw new Error("This is not a Handoff signed file list. Ask the sender to create it again.");
  }
  const manifest = value as Manifest;
  const payload = manifest.payload;
  if (payload.format !== "remote-file-handoff-manifest" || payload.version !== 1) {
    throw new Error("This signed file list version is not supported. Use the current command-line tool.");
  }
  if (!Array.isArray(payload.files) || payload.file_count !== payload.files.length) {
    throw new Error("This signed file list is incomplete. Ask the sender to create it again.");
  }
  let previous = "";
  let total = 0;
  for (const entry of payload.files) {
    if (!entry || typeof entry.path !== "string" || !isSafePath(entry.path)) {
      throw new Error("This signed file list contains an unsafe path. Do not use it; ask the sender to create it again.");
    }
    if (previous && previous >= entry.path) {
      throw new Error("The paths are duplicated or unsorted. Ask the sender to create the signed file list again.");
    }
    if (!Number.isSafeInteger(entry.size) || entry.size < 0 || !/^[0-9a-f]{64}$/.test(entry.sha256)) {
      throw new Error(`The file entry for ${entry.path} is invalid. Ask the sender to create the signed file list again.`);
    }
    previous = entry.path;
    total += entry.size;
  }
  if (total !== payload.total_bytes) throw new Error("The byte total is wrong. Ask the sender to create the signed file list again.");
  return manifest;
}

export async function verifySignature(manifest: Manifest, publicKeyText: string): Promise<void> {
  const match = publicKeyText.trim().match(/^RFHM-ED25519-PUBLIC-1\n([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("The sender public key is invalid. Choose the sender’s .pub file again.");
  const trusted = base64Bytes(match[1]);
  const embedded = base64Bytes(manifest.payload.signer_public_key);
  if (!equalBytes(trusted, embedded)) {
    throw new Error("The signer does not match this public key. Stop and confirm the key with the sender.");
  }
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("raw", ownedBuffer(trusted), { name: "Ed25519" }, false, ["verify"]);
  } catch {
    throw new Error("This browser cannot verify Ed25519 signatures. Run the command-line verifier instead.");
  }
  const valid = await crypto.subtle.verify(
    "Ed25519",
    key,
    ownedBuffer(base64Bytes(manifest.signature)),
    new TextEncoder().encode(JSON.stringify(manifest.payload)),
  );
  if (!valid) throw new Error("The signature is invalid. Do not accept this handoff.");
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
    throw new Error("The signed file list contains invalid cryptographic data. Ask the sender to create it again.");
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
