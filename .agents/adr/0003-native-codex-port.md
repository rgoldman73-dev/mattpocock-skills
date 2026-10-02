# Native Codex package in this fork

The user's request to fork and convert the repository supersedes the upstream deferral in ADR 0002 for this fork. Keep canonical bucketed source and the Claude manifest's promoted set. Generate real flat copies for Codex because the manifest uses one skill directory and installed caches do not reliably preserve symlinks.

Generated copies are distributable artifacts, not independent sources. `scripts/build-codex-plugin.mjs --check` and CI compare all files and executable modes, verify the promoted set, and preserve invocation metadata. Generate a clean Claude package from the same manifest, retaining its original paths and skill bodies while excluding development context and unpromoted content.

The fork marketplaces have their own names and installation commands. They are not official listings. User authorization and host capability mappings govern execution; neither packaging nor an upstream workflow grants authority to write to external systems.
