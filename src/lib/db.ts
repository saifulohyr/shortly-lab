import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export interface LinkRecord {
  id: string;
  code: string;
  original_url: string;
  title: string | null;
  clicks: number;
  created_at: string;
  last_clicked_at: string | null;
}

export interface ClickEvent {
  id: string;
  link_id: string;
  referrer: string | null;
  user_agent: string | null;
  clicked_at: string;
}

// In-memory fallback for local dev / unconfigured DB
const memoryStore = new Map<string, LinkRecord>();
const memoryClicks: ClickEvent[] = [];

function getSql(): NeonQueryFunction<false, false> | null {
  const connString = process.env.DATABASE_URL;
  if (!connString || connString.includes("ep-example")) {
    return null;
  }
  return neon(connString);
}

let schemaInitialized = false;

export async function initDb(): Promise<void> {
  const sql = getSql();
  if (!sql || schemaInitialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      title TEXT,
      clicks INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_clicked_at TIMESTAMP WITH TIME ZONE
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_links_code ON links (code);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS link_clicks (
      id TEXT PRIMARY KEY,
      link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
      referrer TEXT,
      user_agent TEXT,
      clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  schemaInitialized = true;
}

export async function createLink(
  code: string,
  originalUrl: string,
  title?: string
): Promise<LinkRecord> {
  const sql = getSql();
  const id = `lnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  if (!sql) {
    const record: LinkRecord = {
      id,
      code,
      original_url: originalUrl,
      title: title || null,
      clicks: 0,
      created_at: nowIso,
      last_clicked_at: null,
    };
    memoryStore.set(code, record);
    return record;
  }

  await initDb();
  const rows = (await sql`
    INSERT INTO links (id, code, original_url, title, clicks, created_at)
    VALUES (${id}, ${code}, ${originalUrl}, ${title || null}, 0, NOW())
    RETURNING id, code, original_url, title, clicks, created_at::text, last_clicked_at::text
  `) as unknown as LinkRecord[];

  return rows[0];
}

export async function getLinkByCode(code: string): Promise<LinkRecord | null> {
  const sql = getSql();
  if (!sql) {
    return memoryStore.get(code) || null;
  }

  await initDb();
  const rows = (await sql`
    SELECT id, code, original_url, title, clicks, created_at::text, last_clicked_at::text
    FROM links
    WHERE code = ${code}
    LIMIT 1
  `) as unknown as LinkRecord[];

  return rows[0] || null;
}

export async function recordClick(
  code: string,
  referrer?: string | null,
  userAgent?: string | null
): Promise<string | null> {
  const sql = getSql();
  const nowIso = new Date().toISOString();

  if (!sql) {
    const record = memoryStore.get(code);
    if (!record) return null;
    record.clicks += 1;
    record.last_clicked_at = nowIso;
    memoryClicks.push({
      id: `clk_${Date.now()}`,
      link_id: record.id,
      referrer: referrer || null,
      user_agent: userAgent || null,
      clicked_at: nowIso,
    });
    return record.original_url;
  }

  await initDb();
  const updated = (await sql`
    UPDATE links
    SET clicks = clicks + 1, last_clicked_at = NOW()
    WHERE code = ${code}
    RETURNING id, original_url
  `) as unknown as { id: string; original_url: string }[];

  if (!updated || updated.length === 0) return null;

  const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await sql`
    INSERT INTO link_clicks (id, link_id, referrer, user_agent, clicked_at)
    VALUES (${clickId}, ${updated[0].id}, ${referrer || null}, ${userAgent || null}, NOW())
  `;

  return updated[0].original_url;
}

export async function getRecentLinks(limit: number = 20): Promise<LinkRecord[]> {
  const sql = getSql();
  if (!sql) {
    return Array.from(memoryStore.values())
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, limit);
  }

  await initDb();
  const rows = (await sql`
    SELECT id, code, original_url, title, clicks, created_at::text, last_clicked_at::text
    FROM links
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as unknown as LinkRecord[];

  return rows;
}
