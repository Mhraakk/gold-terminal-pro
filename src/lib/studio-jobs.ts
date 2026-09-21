/** Pure job state machine — no fake progress. Each stage is a real unit of work. */

export const JOB_STAGES = [
  "queued",
  "guard",
  "archive",
  "generate",
  "similarity",
  "persist",
  "done",
] as const;

export type JobStage = (typeof JOB_STAGES)[number];

export const JOB_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "partial",
  "failed",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type JobSnapshot = {
  id: string;
  status: JobStatus;
  stage: JobStage;
  error: string | null;
  cancelRequested: boolean;
  resultCount: number;
};

export function nextStage(stage: JobStage): JobStage {
  const i = JOB_STAGES.indexOf(stage);
  return JOB_STAGES[Math.min(i + 1, JOB_STAGES.length - 1)] ?? "done";
}

export function isTerminal(status: JobStatus): boolean {
  return status === "succeeded" || status === "partial" || status === "failed" || status === "cancelled";
}

/** Safe retry clones the brief into a new job. Succeeded jobs are not retried (that would duplicate). */
export function canRetry(status: JobStatus): boolean {
  return status === "failed" || status === "partial" || status === "cancelled";
}

export function applyCancel(job: JobSnapshot): JobSnapshot {
  if (isTerminal(job.status)) return job;
  return { ...job, status: "cancelled", stage: "done", error: "لغو شد." };
}

export function stageLabel(stage: JobStage): string {
  switch (stage) {
    case "queued":
      return "در صف";
    case "guard":
      return "گارد ورودی";
    case "archive":
      return "خواندن آرشیو و دی‌ان‌ای";
    case "generate":
      return "تولید مسیرها";
    case "similarity":
      return "چک شباهت";
    case "persist":
      return "ذخیرهٔ جزئی/کامل";
    case "done":
      return "تمام";
  }
}
