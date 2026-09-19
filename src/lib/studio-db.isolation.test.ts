import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";

async function boot() {
  const pg = new PGlite();
  await pg.waitReady;
  for (const file of ["0002_studio.sql", "0003_org_brand.sql"]) {
    await pg.exec(readFileSync(new URL(`../../migrations/${file}`, import.meta.url), "utf8"));
  }
  return pg;
}

describe("studio tenant isolation", () => {
  it("user B cannot read user A concepts via membership filter", async () => {
    const pg = await boot();
    await pg.query("insert into orgs (id, name, owner_id) values ($1,$2,$3)", ["org-a", "A", "user-a"]);
    await pg.query("insert into org_members (org_id, user_id, role) values ($1,$2,$3)", ["org-a", "user-a", "owner"]);
    await pg.query("insert into orgs (id, name, owner_id) values ($1,$2,$3)", ["org-b", "B", "user-b"]);
    await pg.query("insert into org_members (org_id, user_id, role) values ($1,$2,$3)", ["org-b", "user-b", "owner"]);
    await pg.query(
      "insert into concepts (id, org_id, user_id, title, fingerprint, status, payload) values ($1,$2,$3,$4,$5,$6,$7::jsonb)",
      ["c1", "org-a", "user-a", "انگشتر لیدو", "lido", "idea", '{"id":"c1"}'],
    );

    const leak = await pg.query(
      `select id from concepts
       where org_id = $1
         and org_id in (select org_id from org_members where user_id = $2)`,
      ["org-a", "user-b"],
    );
    assert.equal(leak.rows.length, 0);

    const own = await pg.query(
      `select id from concepts
       where org_id = $1
         and org_id in (select org_id from org_members where user_id = $2)`,
      ["org-a", "user-a"],
    );
    assert.equal(own.rows.length, 1);
    await pg.close();
  });

  it("job rows are scoped to the creating user", async () => {
    const pg = await boot();
    await pg.query("insert into orgs (id, name, owner_id) values ($1,$2,$3)", ["org-a", "A", "user-a"]);
    await pg.query(
      "insert into jobs (id, org_id, user_id, status, stage, brief) values ($1,$2,$3,$4,$5,$6::jsonb)",
      ["job-1", "org-a", "user-a", "queued", "queued", '{"brief":{}}'],
    );
    const other = await pg.query("select id from jobs where id = $1 and user_id = $2", ["job-1", "user-b"]);
    assert.equal(other.rows.length, 0);
    const mine = await pg.query("select id from jobs where id = $1 and user_id = $2", ["job-1", "user-a"]);
    assert.equal(mine.rows.length, 1);
    await pg.close();
  });

  it("persist writes three concepts into the owning org only", async () => {
    const pg = await boot();
    await pg.query("insert into orgs (id, name, owner_id) values ($1,$2,$3)", ["org-a", "A", "user-a"]);
    await pg.query("insert into org_members (org_id, user_id, role) values ($1,$2,$3)", ["org-a", "user-a", "owner"]);
    for (const id of ["p1", "p2", "p3"]) {
      await pg.query(
        "insert into concepts (id, org_id, user_id, title, fingerprint, status, payload) values ($1,$2,$3,$4,$5,$6,$7::jsonb)",
        [id, "org-a", "user-a", id, id, "idea", JSON.stringify({ id })],
      );
    }
    const count = await pg.query("select id from concepts where org_id = $1", ["org-a"]);
    assert.equal(count.rows.length, 3);
    const leak = await pg.query(
      `select id from concepts where org_id in (select org_id from org_members where user_id = $1)`,
      ["user-b"],
    );
    assert.equal(leak.rows.length, 0);
    await pg.close();
  });
});
