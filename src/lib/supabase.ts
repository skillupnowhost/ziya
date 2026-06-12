import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
  );
}

// Server-side client — uses service role key to bypass RLS.
// Only import this in API routes (server code), never in client components.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Row mappers ───────────────────────────────────────────────
// Converts snake_case DB columns → camelCase, and adds _id alias for
// backward-compat with any frontend code that reads ._id.

type AnyRow = Record<string, unknown>;

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function mapRow(row: AnyRow): AnyRow {
  const out: AnyRow = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  if (out.id !== undefined) out._id = out.id;
  return out;
}

export function mapRows(rows: AnyRow[]): AnyRow[] {
  return rows.map(mapRow);
}

// Health check — ping the DB and return latency
export async function checkDbHealth(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  const { error } = await supabase.from('users').select('id').limit(1);
  return { ok: !error, latency: Date.now() - start };
}
