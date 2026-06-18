import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getUserFromRequest } from '@/lib/auth';

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys are not configured');
  }

  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, currency = 'INR', orderId } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum payment amount is ₹1' }, { status: 400 });
    }

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `ord_${String(orderId).slice(0, 36)}`,
    });

    return NextResponse.json({ razorpayOrder });
  } catch (error: unknown) {
    console.error('Razorpay create order error:', error);

    if (error instanceof Error && error.message === 'Razorpay API keys are not configured') {
      return NextResponse.json({ error: 'Payment gateway is not configured. Please contact support.' }, { status: 503 });
    }

    const detail =
      error instanceof Error ? error.message : 'Payment initialization failed';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
