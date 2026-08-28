# Demo sandbox

- Web entry: `https://remote-file-handoff-manifest.sociobot.in/?demo=1` redirects to `/demo/`.
- Command-line entry: `handoff demo`.
- Sample: Project Aurora has honest Markdown and text project files under `examples/client-handoff/`.
- Result: the recipient copy has one missing delivery checklist, one changed logo-notes file, and one extra note.
- Web isolation: sample data is bundled and held only in memory. It does not use localStorage, IndexedDB, OPFS, or selected user files.
- CLI isolation: each run creates a new `handoff-demo-<process>-<attempt>` folder under the operating system temporary directory.
- Reset: **Reset demo** reruns the bundled sample. **Start for real** leaves demo mode without copying data.
