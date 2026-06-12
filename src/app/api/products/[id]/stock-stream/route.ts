import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial stock
      try {
        const { data: row } = await supabase
          .from('products')
          .select('stock')
          .eq('id', id)
          .maybeSingle();

        if (row) {
          send({ stock: row.stock, productId: id });
        } else {
          send({ error: 'Product not found', productId: id });
          controller.close();
          return;
        }
      } catch {
        send({ error: 'DB error', productId: id });
        controller.close();
        return;
      }

      let lastStock: number | null = null;

      const interval = setInterval(async () => {
        try {
          const { data: row } = await supabase
            .from('products')
            .select('stock')
            .eq('id', id)
            .maybeSingle();

          if (!row) { clearInterval(interval); controller.close(); return; }
          const stock = row.stock as number;
          if (stock !== lastStock) {
            lastStock = stock;
            send({ stock, productId: id, updated: true });
          }
        } catch {
          // silently skip transient errors
        }
      }, 15000);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          clearInterval(interval);
        }
      }, 30000);

      return () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
