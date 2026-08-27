use clap::{Parser, Subcommand};
use remote_file_handoff_manifest::{create_manifest, keygen, package, verify_manifest, Error};
use serde::Serialize;
use std::path::PathBuf;
use std::process::ExitCode;

#[derive(Debug, Parser)]
#[command(
    name = "handoff",
    version,
    about = "Create and verify signed folder handoff manifests",
    long_about = "Create transport-independent evidence for a folder delivery.\n\nEvery receipt records relative paths, sizes, and SHA-256 hashes and is signed with Ed25519. Files stay on your machine."
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
    /// Generate a new Ed25519 signing identity.
    Keygen {
        /// Secret-key path. The matching public key is written with a .pub suffix.
        #[arg(long, short)]
        output: PathBuf,
    },
    /// Hash a folder and create signed JSON and HTML receipts.
    Create {
        /// Folder to inventory recursively.
        source: PathBuf,
        /// Sender secret key created by `handoff keygen`.
        #[arg(long, short)]
        key: PathBuf,
        /// New or empty receipt directory.
        #[arg(long, short, default_value = "receipt")]
        output: PathBuf,
        /// Sender contact included in the signed receipt.
        #[arg(long)]
        contact: Option<String>,
        /// RFC 3339 expiry, for example 2026-12-31T23:59:59Z.
        #[arg(long)]
        expires: Option<String>,
        /// Encrypt receipts using RFHM_PASSPHRASE (minimum 12 characters).
        #[arg(long)]
        encrypt: bool,
    },
    /// Verify the signature and every received file.
    Verify {
        /// Plain manifest.json or encrypted manifest.json.age.
        manifest: PathBuf,
        /// Received folder to compare with the signed inventory.
        source: PathBuf,
        /// Trusted sender public key.
        #[arg(long, short)]
        public_key: PathBuf,
        /// Report content even if the signed expiry has passed.
        #[arg(long)]
        ignore_expiry: bool,
    },
    /// Copy a folder and its receipt into a portable directory package.
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
                "Receipt created\n  manifest: {}\n  HTML: {}\n  files: {}\n  bytes: {}\n  encrypted: {}",
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
            let report = verify_manifest(manifest, source, public_key, *ignore_expiry)
                .map_err(|error| (error, 4))?;
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
                        .map(|path| format!("  ALTERED: {path}")),
                );
                lines.extend(
                    report
                        .unexpected
                        .iter()
                        .map(|path| format!("  UNEXPECTED: {path}")),
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

fn value<T: Serialize>(report: &T) -> serde_json::Value {
    serde_json::to_value(report).expect("serializable report")
}
