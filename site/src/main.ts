import { compareInventory, parseManifest, verifySignature, type FileLike } from "./verifier";

const form = document.querySelector<HTMLFormElement>("#verify-form");
const manifestInput = document.querySelector<HTMLInputElement>("#manifest-file");
const folderInput = document.querySelector<HTMLInputElement>("#folder-files");
const keyInput = document.querySelector<HTMLInputElement>("#public-key-file");
const panel = document.querySelector<HTMLElement>("#result-panel");
const kicker = document.querySelector<HTMLElement>("#result-kicker");
const title = document.querySelector<HTMLElement>("#result-title");
const summary = document.querySelector<HTMLElement>("#result-summary");
const details = document.querySelector<HTMLElement>("#result-details");
const sampleButton = document.querySelector<HTMLButtonElement>("#sample-button");
const offlineNote = document.querySelector<HTMLElement>("#offline-note");

folderInput?.setAttribute("webkitdirectory", "");

document.querySelector<HTMLButtonElement>(".copy-button")?.addEventListener("click", async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const copy = button.dataset.copy ?? "";
  try {
    await navigator.clipboard.writeText(copy);
    button.textContent = "Copied to clipboard";
  } catch {
    button.textContent = "Select the command above to copy";
  }
  window.setTimeout(() => (button.textContent = "Copy install command"), 2200);
});

function setOnlineState(): void {
  if (offlineNote) offlineNote.hidden = navigator.onLine;
}
window.addEventListener("online", setOnlineState);
window.addEventListener("offline", setOnlineState);
setOnlineState();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!manifestInput?.files?.[0] || !folderInput?.files?.length || !keyInput?.files?.[0]) {
    render("error", "INPUT NEEDED", "Choose all three inputs", "Select the JSON manifest, received folder, and trusted sender key before verifying.");
    const firstEmpty = [manifestInput, folderInput, keyInput].find((input) => !input?.files?.length);
    firstEmpty?.focus();
    return;
  }
  render("loading", "HASHING // LOCAL", "Checking every file…", "Keep this tab open. No file content is being uploaded.");
  panel?.setAttribute("aria-busy", "true");
  try {
    const manifest = parseManifest(await manifestInput.files[0].text());
    await verifySignature(manifest, await keyInput.files[0].text());
    const files = [...folderInput.files].map(browserFile);
    const report = await compareInventory(manifest.payload.files, files);
    const expired = manifest.payload.expires_at ? new Date(manifest.payload.expires_at).getTime() < Date.now() : false;
    const issueCount = report.missing.length + report.altered.length + report.unexpected.length;
    if (issueCount === 0 && !expired) {
      render("success", "VERIFIED // SIGNATURE VALID", "Everything arrived intact", `${manifest.payload.file_count.toLocaleString()} files match the signed receipt byte for byte.`);
      renderDetails([["Matched", manifest.payload.file_count.toLocaleString(), "ok"]]);
    } else {
      render("failure", "MISMATCH // REVIEW", expired ? "Receipt expired or files differ" : `${issueCount} difference${issueCount === 1 ? "" : "s"} found`, "Review the exact paths below before accepting this handoff.");
      renderDetails([
        ...(expired ? [["Expired", manifest.payload.expires_at ?? "", "warn"]] : []),
        ...report.missing.map((path) => ["Missing", path, "bad"]),
        ...report.altered.map((path) => ["Altered", path, "bad"]),
        ...report.unexpected.map((path) => ["Unexpected", path, "warn"]),
      ]);
    }
  } catch (error) {
    render("error", "ERROR // STOPPED", "Could not verify this handoff", error instanceof Error ? error.message : "An unexpected browser error occurred. Use the CLI for a detailed check.");
  } finally {
    panel?.setAttribute("aria-busy", "false");
  }
});

sampleButton?.addEventListener("click", () => {
  render("failure", "MISMATCH // SAMPLE", "2 differences found", "This preview shows how an incomplete delivery is reported. No local files were read.");
  renderDetails([
    ["Missing", "exports/final-cut.mov", "bad"],
    ["Altered", "brand/logo-master.ai", "bad"],
  ]);
});

function browserFile(file: File): FileLike {
  const rawPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
  const parts = rawPath.split("/");
  return {
    relativePath: parts.length > 1 ? parts.slice(1).join("/") : rawPath,
    size: file.size,
    bytes: () => file.arrayBuffer(),
  };
}

function render(state: string, kickerText: string, titleText: string, summaryText: string): void {
  if (panel) panel.dataset.state = state;
  if (kicker) kicker.textContent = kickerText;
  if (title) title.textContent = titleText;
  if (summary) summary.textContent = summaryText;
  if (details) details.replaceChildren();
}

function renderDetails(rows: string[][]): void {
  if (!details) return;
  const list = document.createElement("ul");
  list.className = "result-list";
  for (const [label, path, state] of rows) {
    const item = document.createElement("li");
    item.dataset.state = state;
    const tag = document.createElement("strong");
    tag.textContent = label;
    const value = document.createElement("span");
    value.textContent = path;
    item.append(tag, value);
    list.append(item);
  }
  details.replaceChildren(list);
}

if (import.meta.env.PROD && "serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}
