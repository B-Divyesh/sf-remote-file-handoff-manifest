use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

fn handoff() -> Command {
    Command::cargo_bin("handoff").unwrap()
}

#[test]
fn documented_round_trip_and_exact_mismatch() {
    let temp = tempdir().unwrap();
    let source = temp.path().join("deliverables");
    let received = temp.path().join("received");
    let key = temp.path().join("sender.key");
    let receipt = temp.path().join("receipt");
    fs::create_dir_all(source.join("nested")).unwrap();
    fs::write(source.join("brief.txt"), "approved\n").unwrap();
    fs::write(source.join("nested/render.bin"), [1, 2, 3, 4]).unwrap();

    handoff()
        .args(["keygen", "--output"])
        .arg(&key)
        .assert()
        .success();
    handoff()
        .arg("create")
        .arg(&source)
        .args(["--key"])
        .arg(&key)
        .args(["--output"])
        .arg(&receipt)
        .args(["--contact", "alex@example.com"])
        .assert()
        .success();

    copy_dir(&source, &received);
    let public = temp.path().join("sender.key.pub");
    handoff()
        .arg("verify")
        .arg(receipt.join("manifest.json"))
        .arg(&received)
        .args(["--public-key"])
        .arg(&public)
        .assert()
        .success()
        .stdout(predicate::str::contains("VERIFIED"));

    fs::write(received.join("nested/render.bin"), [9, 9, 9, 9]).unwrap();
    let output = handoff()
        .args(["--json", "verify"])
        .arg(receipt.join("manifest.json"))
        .arg(&received)
        .args(["--public-key"])
        .arg(&public)
        .assert()
        .code(3)
        .get_output()
        .stdout
        .clone();
    let report: serde_json::Value = serde_json::from_slice(&output).unwrap();
    assert_eq!(report["altered"], serde_json::json!(["nested/render.bin"]));
    assert_eq!(report["missing"], serde_json::json!([]));
    assert_eq!(report["unexpected"], serde_json::json!([]));
}

#[test]
fn empty_folder_and_encrypted_receipt_work() {
    let temp = tempdir().unwrap();
    let source = temp.path().join("empty");
    let key = temp.path().join("sender.key");
    let receipt = temp.path().join("receipt");
    fs::create_dir(&source).unwrap();
    handoff()
        .args(["keygen", "-o"])
        .arg(&key)
        .assert()
        .success();
    handoff()
        .env("RFHM_PASSPHRASE", "a long test passphrase")
        .arg("create")
        .arg(&source)
        .args(["-k"])
        .arg(&key)
        .args(["-o"])
        .arg(&receipt)
        .arg("--encrypt")
        .assert()
        .success();
    handoff()
        .env("RFHM_PASSPHRASE", "a long test passphrase")
        .arg("verify")
        .arg(receipt.join("manifest.json.age"))
        .arg(&source)
        .args(["--public-key"])
        .arg(temp.path().join("sender.key.pub"))
        .assert()
        .success()
        .stdout(predicate::str::contains("0 files"));
}

#[test]
fn ten_thousand_files_reports_only_the_changed_path() {
    let temp = tempdir().unwrap();
    let source = temp.path().join("source");
    let key = temp.path().join("sender.key");
    let receipt = temp.path().join("receipt");
    fs::create_dir(&source).unwrap();
    for index in 0..10_000 {
        fs::write(
            source.join(format!("item-{index:05}.txt")),
            format!("value {index}\n"),
        )
        .unwrap();
    }
    handoff()
        .args(["keygen", "-o"])
        .arg(&key)
        .assert()
        .success();
    handoff()
        .arg("create")
        .arg(&source)
        .args(["-k"])
        .arg(&key)
        .args(["-o"])
        .arg(&receipt)
        .assert()
        .success();
    fs::write(source.join("item-04217.txt"), "changed\n").unwrap();
    let output = handoff()
        .args(["--json", "verify"])
        .arg(receipt.join("manifest.json"))
        .arg(&source)
        .args(["--public-key"])
        .arg(temp.path().join("sender.key.pub"))
        .assert()
        .code(3)
        .get_output()
        .stdout
        .clone();
    let report: serde_json::Value = serde_json::from_slice(&output).unwrap();
    assert_eq!(report["altered"], serde_json::json!(["item-04217.txt"]));
    assert_eq!(report["missing"], serde_json::json!([]));
    assert_eq!(report["unexpected"], serde_json::json!([]));
}

fn copy_dir(source: &std::path::Path, target: &std::path::Path) {
    fs::create_dir_all(target).unwrap();
    for entry in fs::read_dir(source).unwrap() {
        let entry = entry.unwrap();
        let destination = target.join(entry.file_name());
        if entry.file_type().unwrap().is_dir() {
            copy_dir(&entry.path(), &destination);
        } else {
            fs::copy(entry.path(), destination).unwrap();
        }
    }
}
