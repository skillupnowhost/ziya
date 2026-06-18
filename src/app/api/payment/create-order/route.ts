import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getUserFromRequest } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, currency = 'INR', orderId } = await req.json();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `ord_${String(orderId).slice(0, 36)}`,
    });

    return NextResponse.json({ razorpayOrder });
  } catch (error: unknown) {
    console.error('Razorpay create order error:', error);
    const detail =
      error instanceof Error ? error.message : 'Payment initialization failed';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
