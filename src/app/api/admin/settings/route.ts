import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

const DEFAULTS: Record<string, unknown> = {
  cod_enabled: true,
};

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: rows, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      // Table may not exist yet — return defaults
      return NextResponse.json({ settings: DEFAULTS });
    }

    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows ?? []) {
      settings[row.key as string] = row.value;
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: DEFAULTS });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json({ error: 'Failed to update setting. Ensure site_settings table exists.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
