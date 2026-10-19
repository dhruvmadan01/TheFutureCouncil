'use strict';
// Two interchangeable stores with the same small interface:
//   makeRestDb    talks to Supabase (PostgREST) with the service role key
//   makeMemoryDb  keeps rows in memory, used by the tests
//
//   select(table, { eq, in, order: [column, 'asc'|'desc'], limit })  -> rows
//   insert(table, rowOrRows)                                       -> inserted rows
//   update(table, { eq, in }, patch)                               -> updated rows
//   upsert(table, rows, conflictColumns)                           -> rows
//   remove(table, { eq, in })                                      -> void

function qs(filter) {
  const parts = [];
  Object.entries((filter && filter.eq) || {}).forEach(([k, v]) => parts.push(`${encodeURIComponent(k)}=eq.${encodeURIComponent(v)}`));
  Object.entries((filter && filter.in) || {}).forEach(([k, v]) => parts.push(`${encodeURIComponent(k)}=in.(${v.map((x) => encodeURIComponent(x)).join(',')})`));
  return parts;
}

function makeRestDb({ url, key, fetchImpl }) {
  const f = fetchImpl || fetch;
  const base = url.replace(/\/$/, '') + '/rest/v1/';
  const headers = (extra) => Object.assign({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, extra || {});

  async function call(method, path, body, extraHeaders) {
    const res = await f(base + path, { method, headers: headers(extraHeaders), body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await res.text();
    if (!res.ok) {
      const err = new Error(`Database error ${res.status}: ${text.slice(0, 300)}`);
      err.status = 500;
      throw err;
    }
    return text ? JSON.parse(text) : [];
  }

  return {
    async select(table, opts) {
      const o = opts || {};
      const parts = qs(o);
      if (o.order) parts.push(`order=${o.order[0]}.${o.order[1] || 'asc'}`);
      parts.push(`limit=${o.limit || 10000}`);
      return call('GET', `${table}?select=*&${parts.join('&')}`);
    },
    async insert(table, rows) {
      return call('POST', table, rows, { Prefer: 'return=representation' });
    },
    async update(table, filter, patch) {
      return call('PATCH', `${table}?${qs(filter).join('&')}`, patch, { Prefer: 'return=representation' });
    },
    async upsert(table, rows, conflict) {
      return call('POST', `${table}?on_conflict=${conflict.join(',')}`, rows, { Prefer: 'resolution=merge-duplicates,return=representation' });
    },
    async remove(table, filter) {
      await call('DELETE', `${table}?${qs(filter).join('&')}`);
    }
  };
}

function makeMemoryDb(seed) {
  const tables = {};
  const counters = {};
  const clock = { t: 0 };
  Object.entries(seed || {}).forEach(([t, rows]) => {
    tables[t] = rows.map((r) => Object.assign({}, r));
    counters[t] = rows.reduce((m, r) => Math.max(m, r.id || 0), 0);
  });
  const rowsOf = (t) => (tables[t] = tables[t] || []);
  const matches = (row, filter) => {
    const eq = (filter && filter.eq) || {};
    const inn = (filter && filter.in) || {};
    return Object.keys(eq).every((k) => String(row[k]) === String(eq[k])) &&
      Object.keys(inn).every((k) => inn[k].map(String).includes(String(row[k])));
  };
  const stamp = () => { clock.t += 1; return new Date(Date.UTC(2026, 0, 1, 0, 0, clock.t)).toISOString(); };
  const clone = (r) => JSON.parse(JSON.stringify(r));

  return {
    _tables: tables,
    async select(table, opts) {
      const o = opts || {};
      let out = rowsOf(table).filter((r) => matches(r, o)).map(clone);
      if (o.order) {
        const [col, dir] = o.order;
        out.sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === 'desc' ? -1 : 1));
      }
      return out.slice(0, o.limit || 10000);
    },
    async insert(table, rows) {
      const list = Array.isArray(rows) ? rows : [rows];
      return list.map((r) => {
        counters[table] = (counters[table] || 0) + 1;
        const row = Object.assign({ id: counters[table], created_at: stamp() }, clone(r));
        rowsOf(table).push(row);
        return clone(row);
      });
    },
    async update(table, filter, patch) {
      const hit = rowsOf(table).filter((r) => matches(r, filter));
      hit.forEach((r) => Object.assign(r, clone(patch)));
      return hit.map(clone);
    },
    async upsert(table, rows, conflict) {
      const out = [];
      for (const r of rows) {
        const existing = rowsOf(table).find((x) => conflict.every((c) => String(x[c]) === String(r[c])));
        if (existing) { Object.assign(existing, clone(r)); out.push(clone(existing)); }
        else out.push((await this.insert(table, r))[0]);
      }
      return out;
    },
    async remove(table, filter) {
      tables[table] = rowsOf(table).filter((r) => !matches(r, filter));
    }
  };
}

module.exports = { makeRestDb, makeMemoryDb };
