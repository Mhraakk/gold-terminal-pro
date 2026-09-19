-- زرین atelier: multi-tenant concepts + durable jobs.
-- Isolation is enforced in queries via org_id + user membership (authMiddleware).
-- RLS policies are defense-in-depth on Neon; preview PGLite has no session GUCs.

create table if not exists orgs (
  id text primary key,
  name text not null,
  owner_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists org_members (
  org_id text not null references orgs(id) on delete cascade,
  user_id text not null,
  role text not null default 'owner',
  primary key (org_id, user_id)
);
create index if not exists org_members_user_id_idx on org_members (user_id);

create table if not exists concepts (
  id text primary key,
  org_id text not null,
  user_id text not null,
  title text not null,
  fingerprint text not null,
  status text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists concepts_org_id_idx on concepts (org_id);
create index if not exists concepts_fingerprint_idx on concepts (org_id, fingerprint);

create table if not exists jobs (
  id text primary key,
  org_id text not null,
  user_id text not null,
  status text not null,
  stage text not null,
  error text,
  cancel_requested boolean not null default false,
  brief jsonb not null,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jobs_org_user_idx on jobs (org_id, user_id);
