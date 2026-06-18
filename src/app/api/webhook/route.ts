import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event as string;

    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ status: 'ok' });
      }

      const razorpayOrderId = payment.order_id as string;
      const paymentId = payment.id as string;

      const { data: order } = await supabase
        .from('orders')
        .select('id, payment_status, items')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();

      if (!order || order.payment_status === 'paid') {
        return NextResponse.json({ status: 'ok' });
      }

      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_id: paymentId,
          status: 'confirmed',
        })
        .eq('id', order.id);

      const items = order.items as { productId: string; quantity: number }[];
      for (const item of items) {
        await supabase.rpc('decrement_product_stock', {
          p_id: item.productId,
          amount: item.quantity,
        });
      }
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('razorpay_order_id', payment.order_id as string)
          .eq('payment_status', 'pending');
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
