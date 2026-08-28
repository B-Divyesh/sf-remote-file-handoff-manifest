# Verify every file in a folder handoff

`handoff` creates a signed file list for a folder. It records each relative path, byte size, and SHA-256 hash.
It also creates a readable HTML report. Recipients see exact missing, changed, and extra paths.

The tool is for freelancers and small teams sending private folders. It checks contents but does not guarantee delivery.

Try the isolated sample at [the web demo](https://remote-file-handoff-manifest.sociobot.in/?demo=1), or run:

```sh
cargo run -- demo
```

The command-line demo uses the files in `examples/client-handoff/`. It creates a separate temporary workspace and prints its path.

## Install

Install the command-line tool from source:

```sh
git clone https://github.com/B-Divyesh/sf-remote-file-handoff-manifest.git
cd sf-remote-file-handoff-manifest
cargo install --path .
```

## Create and verify a signed file list

Create a sender key:

```sh
handoff keygen --output sender.key
```

Keep `sender.key` private. Confirm the displayed public-key fingerprint with the recipient through a separate trusted channel.

Create signed JSON and HTML outputs:

```sh
handoff create ./deliverables --key sender.key --output ./signed-file-list
```

Create a portable directory with the files and signed outputs:

```sh
handoff package ./deliverables --manifest ./signed-file-list/manifest.json --output ./package
```

Send that directory with your usual transfer tool. On the recipient’s machine, check the received `files/` folder:

```sh
handoff verify ./package/manifest.json ./package/files --public-key ./package/signer.pub
```

Add `--json` before a command to print JSON for scripts. Clean checks exit `0`. File differences exit `3`.
Signature or decryption failures exit `4`. File and system errors exit `1`. Invalid command usage exits `2`.

## Encrypt file names

Plain signed file lists show filenames. Set a passphrase in the environment to encrypt both output files:

```sh
export RFHM_PASSPHRASE='use a long passphrase here'
handoff create ./deliverables --key sender.key --output ./private-list --encrypt
```

The encrypted JSON and HTML outputs do not display filenames. Use the command-line tool to decrypt and verify them.
Source files and packaged files remain unencrypted and unchanged.

## Format reference

Format version `1` is UTF-8 JSON. Ed25519 signs the exact compact JSON encoding of `payload`.
Entries are ordered by relative path and use `/` separators. Each entry contains `path`, `size`, and lowercase SHA-256 `sha256`.
Readers reject unsupported versions, absolute paths, and paths containing `..`.

## Develop and test

```sh
npm ci
npm test
npm run build
cargo package
```

`npm test` runs Rust tests, type checks, site tests, claim tests, and browser checks. The build output is `dist/site`.
The site has no account, analytics, advertising, or third-party runtime code.
Browser checks do not upload or store selected files. The service worker caches only public site assets for offline use.

See [.factory/claims.json](.factory/claims.json) for each public promise and its verification command.
See [.factory/demo.md](.factory/demo.md) for demo isolation details.

## Deploy

The factory deploys `dist/site`. Maintainers can build it with `npm ci && npm run build:site`.
Registry credentials are factory-owned, so do not publish the crate from this repository.

## License

[MIT](LICENSE).
