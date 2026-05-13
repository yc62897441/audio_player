#!/usr/bin/env node
// PostToolUse hook: run prettier on the file that was just written/edited.
// Reads the tool payload from stdin, extracts file_path, and silently formats.
// Exits 0 even on failure so a misformatted file never blocks Claude's work.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, relative, resolve } from "node:path";

const FORMATTABLE = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".jsonc",
    ".md",
    ".css",
    ".html",
    ".yml",
    ".yaml",
]);

const chunks = [];
process.stdin.on("data", (c) => chunks.push(c));
process.stdin.on("end", () => {
    try {
        const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const filePath = payload?.tool_input?.file_path;
        if (typeof filePath !== "string" || filePath.length === 0) return;
        if (!FORMATTABLE.has(extname(filePath).toLowerCase())) return;
        if (!existsSync(filePath)) return;

        // Only format files inside the project root.
        const rel = relative(process.cwd(), resolve(filePath));
        if (rel.startsWith("..") || rel.includes("node_modules")) return;

        spawnSync("npx", ["prettier", "--write", "--log-level", "silent", filePath], {
            stdio: "ignore",
            shell: true,
            timeout: 15000,
        });
    } catch {
        // Swallow — never block tool execution on hook failures.
    }
});
