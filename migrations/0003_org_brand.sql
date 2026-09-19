create table if not exists org_dna (
  org_id text primary key references orgs(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists org_collections (
  id text primary key,
  org_id text not null references orgs(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists org_collections_org_idx on org_collections (org_id);
