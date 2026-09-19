import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTerminal } from "./studio-jobs.ts";
import { MAX_JOB_TICKS, persistOutcome, planAdvance, type PipelineJob } from "./studio-pipeline.ts";

function run(job: PipelineJob) {
  return planAdvance(job);
}

describe("studio pipeline", () => {
  it("walks queued to persist in six ticks then terminates", () => {
    let job: PipelineJob = { status: "queued", stage: "queued", cancelRequested: false, resultCount: 0 };
    const seen: string[] = [];
    for (let i = 0; i < MAX_JOB_TICKS; i += 1) {
      const plan = run(job);
      seen.push(`${plan.status}:${plan.stage}:${plan.work}`);
      if (plan.work === "persist") {
        const out = persistOutcome(3);
        job = { ...job, status: out.status, stage: out.stage, resultCount: 3 };
      } else {
        job = { ...job, status: plan.status, stage: plan.stage, resultCount: plan.work === "generate" ? 3 : job.resultCount };
      }
      if (isTerminal(job.status)) break;
    }
    assert.equal(job.status, "succeeded");
    assert.ok(seen.includes("running:archive:none"));
    assert.ok(seen.includes("running:generate:archive"));
    assert.ok(seen.includes("running:similarity:generate"));
    assert.ok(seen.includes("running:persist:none"));
    assert.ok(seen.includes("running:done:persist"));
    assert.ok(isTerminal(job.status));
  });

  it("does not loop when stage is done without a terminal status", () => {
    const plan = run({ status: "running", stage: "done", cancelRequested: false, resultCount: 3 });
    assert.equal(plan.status, "succeeded");
    assert.equal(isTerminal(plan.status), true);
    const empty = run({ status: "running", stage: "done", cancelRequested: false, resultCount: 0 });
    assert.equal(empty.status, "failed");
  });

  it("cancel wins over generate", () => {
    const plan = run({ status: "running", stage: "generate", cancelRequested: true, resultCount: 0 });
    assert.equal(plan.status, "cancelled");
    assert.equal(plan.work, "none");
  });

  it("partial persist is explicit, not silent success", () => {
    const out = persistOutcome(2);
    assert.equal(out.status, "partial");
    assert.ok(out.error);
  });

  it("terminal jobs are no-ops", () => {
    const plan = run({ status: "succeeded", stage: "done", cancelRequested: false, resultCount: 3 });
    assert.equal(plan.status, "succeeded");
    assert.equal(plan.work, "none");
  });
});
