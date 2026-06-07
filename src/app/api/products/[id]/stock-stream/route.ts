import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

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
        await connectDB();
        const product = await Product.findById(id).select('stock').lean();
        if (product) {
          send({ stock: (product as { stock: number }).stock, productId: id });
        } else {
          send({ error: 'Product not found', productId: id });
          controller.close();
          return;
        }
      } catch (err) {
        send({ error: 'DB error', productId: id });
        controller.close();
        return;
      }

      // Poll for stock changes every 15 seconds
      let lastStock: number | null = null;
      const interval = setInterval(async () => {
        try {
          const product = await Product.findById(id).select('stock').lean();
          if (!product) { clearInterval(interval); controller.close(); return; }
          const stock = (product as { stock: number }).stock;
          if (stock !== lastStock) {
            lastStock = stock;
            send({ stock, productId: id, updated: true });
          }
        } catch {
          // silently skip on transient DB errors
        }
      }, 15000);

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          clearInterval(interval);
        }
      }, 30000);

      // Clean up on client disconnect
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
