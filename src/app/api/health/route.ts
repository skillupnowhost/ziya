import { NextResponse } from 'next/server';
import { checkDbHealth } from '@/lib/supabase';

export async function GET() {
  try {
    const { ok, latency } = await checkDbHealth();
    if (!ok) {
      return NextResponse.json({
        status: 'error',
        db: 'disconnected',
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      db: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
