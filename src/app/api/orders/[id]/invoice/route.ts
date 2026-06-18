import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { data: row } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!row) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (payload.role !== 'admin' && String(row.user_id) !== String(payload.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const order = mapRow(row) as Record<string, unknown>;
    const items = order.items as { name: string; quantity: number; price: number; size?: string; color?: string }[];
    const addr = order.shippingAddress as { name?: string; phone?: string; street?: string; doorNumber?: string; streetName?: string; city?: string; state?: string; pincode?: string };
    const orderId = (order._id as string).slice(-8).toUpperCase();
    const date = new Date(order.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice #${orderId} - Ziyakart</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #f43f5e; }
  .logo { font-size: 28px; font-weight: 800; color: #f43f5e; letter-spacing: -0.5px; }
  .logo-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 24px; color: #1a1a2e; font-weight: 700; }
  .invoice-title p { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
  .meta-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700; margin-bottom: 8px; }
  .meta-box p { font-size: 13px; color: #374151; line-height: 1.6; }
  .meta-box .strong { font-weight: 600; color: #1a1a2e; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { background: #fef2f2; padding: 10px 16px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #f43f5e; font-weight: 700; border-bottom: 2px solid #fecdd3; }
  thead th:last-child, tbody td:last-child { text-align: right; }
  tbody td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  tbody tr:hover { background: #fefce8; }
  .item-name { font-weight: 600; color: #1a1a2e; }
  .item-detail { font-size: 11px; color: #9ca3af; }
  .totals { margin-left: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #6b7280; }
  .totals .row.discount { color: #059669; }
  .totals .row.total { border-top: 2px solid #1a1a2e; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; color: #1a1a2e; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; }
  .footer p { font-size: 11px; color: #9ca3af; line-height: 1.8; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-paid { background: #d1fae5; color: #065f46; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  @media print {
    body { padding: 20px; }
    @page { margin: 0.5in; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Ziyakart</div>
      <div class="logo-sub">Fashion & Lifestyle Store</div>
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p>#${orderId} &middot; ${date}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-box">
      <h3>Bill To</h3>
      <p class="strong">${addr.name || 'Customer'}</p>
      <p>${addr.phone || ''}</p>
      <p>${[addr.doorNumber, addr.streetName, addr.street].filter(Boolean).join(', ')}</p>
      <p>${[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
    </div>
    <div class="meta-box" style="text-align: right;">
      <h3>Order Info</h3>
      <p>Order ID: <span class="strong">#${orderId}</span></p>
      <p>Date: ${date}</p>
      <p>Payment: ${(order.paymentMethod as string) === 'cod' ? 'Cash on Delivery' : (order.paymentMethod as string) === 'razorpay' ? 'Online (Razorpay)' : String(order.paymentMethod)}</p>
      <p>Status: <span class="badge ${(order.paymentStatus as string) === 'paid' ? 'badge-paid' : 'badge-pending'}">${order.paymentStatus}</span></p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div class="item-name">${item.name}</div>
          ${item.size || item.color ? `<div class="item-detail">${[item.size && `Size: ${item.size}`, item.color].filter(Boolean).join(' &middot; ')}</div>` : ''}
        </td>
        <td>${item.quantity}</td>
        <td>&#8377;${item.price.toLocaleString('en-IN')}</td>
        <td>&#8377;${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>&#8377;${((order.subtotal as number) || 0).toLocaleString('en-IN')}</span></div>
    <div class="row"><span>Shipping</span><span>${(order.shippingCost as number) === 0 ? 'FREE' : `&#8377;${order.shippingCost}`}</span></div>
    ${(order.discount as number) > 0 ? `<div class="row discount"><span>Discount</span><span>-&#8377;${(order.discount as number).toLocaleString('en-IN')}</span></div>` : ''}
    <div class="row total"><span>Total</span><span>&#8377;${((order.total as number) || 0).toLocaleString('en-IN')}</span></div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with Ziyakart!</p>
    <p>If you have any questions, contact us at support@ziyakart.com</p>
    <p style="margin-top: 8px; font-size: 10px; color: #d1d5db;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
