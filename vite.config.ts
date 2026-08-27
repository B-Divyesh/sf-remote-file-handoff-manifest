import { defineConfig, type Plugin } from "vite";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

function serviceWorker(): Plugin {
  return {
    name: "rfhm-service-worker",
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).map((file) => `/${file}`);
      assets.push("/", "/privacy/", "/terms/", "/relay-hero.webp");
      const unique = [...new Set(assets)].sort();
      const version = `rfhm-${createHash("sha256").update(unique.join("\n")).digest("hex").slice(0, 12)}`;
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: `const CACHE=${JSON.stringify(version)};const SHELL=${JSON.stringify(unique)};self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==location.origin)return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone));}return response;}).catch(()=>event.request.mode==="navigate"?caches.match("/"):undefined)));});`,
      });
    },
  };
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
        privacy: resolve(projectRoot, "site/privacy/index.html"),
        terms: resolve(projectRoot, "site/terms/index.html"),
      },
    },
  },
  plugins: [serviceWorker()],
});
