# Remote File Handoff Manifest

`handoff` creates transport-independent evidence for a folder delivery. It records every relative path, byte size, and SHA-256 hash in a signed manifest, produces a readable HTML receipt, and tells a recipient exactly which files are missing, altered, or unexpected.

It is for freelancers and small teams handing private folders over NAS mounts, SFTP, removable media, or peer-to-peer links. It does not upload files or guarantee delivery.

## Install

Build the single binary with Rust 1.80 or newer:

```sh
cargo install --path .
handoff --help
```

## Usage

Create a signing identity once. Keep `sender.key` private; send `sender.pub` to recipients through a trusted channel.

```sh
handoff keygen --output sender.key
```

Build signed JSON and HTML receipts for a folder:

```sh
handoff create ./deliverables --key sender.key --output ./receipt \
  --contact "alex@example.com" --expires 2026-12-31T23:59:59Z
```

Copy the files and receipts into a portable package. The output can be transferred by any ordinary tool:

```sh
handoff package ./deliverables --manifest ./receipt/manifest.json --output ./handoff-package
```

At the destination, verify the received `files/` directory:

```sh
handoff verify ./handoff-package/manifest.json ./handoff-package/files \
  --public-key sender.pub
```

For scripts, add `--json`. A clean verification exits `0`; discrepancies exit `3`; an invalid signature or decryption failure exits `4`; operational errors exit `1`; invalid CLI usage exits `2`.

```sh
handoff --json verify ./receipt/manifest.json ./received --public-key sender.pub
```

### Private manifests

Plain manifests reveal filenames. Encrypt both receipts with a passphrase supplied through the environment (never a command-line argument):

```sh
RFHM_PASSPHRASE='correct horse battery staple' \
  handoff create ./deliverables --key sender.key --output ./private-receipt --encrypt

RFHM_PASSPHRASE='correct horse battery staple' \
  handoff verify ./private-receipt/manifest.json.age ./received --public-key sender.pub
```

The encrypted HTML file is a privacy-safe cover sheet; use the CLI to decrypt and verify. Files themselves are not encrypted.

## Manifest format

Version `1` is UTF-8 JSON. The signature is Ed25519 over the exact compact JSON encoding of the `payload` object. Entries are sorted by relative path and use `/` separators. Each entry has `path`, `size`, and a lowercase SHA-256 `sha256` value. Implementations must reject unsupported versions and unsafe absolute or parent-traversal paths.

## Development

```sh
npm install
npm test
npm run build:site       # writes dist/site
cargo package --allow-dirty
```

Run the landing page locally with `npm run dev`. The browser verifier hashes selected local files in place; files are never uploaded or stored.

## Privacy and security

There is no telemetry, account, hosted storage, runtime CDN, or external request. Signing proves that the manifest came from the holder of the key and has not changed; it does not prove that a transport completed. Protect the signing key and share its public half through a trusted channel.

## License

MIT. See [LICENSE](LICENSE).
