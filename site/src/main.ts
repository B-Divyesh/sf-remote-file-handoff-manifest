import { compareInventory, parseManifest, verifySignature, type FileLike } from "./verifier";

if (new URLSearchParams(location.search).get("demo") === "1" && location.pathname === "/") {
  location.replace("/demo/");
}

const form = document.querySelector<HTMLFormElement>("#verify-form");
const manifestInput = document.querySelector<HTMLInputElement>("#manifest-file");
const folderInput = document.querySelector<HTMLInputElement>("#folder-files");
const keyInput = document.querySelector<HTMLInputElement>("#public-key-file");
const panel = document.querySelector<HTMLElement>("#result-panel");
const kicker = document.querySelector<HTMLElement>("#result-kicker");
const title = document.querySelector<HTMLElement>("#result-title");
const summary = document.querySelector<HTMLElement>("#result-summary");
const details = document.querySelector<HTMLElement>("#result-details");
const offlineNote = document.querySelector<HTMLElement>("#offline-note");

folderInput?.setAttribute("webkitdirectory", "");

document.querySelector<HTMLButtonElement>(".copy-button")?.addEventListener("click", async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const copy = button.dataset.copy ?? "";
  try {
    await navigator.clipboard.writeText(copy);
    button.textContent = "Copied to clipboard";
  } catch {
    button.textContent = "Clipboard access failed. Select the command above.";
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
    render("error", "CHOOSE THREE ITEMS", "Choose all three items", "Choose the signed file list, received folder, and verified sender key.");
    const firstEmpty = [manifestInput, folderInput, keyInput].find((input) => !input?.files?.length);
    firstEmpty?.focus();
    return;
  }
  render("loading", "CHECKING ON THIS DEVICE", "Checking every file…", "Keep this tab open while the browser reads your selected files.");
  panel?.setAttribute("aria-busy", "true");
  try {
    const manifest = parseManifest(await manifestInput.files[0].text());
    await verifySignature(manifest, await keyInput.files[0].text());
    const files = [...folderInput.files].map(browserFile);
    const report = await compareInventory(manifest.payload.files, files);
    const expired = manifest.payload.expires_at ? new Date(manifest.payload.expires_at).getTime() < Date.now() : false;
    const issueCount = report.missing.length + report.altered.length + report.unexpected.length;
    if (issueCount === 0 && !expired) {
      const count = manifest.payload.file_count;
      render("success", "VERIFIED // SIGNATURE VALID", "Selected files match", count === 1 ? "1 file matches the signed file list byte for byte." : `${count.toLocaleString()} files match the signed file list byte for byte.`);
      renderDetails([["Matched", manifest.payload.file_count.toLocaleString(), "ok"]]);
    } else {
      render("failure", "DIFFERENCES FOUND", expired ? "The signed file list expired or files differ" : `${issueCount} difference${issueCount === 1 ? "" : "s"} found`, "Review the exact paths before accepting this handoff.");
      renderDetails([
        ...(expired ? [["Expired", manifest.payload.expires_at ?? "", "warn"]] : []),
        ...report.missing.map((path) => ["Missing", path, "bad"]),
        ...report.altered.map((path) => ["Changed", path, "bad"]),
        ...report.unexpected.map((path) => ["Extra", path, "warn"]),
      ]);
    }
  } catch (error) {
    render("error", "VERIFICATION STOPPED", "Could not verify this handoff", error instanceof Error ? error.message : "The browser stopped unexpectedly. Run the command-line verifier instead.");
  } finally {
    panel?.setAttribute("aria-busy", "false");
  }
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

function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
}

if (import.meta.env.PROD) {
  // Registration does not depend on page layout. Starting it immediately avoids
  // missing `load` when a restored or very fast page evaluates this module late.
  registerServiceWorker();
}

const demoLines = [
  "Signed file list: 3 files",
  "MISMATCH — the received folder differs",
  "MISSING: exports/final-cut.mov",
  "CHANGED: brand/logo-master.ai",
  "EXTRA: notes/unrequested.txt",
];
let demoTimers: number[] = [];

function resetAndRunDemo(): void {
  demoTimers.forEach((timer) => window.clearTimeout(timer));
  demoTimers = [];
  const recording = document.querySelector<HTMLElement>("#demo-recording");
  const demoPanel = document.querySelector<HTMLElement>("#demo-result");
  if (!recording || !demoPanel) return;
  recording.replaceChildren(makeRecordingLine("$ handoff demo", "command"));
  demoPanel.dataset.state = "loading";
  demoPanel.querySelector(".result-kicker")!.textContent = "CHECKING // BUNDLED FILES";
  demoPanel.querySelector("h2")!.textContent = "Checking three sample files…";
  demoPanel.querySelector(":scope > p:not(.result-kicker)")!.textContent = "The sample exists only in this demo.";
  demoPanel.querySelector(".demo-result-details")!.replaceChildren();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  demoLines.forEach((line, index) => {
    const timer = window.setTimeout(() => recording.append(makeRecordingLine(line)), reduced ? 0 : 240 * (index + 1));
    demoTimers.push(timer);
  });
  demoTimers.push(window.setTimeout(() => {
    demoPanel.dataset.state = "failure";
    demoPanel.querySelector(".result-kicker")!.textContent = "DIFFERENCES FOUND // 3";
    demoPanel.querySelector("h2")!.textContent = "The handoff does not match";
    demoPanel.querySelector(":scope > p:not(.result-kicker)")!.textContent = "Review these exact paths before accepting the folder.";
    const details = demoPanel.querySelector<HTMLElement>(".demo-result-details");
    if (details) {
      const list = document.createElement("ul");
      list.className = "result-list";
      for (const [label, path, state] of [
        ["Missing", "exports/final-cut.mov", "bad"],
        ["Changed", "brand/logo-master.ai", "bad"],
        ["Extra", "notes/unrequested.txt", "warn"],
      ]) {
        const item = document.createElement("li");
        item.dataset.state = state;
        const strong = document.createElement("strong");
        strong.textContent = label;
        const value = document.createElement("span");
        value.textContent = path;
        item.append(strong, value);
        list.append(item);
      }
      details.replaceChildren(list);
    }
    const play = document.querySelector<HTMLButtonElement>("#play-demo");
    if (play) play.textContent = "Replay sample check";
  }, reduced ? 10 : 1450));
}

function makeRecordingLine(text: string, className = ""): HTMLParagraphElement {
  const line = document.createElement("p");
  line.textContent = text;
  if (className) line.className = className;
  return line;
}

document.querySelector("#play-demo")?.addEventListener("click", resetAndRunDemo);
document.querySelector("#reset-demo")?.addEventListener("click", resetAndRunDemo);
if (document.body.dataset.page === "demo") resetAndRunDemo();

window.addEventListener("pagehide", () => sessionStorage.setItem("handoff:focus-route", "1"));
window.addEventListener("pageshow", () => {
  if (sessionStorage.getItem("handoff:focus-route") !== "1") return;
  sessionStorage.removeItem("handoff:focus-route");
  const heading = document.querySelector<HTMLElement>("main h1");
  heading?.focus();
  const status = document.querySelector<HTMLElement>("#route-status");
  if (status && heading) status.textContent = heading.textContent ?? document.title;
});
