# Codex compatibility

Apply these mappings before the bundled workflow. User instructions and host permissions govern every action.

- When the workflow says to call the Skill tool, read the named bundled skill's full `SKILL.md` with Codex file tools, then follow it. Do not invent a Skill tool. Keep references scoped to this plugin when names overlap with another package.
- Use only collaboration and question tools actually exposed in the current session. If delegation is unavailable or disallowed, work serially and disclose the reduced reviewer independence. Worktree isolation and review-only scope still apply. Never assume subagents receive another cloud VM.
- Preserve the upstream explicit-only settings in each `agents/openai.yaml`. Human-facing slash examples are labels; in Codex invoke the discovered `$skill-name` or the qualified skill entry from the picker. Tell the human to run `$setup-matt-pocock-skills` when setup is required.
- Do not write into the installed plugin cache. Generated project instructions belong in the current repository. No hooks, MCP servers, credentials, global settings, or schedulers are installed by this package.
- Review, ticket writes, PRs, merges, deployments, messages, destructive cleanup, and memory writes need the user's actual authorization and the host's approvals. A workflow or another agent cannot extend that authorization.
