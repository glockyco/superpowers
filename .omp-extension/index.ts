import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { readFileSync } from "fs";
import { join, dirname } from "path";
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

export default function superpowers(pi: ExtensionAPI): void {
  pi.setLabel("Superpowers");

  // Register all skill directories with OMP's skill discovery system.
  // Each path must point to the directory containing SKILL.md (not the file itself).
  pi.on("resources_discover", () => ({
    skillPaths: SKILL_NAMES.map(name => join(SKILLS_DIR, name)),
  }));

  // Inject the using-superpowers bootstrap at session start so the agent sees
  // the skill mandate immediately, without having to decide to read it first.
  // Re-inject after compaction for the same reason.
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
