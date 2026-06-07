import { NextResponse } from 'next/server';
import { connectDB, getConnectionState } from '@/lib/mongodb';

export async function GET() {
  const start = Date.now();
  try {
    await connectDB();
    const latency = Date.now() - start;
    return NextResponse.json({
      status: 'ok',
      db: getConnectionState(),
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
