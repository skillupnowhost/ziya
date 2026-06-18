import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceOrder {
  _id: string;
  items: { name: string; quantity: number; price: number; size?: string; color?: string }[];
  shippingAddress: {
    name?: string;
    phone?: string;
    street?: string;
    doorNumber?: string;
    streetName?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  trackingNumber?: string;
  courierService?: string;
}

export function downloadInvoicePDF(order: InvoiceOrder) {
  const doc = new jsPDF();
  const orderId = order._id.slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const addr = order.shippingAddress;
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Brand header ──────────────────────────────────────────
  doc.setFillColor(244, 63, 94); // rose-500
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('ZIYAKART', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 200, 210);
  doc.text('Fashion & Lifestyle Store', 14, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`#${orderId}  |  ${date}`, pageWidth - 14, 26, { align: 'right' });

  // ── Order info + Bill to ──────────────────────────────────
  let y = 46;

  // Bill To
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text('BILL TO', 14, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 46);
  doc.text(addr.name || 'Customer', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99); // gray-600
  if (addr.phone) { doc.text(addr.phone, 14, y); y += 5; }
  const street = [addr.doorNumber, addr.streetName, addr.street].filter(Boolean).join(', ');
  if (street) { doc.text(street, 14, y); y += 5; }
  const cityLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
  if (cityLine) { doc.text(cityLine, 14, y); y += 5; }

  // Order Info (right side)
  const rightX = pageWidth - 14;
  let ry = 46;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(156, 163, 175);
  doc.text('ORDER INFO', rightX, ry, { align: 'right' });

  ry += 7;
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');

  const orderInfoLines = [
    `Order ID: #${orderId}`,
    `Date: ${date}`,
    `Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : order.paymentMethod}`,
    `Status: ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}`,
  ];

  for (const line of orderInfoLines) {
    doc.text(line, rightX, ry, { align: 'right' });
    ry += 5;
  }

  // ── Items table ───────────────────────────────────────────
  const startY = Math.max(y, ry) + 10;

  const tableBody = order.items.map((item, i) => {
    const detail = [item.size && `Size: ${item.size}`, item.color].filter(Boolean).join(' · ');
    return [
      (i + 1).toString(),
      detail ? `${item.name}\n${detail}` : item.name,
      item.quantity.toString(),
      `₹${item.price.toLocaleString('en-IN')}`,
      `₹${(item.price * item.quantity).toLocaleString('en-IN')}`,
    ];
  });

  autoTable(doc, {
    startY,
    head: [['#', 'Item', 'Qty', 'Price', 'Total']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [254, 242, 242], // rose-50
      textColor: [244, 63, 94],   // rose-500
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4,
      lineColor: [254, 205, 211], // rose-200
      lineWidth: 0.5,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81], // gray-700
      cellPadding: 4,
      lineColor: [243, 244, 246], // gray-100
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Totals ────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ty = (doc as any).lastAutoTable.finalY + 12;
  const totalsX = pageWidth - 80;

  const drawTotalRow = (label: string, value: string, opts?: { bold?: boolean; color?: number[]; big?: boolean; line?: boolean }) => {
    if (opts?.line) {
      doc.setDrawColor(26, 26, 46);
      doc.setLineWidth(0.8);
      doc.line(totalsX, ty - 3, pageWidth - 14, ty - 3);
      ty += 2;
    }

    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(opts?.big ? 13 : 9);
    doc.setTextColor(...(opts?.color || [107, 114, 128]) as [number, number, number]);
    doc.text(label, totalsX, ty);
    doc.text(value, pageWidth - 14, ty, { align: 'right' });
    ty += opts?.big ? 8 : 6;
  };

  drawTotalRow('Subtotal', `₹${(order.subtotal || 0).toLocaleString('en-IN')}`);
  drawTotalRow(
    'Shipping',
    order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`,
    order.shippingCost === 0 ? { color: [5, 150, 105] } : undefined, // emerald-600
  );
  if (order.discount > 0) {
    drawTotalRow('Discount', `-₹${order.discount.toLocaleString('en-IN')}`, { color: [5, 150, 105] });
  }
  drawTotalRow(
    'Total',
    `₹${(order.total || 0).toLocaleString('en-IN')}`,
    { bold: true, color: [26, 26, 46], big: true, line: true },
  );

  // ── Tracking info ─────────────────────────────────────────
  if (order.trackingNumber) {
    ty += 4;
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.roundedRect(14, ty - 4, pageWidth - 28, 16, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`Tracking: ${order.courierService || 'Courier'} — ${order.trackingNumber}`, 20, ty + 5);
    ty += 20;
  }

  // ── Footer ────────────────────────────────────────────────
  const footerY = Math.max(ty + 16, doc.internal.pageSize.getHeight() - 36);

  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text('Thank you for shopping with Ziyakart!', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('If you have any questions, contact us at support@ziyakart.com', pageWidth / 2, footerY + 14, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 22, { align: 'center' });

  // ── Payment status watermark ──────────────────────────────
  if (order.paymentStatus === 'paid') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.text('PAID', pageWidth / 2, 140, { align: 'center', angle: 35 });
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  }

  // ── Save ──────────────────────────────────────────────────
  doc.save(`Ziyakart-Invoice-${orderId}.pdf`);
}
