import test from "node:test";
import assert from "node:assert/strict";
import { ApiClient } from "../src/api.js";
import { ApiError, NetworkError } from "../src/errors.js";

function createResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("ApiClient returns icon payload on success", async () => {
  const api = new ApiClient({
    fetchImpl: async () => createResponse(200, { data: { name: "AiFillDelete", content: "export const x = 1;" } }),
  });

  const result = await api.fetchIcon("ai", "AiFillDelete");
  assert.equal(result.name, "AiFillDelete");
});

test("ApiClient maps 404 responses to ApiError", async () => {
  const api = new ApiClient({
    fetchImpl: async () => createResponse(404, { message: "Icon not found" }),
  });

  await assert.rejects(() => api.fetchIcon("ai", "MissingIcon"), ApiError);
});

test("ApiClient retries once for network failures before surfacing NetworkError", async () => {
  let calls = 0;
  const api = new ApiClient({
    fetchImpl: async () => {
      calls += 1;
      throw new TypeError("network");
    },
  });

  await assert.rejects(() => api.fetchIcon("ai", "AiFillDelete"), NetworkError);
  assert.equal(calls, 2);
});
