import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { allowAiCall, logGateway, newRequestId } from "@/gateway";
import { conceptBriefInput } from "@/gateway/validate";
import { authMiddleware } from "@/lib/auth/middleware";
import { runStudioGraph } from "@/orchestrator/studio";
import type { BrandDna, Collection, Concept } from "@/data/studio/types";
import {
  archiveFingerprints,
  createJobRow,
  ensureOrg,
  insertConcepts,
  listOrgConcepts,
  listOrgJobs,
  loadJob,
  loadOrgCollections,
  loadOrgDna,
  patchJob,
  saveOrgCollections,
  saveOrgDna,
  toSnapshot,
  updateConceptPayload,
} from "@/lib/studio-db";
import { isTerminal } from "@/lib/studio-jobs";
import { persistOutcome, planAdvance } from "@/lib/studio-pipeline";

export const listStudioFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const orgId = await ensureOrg(context.userId);
    const concepts = await listOrgConcepts(orgId, context.userId);
    const dna = await loadOrgDna(orgId, context.userId);
    const collections = await loadOrgCollections(orgId, context.userId);
    const jobs = await listOrgJobs(orgId, context.userId);
    return { orgId, concepts, dna, collections, jobs };
  });

export const saveStudioConceptFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ concept: z.any() }).parse(input))
  .handler(async ({ context, data }) => {
    const orgId = await ensureOrg(context.userId);
    const concept = data.concept as Concept;
    await updateConceptPayload(orgId, context.userId, concept);
    return { ok: true as const };
  });

export const saveStudioDnaFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ dna: z.any() }).parse(input))
  .handler(async ({ context, data }) => {
    const orgId = await ensureOrg(context.userId);
    await saveOrgDna(orgId, context.userId, data.dna as BrandDna);
    return { ok: true as const };
  });

export const saveStudioCollectionsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ collections: z.any() }).parse(input))
  .handler(async ({ context, data }) => {
    const orgId = await ensureOrg(context.userId);
    await saveOrgCollections(orgId, context.userId, data.collections as Collection[]);
    return { ok: true as const };
  });

export const enqueueStudioJobFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => conceptBriefInput.parse(input))
  .handler(async ({ context, data }) => {
    const orgId = await ensureOrg(context.userId);
    const limit = allowAiCall();
    if (!limit.allowed) return { ok: false as const, error: "سقف تولید کانسپت در این دقیقه پر شد." };
    const id = await createJobRow(orgId, context.userId, {
      productType: data.productType,
      level: data.level,
      weightGrams: data.weightGrams,
      karat: data.karat,
      occasion: data.occasion,
      notes: data.notes ?? "",
    }, { dna: data.dna });
    return { ok: true as const, jobId: id };
  });

export const getStudioJobFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ jobId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const row = await loadJob(data.jobId, context.userId);
    if (!row) return { ok: false as const, error: "جاب پیدا نشد." };
    return { ok: true as const, job: toSnapshot(row), concepts: row.result?.concepts ?? [] };
  });

export const cancelStudioJobFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ jobId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const row = await patchJob(data.jobId, context.userId, { cancel_requested: true });
    if (!row) return { ok: false as const, error: "جاب پیدا نشد." };
    if (!isTerminal(row.status)) {
      await patchJob(data.jobId, context.userId, { status: "cancelled", stage: "done", error: "لغو شد." });
    }
    const next = await loadJob(data.jobId, context.userId);
    return { ok: true as const, job: next ? toSnapshot(next) : null };
  });

export const tickStudioJobFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ jobId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const started = Date.now();
    const requestId = newRequestId();
    const row = await loadJob(data.jobId, context.userId);
    if (!row) return { ok: false as const, error: "جاب پیدا نشد." };
    if (row.cancel_requested && !isTerminal(row.status)) {
      await patchJob(data.jobId, context.userId, { status: "cancelled", stage: "done", error: "لغو شد." });
      const cancelled = await loadJob(data.jobId, context.userId);
      return { ok: true as const, job: cancelled ? toSnapshot(cancelled) : toSnapshot(row), concepts: [] };
    }
    if (isTerminal(row.status)) {
      return { ok: true as const, job: toSnapshot(row), concepts: row.result?.concepts ?? [] };
    }

    const plan = planAdvance({
      status: row.status,
      stage: row.stage,
      cancelRequested: row.cancel_requested,
      resultCount: row.result?.concepts?.length ?? 0,
    });

    try {
      if (plan.work === "none" && isTerminal(plan.status)) {
        await patchJob(data.jobId, context.userId, { status: plan.status, stage: plan.stage, error: plan.error });
        const done = await loadJob(data.jobId, context.userId);
        return { ok: true as const, job: done ? toSnapshot(done) : toSnapshot(row), concepts: done?.result?.concepts ?? [] };
      }

      await patchJob(data.jobId, context.userId, { status: "running" });

      if (plan.work === "archive") {
        await archiveFingerprints(row.org_id, context.userId);
        await patchJob(data.jobId, context.userId, { stage: "generate" });
      } else if (plan.work === "generate") {
        const brief = row.brief.brief;
        const archive = await archiveFingerprints(row.org_id, context.userId);
        const result = await runStudioGraph({
          brief,
          dna: row.brief.extra?.dna as { name: string; promise: string; materials: string; silhouette: string; forbidden: string } | undefined,
          archive,
        });
        if (!result.ok) {
          await patchJob(data.jobId, context.userId, { status: "failed", stage: "done", error: result.error });
          logGateway({ requestId, route: "studio.job", ok: false, latencyMs: Date.now() - started });
          const failed = await loadJob(data.jobId, context.userId);
          return { ok: true as const, job: failed ? toSnapshot(failed) : toSnapshot(row), concepts: [] };
        }
        await patchJob(data.jobId, context.userId, {
          stage: "similarity",
          result: { concepts: result.concepts, model: result.model, tokens: result.tokens },
        });
      } else if (plan.work === "persist") {
        const concepts = row.result?.concepts ?? [];
        const out = persistOutcome(concepts.length);
        if (concepts.length > 0) {
          await insertConcepts(row.org_id, context.userId, concepts);
        }
        await patchJob(data.jobId, context.userId, {
          status: out.status,
          stage: out.stage,
          error: out.error,
        });
        logGateway({ requestId, route: "studio.job", ok: out.status !== "failed", latencyMs: Date.now() - started });
      } else {
        await patchJob(data.jobId, context.userId, { status: plan.status, stage: plan.stage, error: plan.error });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطای جاب";
      await patchJob(data.jobId, context.userId, { status: "failed", stage: "done", error: message });
    }

    const next = await loadJob(data.jobId, context.userId);
    return { ok: true as const, job: next ? toSnapshot(next) : toSnapshot(row), concepts: next?.result?.concepts ?? [] };
  });
