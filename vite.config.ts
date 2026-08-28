import { defineConfig, type Plugin } from "vite";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

function serviceWorker(): Plugin {
  let outputDirectory = "";
  return {
    name: "rfhm-service-worker",
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = listOutputFiles(outputDirectory)
        .filter((file) => file !== "sw.js" && file !== "staticwebapp.config.json" && !file.endsWith(".html"))
        .sort();
      const shell = [...new Set([...files.map((file) => `/${file}`), "/", "/demo/", "/privacy/", "/terms/"])].sort();
      const versionHash = createHash("sha256");
      for (const file of files) {
        versionHash.update(file);
        versionHash.update(readFileSync(join(outputDirectory, file)));
      }
      const version = `rfhm-${versionHash.digest("hex").slice(0, 12)}`;
      writeFileSync(
        join(outputDirectory, "sw.js"),
        `const CACHE=${JSON.stringify(version)};const SHELL=${JSON.stringify(shell)};self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==location.origin)return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone));}return response;}).catch(()=>event.request.mode==="navigate"?caches.match("/"):undefined)));});`,
      );
    },
  };
}

function listOutputFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory()
      ? listOutputFiles(file).map((child) => join(entry.name, child))
      : [relative(directory, file)];
  });
}

export default defineConfig({
  root: "site",
  publicDir: "public",
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: {
      input: {
        home: resolve(projectRoot, "site/index.html"),
        demo: resolve(projectRoot, "site/demo/index.html"),
        privacy: resolve(projectRoot, "site/privacy/index.html"),
        terms: resolve(projectRoot, "site/terms/index.html"),
        notFound: resolve(projectRoot, "site/404.html"),
      },
    },
  },
  plugins: [serviceWorker()],
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
