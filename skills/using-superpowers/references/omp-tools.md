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
| `Task` tool (dispatch subagent) | `task` tool with an agent type from the `agent` parameter (`task`, `reviewer`, `explore`, `plan`, etc.) |
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
