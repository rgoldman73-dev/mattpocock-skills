# Claude Code and Codex packages

This is Robert Goldman's unofficial fork of [Matt Pocock's MIT-licensed skills](https://github.com/mattpocock/skills), initially pinned to `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`. It ships exactly the 27 skills selected by the existing Claude manifest: 20 engineering skills and 7 productivity skills. Draft, miscellaneous, and deprecated buckets are not distributed.

## Install this fork

Claude Code:

```bash
claude plugin marketplace add rgoldman73-dev/mattpocock-skills
claude plugin install mattpocock-skills@rgoldman-mattpocock
```

Codex:

```bash
codex plugin marketplace add rgoldman73-dev/mattpocock-skills
codex plugin add mattpocock-skills@rgoldman-mattpocock
```

Start a new session. Run `/mattpocock-skills:setup-matt-pocock-skills` in Claude Code, or select the qualified `mattpocock-skills:setup-matt-pocock-skills` entry in Codex's skill picker. Prefer qualified entries when pstack also supplies `teach` or `tdd`. Install one copy per host; the official marketplace command installs upstream, not this fork.

For local development replace the GitHub shorthand in the add commands with the absolute checkout path. The install block is maintained in `.agents/install-block.md`.

## Packages and maintenance

The existing `.claude-plugin/plugin.json` remains the canonical promoted skill selection. Its author and MIT attribution are preserved. This fork's Claude marketplace points to a clean generated package in `plugins/mattpocock-skills-claude`, with the same bucket paths and original skill contents. Development context files and unpromoted skills do not enter that package.

Codex's package lives in `plugins/mattpocock-skills`, with a single flat `skills/` directory of real copies, not symlinks. Existing `agents/openai.yaml` metadata and explicit invocation policies survive cache installation. Each entrypoint links to a Codex adapter that maps upstream Skill-tool instructions to reading the corresponding bundled skill with available file tools. Other resources and script executable modes are preserved.

```bash
npm run build-codex-plugin
npm run check-codex-plugin
npm run check-plugin-version
claude plugin validate .claude-plugin/marketplace.json --strict
claude plugin validate plugins/mattpocock-skills-claude --strict
```

The build command regenerates both packages. It verifies that the Claude selection equals the promoted buckets, rejects duplicate names, preserves invocation policy, and in check mode compares every generated file and executable bit. Edit canonical `skills/`, manifests or `scripts/plugin-templates/`, then regenerate; do not edit `plugins/` directly. The release version command regenerates packages after syncing the canonical Claude version. A CI check gates drift.

No hooks, MCP servers, credentials, global configuration, or schedulers are bundled. Collaboration runs only when available and permitted; otherwise do steps serially and disclose reduced independence. External writes remain under the user's authorization and host approvals.

Verified on 2026-10-02 with Claude Code 2.1.285 and Codex CLI 0.159.3: strict Claude marketplace and clean-package checks, temporary-profile native installs, installed resource integrity, and Codex app-server discovery of exactly 27 qualified skills without parsing errors. Native installation and discovery were tested; individual operational workflows were not exercised against a live project. Original upstream release notes and documentation retain historical examples and attribution.

Packaging references: [Claude plugins](https://code.claude.com/docs/en/plugins-reference), [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins).
