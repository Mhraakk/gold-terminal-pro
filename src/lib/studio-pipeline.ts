import { isTerminal, type JobStage, type JobStatus } from "./studio-jobs.ts";

export type PipelineJob = {
  status: JobStatus;
  stage: JobStage;
  cancelRequested: boolean;
  resultCount: number;
};

export type PipelineWork = "none" | "archive" | "generate" | "persist";

export type PipelinePlan = {
  status: JobStatus;
  stage: JobStage;
  error: string | null;
  work: PipelineWork;
};

/** One real stage. Never invent progress. Terminal states do not advance. */
export function planAdvance(job: PipelineJob): PipelinePlan {
  if (job.cancelRequested && !isTerminal(job.status)) {
    return { status: "cancelled", stage: "done", error: "لغو شد.", work: "none" };
  }
  if (isTerminal(job.status)) {
    return { status: job.status, stage: "done", error: null, work: "none" };
  }

  const stage: JobStage = job.stage === "queued" ? "guard" : job.stage;

  switch (stage) {
    case "guard":
      return { status: "running", stage: "archive", error: null, work: "none" };
    case "archive":
      return { status: "running", stage: "generate", error: null, work: "archive" };
    case "generate":
      return { status: "running", stage: "similarity", error: null, work: "generate" };
    case "similarity":
      return { status: "running", stage: "persist", error: null, work: "none" };
    case "persist":
      return { status: "running", stage: "done", error: null, work: "persist" };
    case "done":
      if (job.resultCount >= 3) {
        return { status: "succeeded", stage: "done", error: null, work: "none" };
      }
      if (job.resultCount > 0) {
        return { status: "partial", stage: "done", error: "کمتر از سه مسیر ذخیره شد.", work: "none" };
      }
      return { status: "failed", stage: "done", error: "هیچ مسیری ذخیره نشد.", work: "none" };
  }
}

export function persistOutcome(count: number): Pick<PipelinePlan, "status" | "stage" | "error"> {
  if (count <= 0) return { status: "failed", stage: "done", error: "هیچ مسیری ذخیره نشد." };
  if (count < 3) return { status: "partial", stage: "done", error: "کمتر از سه مسیر ذخیره شد." };
  return { status: "succeeded", stage: "done", error: null };
}

/** Client safety: a well-formed job finishes in ≤ these ticks. */
export const MAX_JOB_TICKS = 12;
