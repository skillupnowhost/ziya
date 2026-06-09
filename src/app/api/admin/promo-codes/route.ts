import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const codes = await PromoCode.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderValue, maxUses, expiresAt } = body;

  if (!code || !discountType || discountValue == null) {
    return NextResponse.json({ error: 'code, discountType and discountValue are required' }, { status: 400 });
  }
  if (discountType === 'percent' && (discountValue <= 0 || discountValue > 100)) {
    return NextResponse.json({ error: 'Percent discount must be between 1 and 100' }, { status: 400 });
  }
  if (discountType === 'flat' && discountValue <= 0) {
    return NextResponse.json({ error: 'Flat discount must be greater than 0' }, { status: 400 });
  }

  try {
    const promo = await PromoCode.create({
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || undefined,
      maxUses: maxUses || undefined,
      expiresAt: expiresAt || undefined,
      isActive: true,
    });
    return NextResponse.json({ promo }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'A promo code with that name already exists' }, { status: 409 });
    }
    throw err;
  }
}
