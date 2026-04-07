# Oh My Pi Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use the
Oh My Pi equivalents below.

## Tool Equivalents

| Skill references | Oh My Pi equivalent |
|-----------------|---------------------|
| `Skill` tool (invoke a skill) | `read skill://skill-name` |
| `Task tool (superpowers:code-reviewer)` | Task tool, `reviewer` agent type |
| `Task tool (general-purpose)` | Task tool, `task` agent type |
| Multiple `Task` calls (parallel) | Parallel Task tool calls |
| `TodoWrite` (task tracking) | Todo Write tool |
| `Read`, `Write`, `Edit` (files) | Use native file tools |
| `Bash` (run commands) | Use native bash tool |

## Skill References

When a skill says `superpowers:skill-name`, read `skill://skill-name`.

Example: `superpowers:systematic-debugging` → `read skill://systematic-debugging`

## Subagent Dispatch

When a skill says to dispatch a named agent type like `superpowers:code-reviewer`,
use the Task tool with the appropriate Oh My Pi agent type:

- `superpowers:code-reviewer` → Task tool, `reviewer` agent
- `Task tool (general-purpose)` with inline prompt → Task tool, `task` agent

**Dispatching a reviewer:**

```
Task tool (reviewer agent):
  description: "Code review for <what was implemented>"
  assignment: |
    Read skill://requesting-code-review/code-reviewer.md for the template.
    Fill in: WHAT_WAS_IMPLEMENTED, PLAN_OR_REQUIREMENTS, BASE_SHA, HEAD_SHA, DESCRIPTION
    Run git diff and review against the template's checklist.
    Return structured review output per the template's Output Format section.
```

The `reviewer` agent has these tools: read, grep, find, bash, lsp, web_search,
ast_grep, report_finding, submit_result.