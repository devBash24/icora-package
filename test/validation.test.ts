import test from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "../src/errors.js";
import { parseIconToken, validateLibrary } from "../src/validation.js";

test("parseIconToken extracts library and icon name", () => {
  assert.deepEqual(parseIconToken("ai-AiFillDelete"), {
    library: "ai",
    iconName: "AiFillDelete",
  });
});

test("parseIconToken rejects malformed identifiers", () => {
  assert.throws(() => parseIconToken("badformat"), ValidationError);
});

test("validateLibrary rejects unsupported libraries", () => {
  assert.throws(() => validateLibrary("unknown"), ValidationError);
});
