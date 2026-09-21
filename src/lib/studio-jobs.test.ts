import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyCancel, canRetry, isTerminal, nextStage } from "./studio-jobs.ts";
import { jaccard, maxSimilarity, rejectTooClose } from "../data/studio/similarity.ts";

describe("job machine", () => {
  it("advances stages in order without skipping", () => {
    assert.equal(nextStage("queued"), "guard");
    assert.equal(nextStage("guard"), "archive");
    assert.equal(nextStage("archive"), "generate");
    assert.equal(nextStage("generate"), "similarity");
    assert.equal(nextStage("similarity"), "persist");
    assert.equal(nextStage("persist"), "done");
    assert.equal(nextStage("done"), "done");
  });

  it("cancel from running is terminal cancelled", () => {
    const next = applyCancel({
      id: "j1",
      status: "running",
      stage: "generate",
      error: null,
      cancelRequested: true,
      resultCount: 0,
    });
    assert.equal(next.status, "cancelled");
    assert.equal(isTerminal(next.status), true);
  });

  it("does not un-cancel a succeeded job", () => {
    const next = applyCancel({
      id: "j1",
      status: "succeeded",
      stage: "done",
      error: null,
      cancelRequested: true,
      resultCount: 3,
    });
    assert.equal(next.status, "succeeded");
  });

  it("retry is allowed only for failed, partial, cancelled", () => {
    assert.equal(canRetry("failed"), true);
    assert.equal(canRetry("partial"), true);
    assert.equal(canRetry("cancelled"), true);
    assert.equal(canRetry("succeeded"), false);
    assert.equal(canRetry("running"), false);
    assert.equal(canRetry("queued"), false);
  });
});

describe("similarity adapter", () => {
  it("identical fingerprints are 1", () => {
    assert.equal(jaccard("انگشتر لیدو مجسمه", "انگشتر لیدو مجسمه"), 1);
  });

  it("disjoint text is 0", () => {
    assert.equal(jaccard("اسکله موناکو", "xyz abc"), 0);
  });

  it("maxSimilarity picks the closest archive row", () => {
    const score = maxSimilarity("انگشتر لیدو اسکله", ["انگشتر لیدو اسکله شب", "گوشواره بررا"]);
    assert.ok(score > 0.4);
    assert.ok(score <= 1);
  });

  it("rejectTooClose drops archive twins and keeps distant drafts", () => {
    const kept = rejectTooClose(
      [
        { fingerprint: "انگشتر لیدو اسکله شب" },
        { fingerprint: "گوشواره مه پل پاریس قوس" },
      ],
      ["انگشتر لیدو اسکله شب"],
    );
    assert.equal(kept.length, 1);
    assert.equal(kept[0]?.fingerprint, "گوشواره مه پل پاریس قوس");
  });
});
