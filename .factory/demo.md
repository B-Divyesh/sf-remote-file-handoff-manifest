# Demo sandbox

- Web entry: `https://remote-file-handoff-manifest.sociobot.in/?demo=1` redirects to `/demo/`.
- CLI entry: `handoff demo`.
- Sample: Project Aurora in `examples/client-handoff/` has an approved logo, video proxy, and approval note.
- Result: the recipient copy has one missing video, one changed logo, and one extra note.
- Web isolation: sample data is bundled and held only in memory. It does not use localStorage, IndexedDB, OPFS, or selected user files.
- CLI isolation: each run creates a new `handoff-demo-<process>-<attempt>` folder under the operating system temporary directory.
- Reset: **Reset demo** reruns the bundled sample. **Start for real** leaves demo mode without copying data.
