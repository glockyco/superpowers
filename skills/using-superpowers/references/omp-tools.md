# Oh My Pi Tool Mapping

Skills use Claude Code tool names and the `superpowers:` plugin-namespace prefix.
When you encounter these in a skill body, substitute the Oh My Pi equivalents below.

## Skill invocation

Oh My Pi has no `Skill` tool. Skills are loaded via the `read` tool with a
`skill://` URI.

| Skill body says | In Oh My Pi |
|---|---|
| `Use the Skill tool to invoke X` | `read skill://X` |
| `Invoke the X skill` | `read skill://X` |
| `superpowers:foo` | `foo` — Oh My Pi registers skills under their bare `name:` from frontmatter, with no plugin prefix. Strip `superpowers:` from any cross-reference. Example: `superpowers:brainstorming` → `read skill://brainstorming`. |

## Tool equivalents

| Skill references | Oh My Pi equivalent |
|---|---|
| `TodoWrite` (task tracking) | `todo_write` tool |
| `Task` tool (dispatch subagent) | `task` tool with an agent type from the `agent` parameter (`task`, `reviewer`, `explore`, `plan`, `designer`, `librarian`) |
| Multiple `Task` calls (parallel) | Multiple `task` calls in the same response (parallel) |
| `Read`, `Write`, `Edit` (files) | Native `read`, `write`, `edit` tools |
| `Bash` (run commands) | Native `bash` tool |
| `Grep` / `Glob` | Native `search` / `find` tools |
| `WebFetch` / `WebSearch` | Native `web_search` tool; for fetching a URL's contents, use `read` with the URL as the path |

## Subagent dispatch

When a skill names a specific subagent like `code-reviewer` or
`general-purpose`, use the Oh My Pi `task` tool with the matching agent type:

| Skill names | `task` agent |
|---|---|
| `code-reviewer` / `code-quality-reviewer` | `reviewer` |
| `general-purpose` / `implementer` / `spec-reviewer` | `task` |
| `explore` (read-only discovery) | `explore` |
| `plan` (architectural decisions) | `plan` |
| `designer` (UI / visual specialist) | `designer` |
| `librarian` (library / API research) | `librarian` |

Example dispatch:

```
task tool (reviewer agent):
  description: "Code review for <what was implemented>"
  assignment: |
    Read skill://requesting-code-review/code-reviewer.md for the template.
    Fill in: WHAT_WAS_IMPLEMENTED, PLAN_OR_REQUIREMENTS, BASE_SHA, HEAD_SHA, DESCRIPTION.
    Run git diff and review against the template's checklist.
    Return structured review output per the template's Output Format section.
```

The `reviewer` agent has these tools: read, grep, find, bash, lsp, web_search,
ast_grep, report_finding, submit_result.

## Plan mode

Plan mode in Oh My Pi is a session-level state, **not** an agent tool:

- **Entering plan mode** is a user action — they press `Alt+Shift+P` (the default `app.plan.toggle` keybinding) or invoke the equivalent command. There is no `EnterPlanMode` tool. When upstream skills say "About to EnterPlanMode? → brainstorm first", read it as "Just entered plan mode? → brainstorm first." You detect plan mode by the `plan-mode-active` system-prompt block Oh My Pi injects when the user toggles it on, which constrains you to read-only operations and a single plan file at `local://<name>.md`.
- **Exiting plan mode** uses the generic `resolve` tool with `{ action: "apply", reason, extra: { title } }`. The dedicated `exit_plan_mode` tool was removed in Oh My Pi 15.0.1. The plan content itself is written to the `local://` path via `edit`/`write` *before* calling `resolve`; `resolve` is the approval gate, not the plan-writing step. You MUST call `resolve` yourself when the plan is ready — never ask the user via text or `ask`.
