import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig, saveConfig } from "../src/config.js";

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "icora-config-"));
}

test("loadConfig returns default config when no file exists", () => {
  const cwd = createTempDir();
  const loaded = loadConfig(cwd);

  assert.equal(loaded.source, "default");
  assert.equal(loaded.config.targetDirectory, "src/assets/icons");
});

test("saveConfig writes canonical config and loadConfig reads it", () => {
  const cwd = createTempDir();
  saveConfig(cwd, { version: 1, targetDirectory: "custom/icons" });

  const loaded = loadConfig(cwd);
  assert.equal(loaded.source, "canonical");
  assert.equal(loaded.config.targetDirectory, "custom/icons");
});

test("loadConfig reads legacy config when canonical config is absent", () => {
  const cwd = createTempDir();
  fs.writeFileSync(path.join(cwd, ".iconiumrc"), JSON.stringify({ targetDirectory: "legacy/icons" }), "utf8");

  const loaded = loadConfig(cwd);
  assert.equal(loaded.source, "legacy");
  assert.equal(loaded.config.targetDirectory, "legacy/icons");
});
