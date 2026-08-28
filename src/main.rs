use clap::{Parser, Subcommand};
use remote_file_handoff_manifest::{create_manifest, keygen, package, verify_manifest, Error};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

#[derive(Debug, Parser)]
#[command(
    name = "handoff",
    version,
    about = "Create and verify signed file lists for folder handoffs",
    long_about = "Create a signed file list before sending a folder.\n\nEach list records relative paths, sizes, and SHA-256 hashes. Ed25519 signs the list so a recipient can check it."
)]
struct Cli {
    /// Emit one machine-readable JSON object to stdout.
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Run a complete isolated sample handoff in a new temporary directory.
    Demo,
    /// Generate a new Ed25519 signing identity.
    Keygen {
        /// Secret-key path. The matching public key uses the same stem and a .pub extension.
        #[arg(long, short)]
        output: PathBuf,
    },
    /// Hash a folder and create signed JSON and HTML file lists.
    Create {
        /// Folder to list recursively.
        source: PathBuf,
        /// Sender secret key created by `handoff keygen`.
        #[arg(long, short)]
        key: PathBuf,
        /// New or empty output directory.
        #[arg(long, short, default_value = "receipt")]
        output: PathBuf,
        /// Sender contact included in the signed file list.
        #[arg(long)]
        contact: Option<String>,
        /// RFC 3339 expiry, for example 2026-12-31T23:59:59Z.
        #[arg(long)]
        expires: Option<String>,
        /// Encrypt outputs using RFHM_PASSPHRASE (minimum 12 characters).
        #[arg(long)]
        encrypt: bool,
    },
    /// Verify the signature and every received file.
    Verify {
        /// Plain manifest.json or encrypted manifest.json.age.
        manifest: PathBuf,
        /// Received folder to compare with the signed file list.
        source: PathBuf,
        /// Trusted sender public key.
        #[arg(long, short)]
        public_key: PathBuf,
        /// Report content even if the signed expiry has passed.
        #[arg(long)]
        ignore_expiry: bool,
    },
    /// Copy a folder and its signed file list into a portable directory.
    Package {
        /// Folder whose files should be copied.
        source: PathBuf,
        /// Signed manifest to place beside the files.
        #[arg(long, short)]
        manifest: PathBuf,
        /// Destination directory; it must not already exist.
        #[arg(long, short)]
        output: PathBuf,
    },
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    match run(&cli) {
        Ok((value, human, code)) => {
            if cli.json {
                println!(
                    "{}",
                    serde_json::to_string(&value).expect("serializable report")
                );
            } else {
                println!("{human}");
            }
            ExitCode::from(code)
        }
        Err((error, code)) => {
            if cli.json {
                println!(
                    "{}",
                    serde_json::json!({"status": "error", "error": error.to_string()})
                );
            } else {
                eprintln!("error: {error}");
            }
            ExitCode::from(code)
        }
    }
}

fn run(cli: &Cli) -> Result<(serde_json::Value, String, u8), (Error, u8)> {
    match &cli.command {
        Command::Demo => run_demo().map_err(|error| (error, 1)),
        Command::Keygen { output } => {
            let report = keygen(output).map_err(|error| (error, 1))?;
            let human = format!(
                "Signing identity created\n  secret: {}\n  public: {}\n  fingerprint: {}",
                report.secret_key, report.public_key, report.fingerprint
            );
            Ok((value(&report), human, 0))
        }
        Command::Create {
            source,
            key,
            output,
            contact,
            expires,
            encrypt,
        } => {
            let report = create_manifest(
                source,
                key,
                output,
                contact.clone(),
                expires.clone(),
                *encrypt,
            )
            .map_err(|error| (error, 1))?;
            let human = format!(
                "Signed file list created\n  JSON: {}\n  HTML: {}\n  files: {}\n  bytes: {}\n  encrypted: {}",
                report.json_path,
                report.html_path,
                report.file_count,
                report.total_bytes,
                if report.encrypted { "yes" } else { "no" }
            );
            Ok((value(&report), human, 0))
        }
        Command::Verify {
            manifest,
            source,
            public_key,
            ignore_expiry,
        } => {
            let report =
                verify_manifest(manifest, source, public_key, *ignore_expiry).map_err(|error| {
                    let code = if matches!(error, Error::Io(_) | Error::Walk(_)) {
                        1
                    } else {
                        4
                    };
                    (error, code)
                })?;
            let code = if report.clean() { 0 } else { 3 };
            let human = if report.clean() {
                format!(
                    "VERIFIED — signature valid; {} files match byte for byte",
                    report.checked_files
                )
            } else {
                let mut lines = vec!["MISMATCH — the received folder differs".to_string()];
                if report.expired {
                    lines.push("  EXPIRED: the signed handoff expiry has passed".into());
                }
                lines.extend(
                    report
                        .missing
                        .iter()
                        .map(|path| format!("  MISSING: {path}")),
                );
                lines.extend(
                    report
                        .altered
                        .iter()
                        .map(|path| format!("  CHANGED: {path}")),
                );
                lines.extend(
                    report
                        .unexpected
                        .iter()
                        .map(|path| format!("  EXTRA: {path}")),
                );
                lines.join("\n")
            };
            Ok((value(&report), human, code))
        }
        Command::Package {
            source,
            manifest,
            output,
        } => {
            let report = package(source, manifest, output).map_err(|error| (error, 1))?;
            let human = format!(
                "Package ready\n  output: {}\n  copied files: {}\nTransfer this directory with your existing tool; verify it at the destination.",
                report.output, report.copied_files
            );
            Ok((value(&report), human, 0))
        }
    }
}

fn run_demo() -> Result<(serde_json::Value, String, u8), Error> {
    let root = unique_demo_directory()?;
    let source = root.join("sender/project-aurora");
    let received = root.join("recipient/project-aurora");
    let key = root.join("sender/sender.key");
    let receipt = root.join("sender/signed-file-list");
    fs::create_dir_all(source.join("brand"))?;
    fs::create_dir_all(source.join("exports"))?;
    fs::create_dir_all(source.join("notes"))?;
    fs::write(
        source.join("brand/logo-master.ai"),
        include_bytes!("../examples/client-handoff/brand/logo-master.ai"),
    )?;
    fs::write(
        source.join("exports/final-cut.mov"),
        include_bytes!("../examples/client-handoff/exports/final-cut.mov"),
    )?;
    fs::write(
        source.join("notes/approval.txt"),
        include_bytes!("../examples/client-handoff/notes/approval.txt"),
    )?;
    keygen(&key)?;
    let created = create_manifest(
        &source,
        &key,
        &receipt,
        Some("alex@northstar.studio".into()),
        None,
        false,
    )?;
    copy_demo_tree(&source, &received)?;
    fs::remove_file(received.join("exports/final-cut.mov"))?;
    fs::write(received.join("brand/logo-master.ai"), b"draft artwork\n")?;
    fs::write(
        received.join("notes/unrequested.txt"),
        b"not in sender list\n",
    )?;
    let report = verify_manifest(
        &receipt.join("manifest.json"),
        &received,
        &root.join("sender/sender.pub"),
        false,
    )?;
    let value = serde_json::json!({
        "status": "demo_mismatch",
        "workspace": root,
        "created_files": created.file_count,
        "missing": report.missing,
        "altered": report.altered,
        "unexpected": report.unexpected
    });
    let human = format!(
        "Demo workspace created at {}\nSigned file list: 3 files\nMISMATCH — the received folder differs\n  MISSING: exports/final-cut.mov\n  CHANGED: brand/logo-master.ai\n  EXTRA: notes/unrequested.txt\nSample data stays in this temporary workspace; your folders were not read or changed.",
        root.display()
    );
    Ok((value, human, 0))
}

fn unique_demo_directory() -> Result<PathBuf, Error> {
    let base = std::env::temp_dir();
    for attempt in 0..100_u32 {
        let path = base.join(format!("handoff-demo-{}-{attempt}", std::process::id()));
        match fs::create_dir(&path) {
            Ok(()) => return Ok(path),
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error.into()),
        }
    }
    Err(Error::Message(
        "could not create an isolated demo workspace".into(),
    ))
}

fn copy_demo_tree(source: &Path, target: &Path) -> Result<(), Error> {
    fs::create_dir_all(target)?;
    for item in fs::read_dir(source)? {
        let item = item?;
        let destination = target.join(item.file_name());
        if item.file_type()?.is_dir() {
            copy_demo_tree(&item.path(), &destination)?;
        } else {
            fs::copy(item.path(), destination)?;
        }
    }
    Ok(())
}

fn value<T: Serialize>(report: &T) -> serde_json::Value {
    serde_json::to_value(report).expect("serializable report")
}
