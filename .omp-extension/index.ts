import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, symlinkSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "..", "skills");

const SKILL_NAMES = [
  "brainstorming",
  "dispatching-parallel-agents",
  "executing-plans",
  "finishing-a-development-branch",
  "receiving-code-review",
  "requesting-code-review",
  "subagent-driven-development",
  "systematic-debugging",
  "test-driven-development",
  "using-git-worktrees",
  "using-superpowers",
  "verification-before-completion",
  "writing-plans",
  "writing-skills",
];

// OMP's plugin system has no working mechanism to expose skills from plugins.
// The resources_discover event exists in the ExtensionAPI type system and
// runner.ts has the handler plumbing, but emitResourcesDiscover() is never
// called anywhere in the OMP codebase — the wiring is missing.
//
// Workaround: symlink each skill directory into ~/.omp/agent/skills/, which
// is scanned by the native builtin provider (priority 100) on every skill
// lookup. The native provider reads the filesystem fresh each call, so these
// symlinks take effect immediately without a session restart.
//
// A non-symlink entry at the target path is left untouched, allowing a
// same-named user-level skill to override the plugin's version.
function ensureSkillSymlinks(): void {
  const userSkillsDir = join(homedir(), ".omp", "agent", "skills");
  mkdirSync(userSkillsDir, { recursive: true });

  for (const name of SKILL_NAMES) {
    const source = join(SKILLS_DIR, name);
    const target = join(userSkillsDir, name);

    try {
      const stat = lstatSync(target);
      if (!stat.isSymbolicLink()) continue; // real entry — leave it alone
      if (readlinkSync(target) === source) continue; // already correct
      rmSync(target, { force: true }); // stale symlink — replace below
    } catch {
      // target does not exist — fall through to create
    }

    try {
      symlinkSync(source, target);
    } catch {
      // best-effort; if this fails the skill just won't be discoverable
    }
  }
}

export default function superpowers(pi: ExtensionAPI): void {
  pi.setLabel("Superpowers");

  // Symlink skills into ~/.omp/agent/skills/ synchronously during extension
  // loading, before OMP builds the system prompt and calls loadSkills().
  // session_start fires after skills are already loaded, so that's too late.
  ensureSkillSymlinks();

  // Keep resources_discover for when OMP wires up emitResourcesDiscover().
  pi.on("resources_discover", () => ({
    skillPaths: SKILL_NAMES.map(name => join(SKILLS_DIR, name)),
  }));

  // Inject the using-superpowers bootstrap so the agent sees the skill mandate
  // immediately. Re-inject after compaction for the same reason.
  const inject = () => {
    const content = readFileSync(
      join(SKILLS_DIR, "using-superpowers", "SKILL.md"),
      "utf-8",
    );
    pi.sendMessage(
      `<EXTREMELY_IMPORTANT>\n${content}\n</EXTREMELY_IMPORTANT>`,
      { deliverAs: "nextTurn" },
    );
  };

  pi.on("session_start", inject);
  pi.on("session_compact", inject);
}
