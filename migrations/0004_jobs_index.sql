-- Query isolation is the real tenant wall (org_id + membership in every handler).
-- RLS is not forced: the app role owns the tables, and Neon pooled connections
-- keep no session GUCs, so FORCE ROW LEVEL SECURITY would empty every query.
-- Extra indexes so job polling and archive fingerprint checks stay cheap.

create index if not exists jobs_org_status_idx on jobs (org_id, status, updated_at);
create index if not exists concepts_org_status_idx on concepts (org_id, status);
