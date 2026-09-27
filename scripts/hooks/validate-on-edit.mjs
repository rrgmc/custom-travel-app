#!/usr/bin/env node
// Claude Code PostToolUse hook: after Claude edits trip/trip.yaml or the schema, run the validator.
// Exit code 2 sends the errors back to Claude so it fixes them right away.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

let input = "";
for await (const chunk of process.stdin) input += chunk;
let file = "";
try {
  file = JSON.parse(input)?.tool_input?.file_path ?? "";
} catch { /* not JSON: nothing to do */ }
if (!/trip\/trip\.(yaml|schema\.json)$/.test(file)) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
if (!existsSync(join(root, "node_modules/yaml"))) {
  process.stderr.write("Can't validate trip.yaml: dependencies aren't installed. Run `npm ci`, then `npm run validate`.\n");
  process.exit(2);
}
try {
  execFileSync("node", [join(root, "scripts/validate.mjs")], { stdio: ["ignore", "pipe", "pipe"] });
} catch (e) {
  process.stderr.write(String(e.stdout ?? "") + String(e.stderr ?? ""));
  process.exit(2);
}
