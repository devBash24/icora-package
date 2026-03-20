import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ApiClient } from "../src/api.js";
import { handleAddAllCommand, handleAddCommand, handleDoctorCommand, handleInitCommand } from "../src/commands.js";

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "icora-commands-"));
}

function createApiClient(): ApiClient {
  return new ApiClient({
    fetchImpl: async (input) => {
      const url = String(input);

      if (url.includes("/icons/ai")) {
        return new Response(
          JSON.stringify({
            data: {
              name: "ai",
              content: "export const ai = GenIcon({ tag: 'svg', attr: {}, child: [] });",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.includes("DefinitelyNotRealIcon")) {
        return new Response(JSON.stringify({ message: "Icon not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          data: {
            name: "AiOutlineUserAdd",
            content: "export const AiOutlineUserAdd = GenIcon({ tag: 'svg', attr: {}, child: [] });",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  });
}

test("handleInitCommand creates canonical config and generator file", async () => {
  const cwd = createTempDir();
  await handleInitCommand(
    { output: "icons" },
    { cwd, apiClient: createApiClient() },
  );

  assert.equal(fs.existsSync(path.join(cwd, ".iconiumrc.json")), true);
  assert.equal(fs.existsSync(path.join(cwd, "icons", "gen.tsx")), true);
});

test("handleAddCommand writes fetched icons", async () => {
  const cwd = createTempDir();
  fs.writeFileSync(path.join(cwd, ".iconiumrc.json"), JSON.stringify({ version: 1, targetDirectory: "icons" }), "utf8");

  await handleAddCommand(["ai-AiOutlineUserAdd"], {}, { cwd, apiClient: createApiClient() });

  assert.equal(fs.existsSync(path.join(cwd, "icons", "ai", "AiOutlineUserAdd.tsx")), true);
});

test("handleAddCommand reports invalid icons without throwing", async () => {
  const cwd = createTempDir();
  fs.writeFileSync(path.join(cwd, ".iconiumrc.json"), JSON.stringify({ version: 1, targetDirectory: "icons" }), "utf8");

  await handleAddCommand(["badformat", "ai-DefinitelyNotRealIcon"], {}, { cwd, apiClient: createApiClient() });
  assert.equal(process.exitCode, 1);
  process.exitCode = undefined;
});

test("handleAddAllCommand writes library bundle", async () => {
  const cwd = createTempDir();
  fs.writeFileSync(path.join(cwd, ".iconiumrc.json"), JSON.stringify({ version: 1, targetDirectory: "icons" }), "utf8");

  await handleAddAllCommand("ai", {}, { cwd, apiClient: createApiClient() });

  assert.equal(fs.existsSync(path.join(cwd, "icons", "ai", "ai.tsx")), true);
});

test("handleDoctorCommand completes against a valid setup", async () => {
  const cwd = createTempDir();
  fs.writeFileSync(path.join(cwd, ".iconiumrc.json"), JSON.stringify({ version: 1, targetDirectory: "icons" }), "utf8");

  await handleDoctorCommand({}, { cwd, apiClient: createApiClient() });
  assert.equal(process.exitCode, undefined);
});
