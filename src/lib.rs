//! Build and verify signed folder inventories.
//!
//! The CLI is the primary interface. The same small typed API is available to
//! Rust callers:
//!
//! ```no_run
//! use remote_file_handoff_manifest::{keygen, create_manifest, verify_manifest};
//! use std::path::Path;
//!
//! keygen(Path::new("sender.key"))?;
//! create_manifest(
//!     Path::new("deliverables"),
//!     Path::new("sender.key"),
//!     Path::new("signed-file-list"),
//!     None,
//!     None,
//!     false,
//! )?;
//! let result = verify_manifest(
//!     Path::new("signed-file-list/manifest.json"),
//!     Path::new("deliverables"),
//!     Path::new("sender.pub"),
//!     false,
//! )?;
//! assert!(result.clean());
//! # Ok::<(), remote_file_handoff_manifest::Error>(())
//! ```

#![forbid(unsafe_code)]

use age::secrecy::SecretString;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::{DateTime, Utc};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::fs::{self, File, OpenOptions};
use std::io::{BufReader, Read, Write};
use std::path::{Component, Path, PathBuf};
use walkdir::WalkDir;

pub const FORMAT_VERSION: u8 = 1;
const SECRET_HEADER: &str = "RFHM-ED25519-SECRET-1";
const PUBLIC_HEADER: &str = "RFHM-ED25519-PUBLIC-1";

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Walk(#[from] walkdir::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FileEntry {
    pub path: String,
    pub size: u64,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Payload {
    pub format: String,
    pub version: u8,
    pub manifest_id: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub contact: Option<String>,
    pub hash_algorithm: String,
    pub signature_algorithm: String,
    pub signer_public_key: String,
    pub file_count: usize,
    pub total_bytes: u64,
    pub files: Vec<FileEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub payload: Payload,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CreateReport {
    pub status: &'static str,
    pub manifest_id: String,
    pub file_count: usize,
    pub total_bytes: u64,
    pub json_path: String,
    pub html_path: String,
    pub encrypted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyReport {
    pub status: String,
    pub manifest_id: String,
    pub signature_valid: bool,
    pub expired: bool,
    pub checked_files: usize,
    pub missing: Vec<String>,
    pub altered: Vec<String>,
    pub unexpected: Vec<String>,
}

impl VerifyReport {
    pub fn clean(&self) -> bool {
        self.signature_valid
            && !self.expired
            && self.missing.is_empty()
            && self.altered.is_empty()
            && self.unexpected.is_empty()
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct KeygenReport {
    pub status: &'static str,
    pub secret_key: String,
    pub public_key: String,
    pub fingerprint: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct PackageReport {
    pub status: &'static str,
    pub output: String,
    pub copied_files: usize,
}

pub fn keygen(output: &Path) -> Result<KeygenReport> {
    if output.exists() {
        return Err(Error::Message(format!(
            "refusing to overwrite existing key: {}",
            output.display()
        )));
    }
    let public_path = public_key_path(output);
    if public_path == output {
        return Err(Error::Message(
            "secret-key output must not use the .pub extension".into(),
        ));
    }
    if public_path.exists() {
        return Err(Error::Message(format!(
            "refusing to overwrite existing public key: {}",
            public_path.display()
        )));
    }
    if let Some(parent) = output.parent().filter(|p| !p.as_os_str().is_empty()) {
        fs::create_dir_all(parent)?;
    }
    let signing = SigningKey::generate(&mut OsRng);
    let secret_text = format!("{SECRET_HEADER}\n{}\n", BASE64.encode(signing.to_bytes()));
    write_new_private(output, secret_text.as_bytes())?;
    let verifying = signing.verifying_key();
    let public_text = encode_public_key(&verifying);
    write_new(&public_path, public_text.as_bytes())?;
    Ok(KeygenReport {
        status: "created",
        secret_key: output.display().to_string(),
        public_key: public_path.display().to_string(),
        fingerprint: fingerprint(&verifying),
    })
}

pub fn create_manifest(
    source: &Path,
    key_path: &Path,
    output: &Path,
    contact: Option<String>,
    expires: Option<String>,
    encrypt: bool,
) -> Result<CreateReport> {
    ensure_directory(source, "source")?;
    ensure_output_outside_source(source, output, "signed file list")?;
    if let Some(value) = &expires {
        DateTime::parse_from_rfc3339(value).map_err(|_| {
            Error::Message("--expires must be RFC 3339, for example 2026-12-31T23:59:59Z".into())
        })?;
    }
    let signing = read_signing_key(key_path)?;
    let files = scan_directory(source)?;
    let total_bytes = files.iter().map(|entry| entry.size).sum();
    let verifying = signing.verifying_key();
    let payload = Payload {
        format: "remote-file-handoff-manifest".into(),
        version: FORMAT_VERSION,
        manifest_id: random_id(),
        created_at: Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
        expires_at: expires,
        contact: contact.filter(|value| !value.trim().is_empty()),
        hash_algorithm: "sha256".into(),
        signature_algorithm: "ed25519".into(),
        signer_public_key: BASE64.encode(verifying.to_bytes()),
        file_count: files.len(),
        total_bytes,
        files,
    };
    let signed_bytes = serde_json::to_vec(&payload)?;
    let signature = signing.sign(&signed_bytes);
    let manifest = Manifest {
        payload,
        signature: BASE64.encode(signature.to_bytes()),
    };
    let json = serde_json::to_vec_pretty(&manifest)?;
    let html = render_html(&manifest);
    fs::create_dir_all(output)?;

    let (json_path, html_path) = if encrypt {
        let passphrase = passphrase()?;
        let json_path = output.join("manifest.json.age");
        let html_path = output.join("manifest.html.age");
        let readme_path = output.join("README.txt");
        let signer_path = output.join("signer.pub");
        refuse_overwrite(&[&json_path, &html_path, &readme_path, &signer_path])?;
        write_new(&json_path, &encrypt_bytes(&json, &passphrase)?)?;
        write_new(&html_path, &encrypt_bytes(html.as_bytes(), &passphrase)?)?;
        write_new(
            &readme_path,
            b"Encrypted Remote File Handoff Manifest\n\nUse `handoff verify manifest.json.age FILES --public-key SENDER.pub`.\nThe passphrase and public-key fingerprint should arrive through a trusted channel.\n",
        )?;
        (json_path, html_path)
    } else {
        let json_path = output.join("manifest.json");
        let html_path = output.join("manifest.html");
        let signer_path = output.join("signer.pub");
        refuse_overwrite(&[&json_path, &html_path, &signer_path])?;
        write_new(&json_path, &json)?;
        write_new(&html_path, html.as_bytes())?;
        (json_path, html_path)
    };
    write_new(
        &output.join("signer.pub"),
        encode_public_key(&verifying).as_bytes(),
    )?;
    Ok(CreateReport {
        status: "created",
        manifest_id: manifest.payload.manifest_id,
        file_count: manifest.payload.file_count,
        total_bytes,
        json_path: json_path.display().to_string(),
        html_path: html_path.display().to_string(),
        encrypted: encrypt,
    })
}

pub fn verify_manifest(
    manifest_path: &Path,
    source: &Path,
    public_key_path: &Path,
    ignore_expiry: bool,
) -> Result<VerifyReport> {
    ensure_directory(source, "received folder")?;
    let bytes = fs::read(manifest_path)?;
    let plaintext = if manifest_path.extension().and_then(|value| value.to_str()) == Some("age") {
        decrypt_bytes(&bytes, &passphrase()?)?
    } else {
        bytes
    };
    let manifest: Manifest = serde_json::from_slice(&plaintext)
        .map_err(|error| Error::Message(format!("manifest.json is not valid JSON: {error}")))?;
    validate_payload(&manifest.payload)?;
    let verifying = read_verifying_key(public_key_path)?;
    let embedded = decode_key::<32>(&manifest.payload.signer_public_key, "embedded public key")?;
    if verifying.to_bytes() != embedded {
        return Err(Error::Message(
            "signed file list does not match the supplied public key".into(),
        ));
    }
    let signature_bytes = decode_key::<64>(&manifest.signature, "manifest signature")?;
    let signature = Signature::from_bytes(&signature_bytes);
    let signed_bytes = serde_json::to_vec(&manifest.payload)?;
    verifying
        .verify(&signed_bytes, &signature)
        .map_err(|_| Error::Message("signed file list signature is invalid".into()))?;

    let actual = scan_directory(source)?
        .into_iter()
        .map(|entry| (entry.path.clone(), entry))
        .collect::<BTreeMap<_, _>>();
    let expected = manifest
        .payload
        .files
        .iter()
        .map(|entry| (entry.path.clone(), entry))
        .collect::<BTreeMap<_, _>>();
    let mut missing = Vec::new();
    let mut altered = Vec::new();
    for (path, wanted) in &expected {
        match actual.get(path) {
            None => missing.push(path.clone()),
            Some(found) if found.size != wanted.size || found.sha256 != wanted.sha256 => {
                altered.push(path.clone())
            }
            Some(_) => {}
        }
    }
    let expected_paths = expected.keys().cloned().collect::<BTreeSet<_>>();
    let unexpected = actual
        .keys()
        .filter(|path| !expected_paths.contains(*path))
        .cloned()
        .collect::<Vec<_>>();
    let expired = !ignore_expiry
        && manifest
            .payload
            .expires_at
            .as_ref()
            .and_then(|value| DateTime::parse_from_rfc3339(value).ok())
            .is_some_and(|expiry| expiry < Utc::now());
    let mut report = VerifyReport {
        status: String::new(),
        manifest_id: manifest.payload.manifest_id,
        signature_valid: true,
        expired,
        checked_files: expected.len(),
        missing,
        altered,
        unexpected,
    };
    report.status = if report.clean() {
        "verified"
    } else {
        "mismatch"
    }
    .into();
    Ok(report)
}

pub fn package(source: &Path, manifest: &Path, output: &Path) -> Result<PackageReport> {
    ensure_directory(source, "source")?;
    if !manifest.is_file() {
        return Err(Error::Message(format!(
            "manifest does not exist: {}",
            manifest.display()
        )));
    }
    if output.exists() {
        return Err(Error::Message(format!(
            "refusing to overwrite package destination: {}",
            output.display()
        )));
    }
    ensure_output_outside_source(source, output, "package")?;
    let receipt_dir = manifest.parent().unwrap_or(Path::new("."));
    let signer_path = receipt_dir.join("signer.pub");
    if !signer_path.is_file() {
        return Err(Error::Message(format!(
            "signed file list is missing its signer.pub file: {}",
            signer_path.display()
        )));
    }
    let verification = verify_manifest(manifest, source, &signer_path, false)?;
    if !verification.clean() {
        return Err(Error::Message(format!(
            "source does not match the signed file list ({} missing, {} altered, {} unexpected, expired: {})",
            verification.missing.len(),
            verification.altered.len(),
            verification.unexpected.len(),
            verification.expired
        )));
    }
    let files_root = output.join("files");
    fs::create_dir_all(&files_root)?;
    let mut copied = 0;
    for entry in WalkDir::new(source).follow_links(false) {
        let entry = entry?;
        let relative = entry.path().strip_prefix(source).map_err(|_| {
            Error::Message(format!(
                "could not make relative path: {}",
                entry.path().display()
            ))
        })?;
        if relative.as_os_str().is_empty() {
            continue;
        }
        let target = files_root.join(relative);
        if entry.file_type().is_dir() {
            fs::create_dir_all(&target)?;
        } else if entry.file_type().is_file() {
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::copy(entry.path(), &target)?;
            copied += 1;
        } else {
            return Err(Error::Message(format!(
                "unsupported symlink or special file: {}",
                entry.path().display()
            )));
        }
    }
    let manifest_name = manifest
        .file_name()
        .ok_or_else(|| Error::Message("manifest path has no filename".into()))?;
    fs::copy(manifest, output.join(manifest_name))?;
    for sibling in [
        "manifest.html",
        "manifest.html.age",
        "signer.pub",
        "README.txt",
    ] {
        let candidate = receipt_dir.join(sibling);
        if candidate.is_file() {
            fs::copy(&candidate, output.join(sibling))?;
        }
    }
    Ok(PackageReport {
        status: "packaged",
        output: output.display().to_string(),
        copied_files: copied,
    })
}

fn validate_payload(payload: &Payload) -> Result<()> {
    if payload.format != "remote-file-handoff-manifest" || payload.version != FORMAT_VERSION {
        return Err(Error::Message(format!(
            "unsupported manifest format or version: {} v{}",
            payload.format, payload.version
        )));
    }
    if payload.hash_algorithm != "sha256" || payload.signature_algorithm != "ed25519" {
        return Err(Error::Message("unsupported cryptographic algorithm".into()));
    }
    if payload.file_count != payload.files.len()
        || payload.total_bytes != payload.files.iter().map(|entry| entry.size).sum::<u64>()
    {
        return Err(Error::Message("manifest totals are inconsistent".into()));
    }
    let mut previous: Option<&str> = None;
    for entry in &payload.files {
        validate_relative_path(&entry.path)?;
        if entry.sha256.len() != 64 || !entry.sha256.bytes().all(|byte| byte.is_ascii_hexdigit()) {
            return Err(Error::Message(format!(
                "invalid SHA-256 for {}",
                entry.path
            )));
        }
        if previous.is_some_and(|path| path >= entry.path.as_str()) {
            return Err(Error::Message(
                "manifest paths must be unique and sorted".into(),
            ));
        }
        previous = Some(&entry.path);
    }
    Ok(())
}

fn scan_directory(root: &Path) -> Result<Vec<FileEntry>> {
    let mut entries = Vec::new();
    for item in WalkDir::new(root).follow_links(false) {
        let item = item?;
        if item.path() == root {
            continue;
        }
        if item.file_type().is_symlink()
            || (!item.file_type().is_file() && !item.file_type().is_dir())
        {
            return Err(Error::Message(format!(
                "unsupported symlink or special file: {}",
                item.path().display()
            )));
        }
        if !item.file_type().is_file() {
            continue;
        }
        let relative = item.path().strip_prefix(root).map_err(|_| {
            Error::Message(format!(
                "could not make relative path: {}",
                item.path().display()
            ))
        })?;
        let path = relative_path(relative)?;
        entries.push(FileEntry {
            path,
            size: item.metadata()?.len(),
            sha256: hash_file(item.path())?,
        });
    }
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(entries)
}

fn hash_file(path: &Path) -> Result<String> {
    let file = File::open(path)?;
    let mut reader = BufReader::with_capacity(128 * 1024, file);
    let mut hash = Sha256::new();
    let mut buffer = [0_u8; 128 * 1024];
    loop {
        let count = reader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hash.update(&buffer[..count]);
    }
    Ok(format!("{:x}", hash.finalize()))
}

fn relative_path(path: &Path) -> Result<String> {
    let mut parts = Vec::new();
    for component in path.components() {
        match component {
            Component::Normal(value) => parts.push(value.to_str().ok_or_else(|| {
                Error::Message(format!("filename is not valid UTF-8: {}", path.display()))
            })?),
            _ => return Err(Error::Message(format!("unsafe path: {}", path.display()))),
        }
    }
    let value = parts.join("/");
    validate_relative_path(&value)?;
    Ok(value)
}

fn validate_relative_path(value: &str) -> Result<()> {
    if value.is_empty()
        || value.starts_with('/')
        || value.contains('\\')
        || value
            .split('/')
            .any(|part| part.is_empty() || part == "." || part == "..")
    {
        return Err(Error::Message(format!("unsafe manifest path: {value}")));
    }
    Ok(())
}

fn ensure_directory(path: &Path, label: &str) -> Result<()> {
    if !path.is_dir() {
        return Err(Error::Message(format!(
            "{label} is not a readable directory: {}",
            path.display()
        )));
    }
    Ok(())
}

fn ensure_output_outside_source(source: &Path, output: &Path, label: &str) -> Result<()> {
    let source = source.canonicalize()?;
    let absolute = if output.is_absolute() {
        output.to_path_buf()
    } else {
        std::env::current_dir()?.join(output)
    };
    let mut existing = absolute.as_path();
    let mut tail = Vec::new();
    while !existing.exists() {
        let name = existing
            .file_name()
            .ok_or_else(|| Error::Message(format!("invalid {label} output path")))?;
        tail.push(name.to_os_string());
        existing = existing
            .parent()
            .ok_or_else(|| Error::Message(format!("invalid {label} output path")))?;
    }
    let mut resolved = existing.canonicalize()?;
    for part in tail.iter().rev() {
        resolved.push(part);
    }
    if resolved.starts_with(source) {
        return Err(Error::Message(format!(
            "{label} destination must not be inside the source folder"
        )));
    }
    Ok(())
}

fn public_key_path(secret: &Path) -> PathBuf {
    secret.with_extension("pub")
}

fn encode_public_key(key: &VerifyingKey) -> String {
    format!("{PUBLIC_HEADER}\n{}\n", BASE64.encode(key.to_bytes()))
}

fn read_signing_key(path: &Path) -> Result<SigningKey> {
    let text = fs::read_to_string(path)?;
    let encoded = parse_key_file(&text, SECRET_HEADER, "secret key")?;
    Ok(SigningKey::from_bytes(&decode_key::<32>(
        encoded,
        "secret key",
    )?))
}

fn read_verifying_key(path: &Path) -> Result<VerifyingKey> {
    let text = fs::read_to_string(path)?;
    let encoded = parse_key_file(&text, PUBLIC_HEADER, "public key")?;
    VerifyingKey::from_bytes(&decode_key::<32>(encoded, "public key")?)
        .map_err(|_| Error::Message("public key is invalid".into()))
}

fn parse_key_file<'a>(text: &'a str, header: &str, label: &str) -> Result<&'a str> {
    let mut lines = text.lines();
    if lines.next() != Some(header) {
        return Err(Error::Message(format!("{label} has an invalid header")));
    }
    let value = lines
        .next()
        .ok_or_else(|| Error::Message(format!("{label} has no key data")))?;
    if lines.any(|line| !line.trim().is_empty()) {
        return Err(Error::Message(format!("{label} contains unexpected data")));
    }
    Ok(value)
}

fn decode_key<const N: usize>(encoded: &str, label: &str) -> Result<[u8; N]> {
    let bytes = BASE64
        .decode(encoded)
        .map_err(|_| Error::Message(format!("{label} is not valid base64")))?;
    bytes
        .try_into()
        .map_err(|_| Error::Message(format!("{label} has the wrong length")))
}

fn fingerprint(key: &VerifyingKey) -> String {
    let digest = Sha256::digest(key.as_bytes());
    digest[..10]
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<Vec<_>>()
        .join(":")
}

fn random_id() -> String {
    let mut bytes = [0_u8; 16];
    OsRng.fill_bytes(&mut bytes);
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn passphrase() -> Result<SecretString> {
    let value = std::env::var("RFHM_PASSPHRASE").map_err(|_| {
        Error::Message(
            "encrypted signed file lists require RFHM_PASSPHRASE in the environment".into(),
        )
    })?;
    if value.chars().count() < 12 {
        return Err(Error::Message(
            "RFHM_PASSPHRASE must contain at least 12 characters".into(),
        ));
    }
    Ok(SecretString::from(value))
}

fn encrypt_bytes(plaintext: &[u8], passphrase: &SecretString) -> Result<Vec<u8>> {
    let encryptor = age::Encryptor::with_user_passphrase(passphrase.clone());
    let mut output = Vec::new();
    let mut writer = encryptor
        .wrap_output(&mut output)
        .map_err(|error| Error::Message(format!("could not start encryption: {error}")))?;
    writer.write_all(plaintext)?;
    writer
        .finish()
        .map_err(|error| Error::Message(format!("could not finish encryption: {error}")))?;
    Ok(output)
}

fn decrypt_bytes(ciphertext: &[u8], passphrase: &SecretString) -> Result<Vec<u8>> {
    let decryptor = age::Decryptor::new(ciphertext).map_err(|error| {
        Error::Message(format!(
            "could not read encrypted signed file list: {error}"
        ))
    })?;
    let identity = age::scrypt::Identity::new(passphrase.clone());
    let mut reader = decryptor
        .decrypt(std::iter::once(&identity as &dyn age::Identity))
        .map_err(|_| {
            Error::Message("could not decrypt signed file list; check RFHM_PASSPHRASE".into())
        })?;
    let mut plaintext = Vec::new();
    reader.read_to_end(&mut plaintext).map_err(|_| {
        Error::Message("could not decrypt signed file list; check RFHM_PASSPHRASE".into())
    })?;
    Ok(plaintext)
}

fn write_new(path: &Path, bytes: &[u8]) -> Result<()> {
    if let Some(parent) = path.parent().filter(|path| !path.as_os_str().is_empty()) {
        fs::create_dir_all(parent)?;
    }
    let mut file = OpenOptions::new().write(true).create_new(true).open(path)?;
    file.write_all(bytes)?;
    Ok(())
}

#[cfg(unix)]
fn write_new_private(path: &Path, bytes: &[u8]) -> Result<()> {
    use std::os::unix::fs::OpenOptionsExt;
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .open(path)?;
    file.write_all(bytes)?;
    Ok(())
}

#[cfg(not(unix))]
fn write_new_private(path: &Path, bytes: &[u8]) -> Result<()> {
    write_new(path, bytes)
}

fn refuse_overwrite(paths: &[&Path]) -> Result<()> {
    if let Some(path) = paths.iter().find(|path| path.exists()) {
        return Err(Error::Message(format!(
            "refusing to overwrite existing signed file list: {}",
            path.display()
        )));
    }
    Ok(())
}

fn render_html(manifest: &Manifest) -> String {
    let payload = &manifest.payload;
    let rows = if payload.files.is_empty() {
        "<tr><td colspan=\"3\" class=\"empty\">This handoff intentionally contains no files.</td></tr>".into()
    } else {
        payload
            .files
            .iter()
            .map(|entry| {
                format!(
                    "<tr><td>{}</td><td>{}</td><td><code>{}</code></td></tr>",
                    escape_html(&entry.path),
                    entry.size,
                    entry.sha256
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    };
    let contact = payload
        .contact
        .as_deref()
        .map(escape_html)
        .unwrap_or_else(|| "Not provided".into());
    let expires = payload
        .expires_at
        .as_deref()
        .map(escape_html)
        .unwrap_or_else(|| "No expiry".into());
    format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signed file list · {id}</title><style>:root{{color-scheme:dark;--bg:#080b12;--surface:#101724;--line:#344460;--text:#f4f7e8;--muted:#aab4c5;--lime:#c8ff3d;--cyan:#5ee7f2}}*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,sans-serif}}main{{width:min(1120px,calc(100% - 32px));margin:48px auto}}h1,h2{{font-family:ui-monospace,monospace}}h1{{font-size:clamp(2rem,6vw,4rem);line-height:1}}.signal{{color:var(--lime);letter-spacing:.15em}}dl{{display:grid;grid-template-columns:max-content 1fr;gap:8px 24px;padding:24px;background:var(--surface);border-left:4px solid var(--cyan)}}dt{{color:var(--muted)}}dd{{margin:0;overflow-wrap:anywhere}}.table-wrap{{overflow:auto}}table{{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}}th,td{{padding:12px;text-align:left;border-bottom:1px solid var(--line)}}th{{color:var(--cyan)}}code{{font-size:.78rem;overflow-wrap:anywhere}}.empty{{color:var(--muted);text-align:center;padding:48px}}footer{{margin-top:48px;color:var(--muted)}}@media(max-width:600px){{main{{margin:24px auto}}dl{{grid-template-columns:1fr;gap:2px}}dd{{margin-bottom:12px}}}}</style></head><body><main><p class="signal">SIGNED FILE LIST</p><h1>Folder handoff signed file list</h1><p>This signed file list describes the sender's folder. Verify <code>manifest.json</code> and the received files with <code>handoff verify</code>. This page alone does not prove delivery.</p><dl><dt>Signed file list ID</dt><dd>{id}</dd><dt>Created</dt><dd>{created}</dd><dt>Expires</dt><dd>{expires}</dd><dt>Contact</dt><dd>{contact}</dd><dt>Files</dt><dd>{count}</dd><dt>Total bytes</dt><dd>{bytes}</dd><dt>Signature</dt><dd>Ed25519 · {signature}</dd></dl><h2>Files</h2><div class="table-wrap"><table><thead><tr><th scope="col">Relative path</th><th scope="col">Bytes</th><th scope="col">SHA-256</th></tr></thead><tbody>{rows}</tbody></table></div><footer>Signed file list format v1 · No data was uploaded to create this file list.</footer></main></body></html>"#,
        id = escape_html(&payload.manifest_id),
        created = escape_html(&payload.created_at),
        expires = expires,
        contact = contact,
        count = payload.file_count,
        bytes = payload.total_bytes,
        signature = escape_html(&manifest.signature),
        rows = rows
    )
}

fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_traversal_paths() {
        assert!(validate_relative_path("../secret").is_err());
        assert!(validate_relative_path("safe/file.txt").is_ok());
    }

    #[test]
    fn escapes_signed_file_list_values() {
        assert_eq!(escape_html("<x>&\""), "&lt;x&gt;&amp;&quot;");
    }
}
