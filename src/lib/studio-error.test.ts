import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studioClientError } from "./studio-error.ts";

describe("studioClientError", () => {
  it("maps Unauthorized to Persian sign-in copy", () => {
    assert.equal(studioClientError(new Error("Unauthorized"), "x"), "ورود لازم است.");
  });

  it("keeps fallback for unknown errors", () => {
    assert.equal(studioClientError(new Error("boom"), "ذخیره شکست خورد."), "ذخیره شکست خورد.");
  });
});
