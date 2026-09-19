import { getSql } from "@/lib/db";
import { SEED_COLLECTIONS, SEED_CONCEPTS, SEED_DNA } from "@/data/studio/seed";
import type { BrandDna, Collection, Concept, ConceptBrief } from "@/data/studio/types";
import { fingerprint } from "@/data/studio/similarity";
import { isTerminal, nextStage, type JobSnapshot, type JobStage, type JobStatus } from "@/lib/studio-jobs";

export async function ensureOrg(userId: string): Promise<string> {
  const sql = await getSql();
  const existing = await sql<{ org_id: string }>`
    select org_id from org_members where user_id = ${userId} limit 1
  `;
  if (existing[0]) return existing[0].org_id;
  const orgId = `org-${userId}`;
  await sql`insert into orgs (id, name, owner_id) values (${orgId}, ${"آتلیه زرین"}, ${userId})`;
  await sql`insert into org_members (org_id, user_id, role) values (${orgId}, ${userId}, ${"owner"})`;
  for (const c of SEED_CONCEPTS) {
    await sql`
      insert into concepts (id, org_id, user_id, title, fingerprint, status, payload)
      values (${`${c.id}-${userId.slice(0, 8)}`}, ${orgId}, ${userId}, ${c.title}, ${c.fingerprint}, ${c.status}, ${JSON.stringify({ ...c, id: `${c.id}-${userId.slice(0, 8)}` })}::jsonb)
    `;
  }
  await sql`
    insert into org_dna (org_id, payload) values (${orgId}, ${JSON.stringify(SEED_DNA)}::jsonb)
    on conflict (org_id) do nothing
  `;
  for (const col of SEED_COLLECTIONS) {
    await sql`
      insert into org_collections (id, org_id, payload)
      values (${`${col.id}-${userId.slice(0, 8)}`}, ${orgId}, ${JSON.stringify({ ...col, id: `${col.id}-${userId.slice(0, 8)}` })}::jsonb)
      on conflict (id) do nothing
    `;
  }
  return orgId;
}

export async function listOrgConcepts(orgId: string, userId: string): Promise<Concept[]> {
  const sql = await getSql();
  const member = await sql<{ user_id: string }>`
    select user_id from org_members where org_id = ${orgId} and user_id = ${userId} limit 1
  `;
  if (!member[0]) return [];
  const rows = await sql<{ payload: Concept }>`
    select payload from concepts where org_id = ${orgId} order by created_at desc
  `;
  return rows.map((r) => r.payload);
}

export async function insertConcepts(orgId: string, userId: string, concepts: Concept[]) {
  const sql = await getSql();
  for (const c of concepts) {
    await sql`
      insert into concepts (id, org_id, user_id, title, fingerprint, status, payload)
      values (${c.id}, ${orgId}, ${userId}, ${c.title}, ${c.fingerprint}, ${c.status}, ${JSON.stringify(c)}::jsonb)
      on conflict (id) do update set
        title = excluded.title,
        fingerprint = excluded.fingerprint,
        status = excluded.status,
        payload = excluded.payload
    `;
  }
}

export async function updateConceptPayload(orgId: string, userId: string, concept: Concept) {
  const sql = await getSql();
  await sql`
    update concepts
    set title = ${concept.title},
        fingerprint = ${concept.fingerprint},
        status = ${concept.status},
        payload = ${JSON.stringify(concept)}::jsonb
    where id = ${concept.id} and org_id = ${orgId}
      and org_id in (select org_id from org_members where user_id = ${userId})
  `;
}

export async function archiveFingerprints(orgId: string, userId: string): Promise<string[]> {
  const sql = await getSql();
  const rows = await sql<{ fingerprint: string }>`
    select fingerprint from concepts
    where org_id = ${orgId}
      and org_id in (select org_id from org_members where user_id = ${userId})
  `;
  return rows.map((r) => r.fingerprint);
}

export async function createJobRow(orgId: string, userId: string, brief: ConceptBrief, extra: unknown) {
  const sql = await getSql();
  const id = `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  await sql`
    insert into jobs (id, org_id, user_id, status, stage, brief)
    values (${id}, ${orgId}, ${userId}, ${"queued"}, ${"queued"}, ${JSON.stringify({ brief, extra })}::jsonb)
  `;
  return id;
}

type JobRow = {
  id: string;
  org_id: string;
  user_id: string;
  status: JobStatus;
  stage: JobStage;
  error: string | null;
  cancel_requested: boolean;
  brief: { brief: ConceptBrief; extra?: { dna?: unknown } };
  result: { concepts?: Concept[] } | null;
};

export async function loadJob(id: string, userId: string): Promise<JobRow | null> {
  const sql = await getSql();
  const rows = await sql<JobRow>`
    select id, org_id, user_id, status, stage, error, cancel_requested, brief, result
    from jobs
    where id = ${id} and user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function patchJob(
  id: string,
  userId: string,
  patch: Partial<{ status: JobStatus; stage: JobStage; error: string | null; cancel_requested: boolean; result: unknown }>,
) {
  const sql = await getSql();
  const current = await loadJob(id, userId);
  if (!current) return null;
  const status = patch.status ?? current.status;
  const stage = patch.stage ?? current.stage;
  const error = patch.error === undefined ? current.error : patch.error;
  const cancel = patch.cancel_requested ?? current.cancel_requested;
  const result = patch.result === undefined ? current.result : patch.result;
  await sql`
    update jobs
    set status = ${status},
        stage = ${stage},
        error = ${error},
        cancel_requested = ${cancel},
        result = ${result ? JSON.stringify(result) : null}::jsonb,
        updated_at = now()
    where id = ${id} and user_id = ${userId}
  `;
  return loadJob(id, userId);
}

export async function loadOrgDna(orgId: string, userId: string): Promise<BrandDna> {
  const sql = await getSql();
  const member = await sql<{ user_id: string }>`
    select user_id from org_members where org_id = ${orgId} and user_id = ${userId} limit 1
  `;
  if (!member[0]) return SEED_DNA;
  const rows = await sql<{ payload: BrandDna }>`select payload from org_dna where org_id = ${orgId} limit 1`;
  return rows[0]?.payload ?? SEED_DNA;
}

export async function saveOrgDna(orgId: string, userId: string, dna: BrandDna) {
  const sql = await getSql();
  const member = await sql<{ user_id: string }>`
    select user_id from org_members where org_id = ${orgId} and user_id = ${userId} limit 1
  `;
  if (!member[0]) return;
  await sql`
    insert into org_dna (org_id, payload, updated_at)
    values (${orgId}, ${JSON.stringify(dna)}::jsonb, now())
    on conflict (org_id) do update set payload = excluded.payload, updated_at = now()
  `;
}

export async function loadOrgCollections(orgId: string, userId: string): Promise<Collection[]> {
  const sql = await getSql();
  const member = await sql<{ user_id: string }>`
    select user_id from org_members where org_id = ${orgId} and user_id = ${userId} limit 1
  `;
  if (!member[0]) return [];
  const rows = await sql<{ payload: Collection }>`
    select payload from org_collections where org_id = ${orgId} order by created_at desc
  `;
  return rows.map((r) => r.payload);
}

export async function saveOrgCollections(orgId: string, userId: string, collections: Collection[]) {
  const sql = await getSql();
  const member = await sql<{ user_id: string }>`
    select user_id from org_members where org_id = ${orgId} and user_id = ${userId} limit 1
  `;
  if (!member[0]) return;
  await sql`delete from org_collections where org_id = ${orgId}`;
  for (const col of collections) {
    await sql`
      insert into org_collections (id, org_id, payload)
      values (${col.id}, ${orgId}, ${JSON.stringify(col)}::jsonb)
    `;
  }
}

export function toSnapshot(row: JobRow): JobSnapshot {
  return {
    id: row.id,
    status: row.status,
    stage: row.stage,
    error: row.error,
    cancelRequested: row.cancel_requested,
    resultCount: row.result?.concepts?.length ?? 0,
  };
}

export { isTerminal, nextStage, fingerprint };
