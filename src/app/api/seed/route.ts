import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';

const sampleProducts = [
  { name: 'Korean Floral Midi Dress', description: 'Elegant floral print midi dress inspired by Korean fashion. Features a flattering A-line silhouette with puff sleeves and a delicate floral pattern. Perfect for both casual and semi-formal occasions.', category: 'dresses', price: 2499, discountPrice: 1799, stock: 25, sizes: ['XS','S','M','L','XL'], colors: ['Pink', 'White', 'Lavender'], images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'], tags: ['floral', 'midi', 'korean', 'elegant'], isTrending: true, isNewProduct: true, isFeatured: true, rating: 4.8, reviewCount: 124 },
  { name: 'Pastel Puff Sleeve Top', description: 'Adorable pastel top with signature Korean puff sleeves. Made from premium cotton blend for all-day comfort.', category: 'dresses', price: 1399, discountPrice: 1099, stock: 30, sizes: ['XS','S','M','L'], colors: ['Peach', 'Mint', 'Lilac', 'White'], images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=800&fit=crop'], tags: ['puff-sleeve', 'top', 'pastel'], isNewProduct: true, rating: 4.7, reviewCount: 32 },
  { name: 'Hanbok-Inspired Blouse', description: 'Modern interpretation of the traditional Korean Hanbok, reimagined as a contemporary blouse with traditional-inspired collar.', category: 'dresses', price: 1899, stock: 15, sizes: ['S','M','L','XL'], colors: ['Sky Blue', 'Rose', 'Ivory'], images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'], tags: ['hanbok', 'traditional'], isTrending: true, rating: 4.7, reviewCount: 67 },
  { name: 'Embroidered Midi Skirt', description: 'Beautiful midi skirt with hand-embroidered floral motifs. Elastic waistband and flowing fabric create an elegant silhouette.', category: 'dresses', price: 1899, stock: 18, sizes: ['XS','S','M','L'], colors: ['White', 'Cream'], images: ['https://images.unsplash.com/photo-1583496661160-fb5974ca0e0e?w=600&h=800&fit=crop'], tags: ['embroidered', 'skirt'], rating: 4.5, reviewCount: 29 },
  { name: 'Korean Slip Dress', description: 'Minimalist slip dress with subtle sheen fabric. Transitions seamlessly from day to night with adjustable spaghetti straps.', category: 'dresses', price: 2199, discountPrice: 1649, stock: 12, sizes: ['XS','S','M','L','XL'], colors: ['Champagne', 'Black', 'Pink'], images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop'], tags: ['slip', 'minimalist'], isTrending: true, rating: 4.5, reviewCount: 78 },
  { name: 'Pearl Drop Earrings', description: 'Elegant freshwater pearl drop earrings in 925 sterling silver. Hypoallergenic and suitable for sensitive ears.', category: 'accessories', price: 899, discountPrice: 699, stock: 50, colors: ['Silver', 'Gold'], images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop'], tags: ['pearl', 'earrings'], isTrending: true, isNewProduct: true, isFeatured: true, rating: 4.9, reviewCount: 89 },
  { name: 'Cherry Blossom Tote Bag', description: 'Spacious canvas tote bag featuring a delicate cherry blossom print. Reinforced handles and inner pocket.', category: 'accessories', price: 1299, discountPrice: 999, stock: 20, colors: ['Pink', 'Cream'], images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop'], tags: ['tote', 'bag', 'cherry-blossom'], isTrending: true, rating: 4.8, reviewCount: 156 },
  { name: 'Mini Crossbody Bag', description: 'Compact crossbody bag in genuine PU leather. Multiple compartments and adjustable strap.', category: 'accessories', price: 1599, discountPrice: 1249, stock: 15, colors: ['Black', 'Cream', 'Pink'], images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'], tags: ['crossbody', 'bag'], isNewProduct: true, rating: 4.8, reviewCount: 72 },
  { name: 'Daisy Chain Necklace', description: 'Delicate chain necklace with tiny daisy charms. 18k gold-plated brass, perfect for layering.', category: 'accessories', price: 699, stock: 60, colors: ['Gold', 'Silver'], images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop'], tags: ['necklace', 'daisy', 'gold'], isNewProduct: true, rating: 4.9, reviewCount: 18 },
  { name: 'Aesthetic Washi Tape Set', description: 'Set of 12 washi tapes with Korean-inspired patterns. Perfect for bullet journaling and scrapbooking.', category: 'stationery', price: 449, stock: 80, images: ['https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&h=800&fit=crop'], tags: ['washi-tape', 'journaling'], isTrending: true, isNewProduct: true, rating: 4.6, reviewCount: 203 },
  { name: 'Korean Calligraphy Set', description: 'Complete calligraphy set with 5 brush pens, 2 practice books, and traditional Korean ink.', category: 'stationery', price: 1199, stock: 25, images: ['https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&h=800&fit=crop'], tags: ['calligraphy', 'art'], isNewProduct: true, rating: 4.8, reviewCount: 41 },
  { name: 'Aesthetic Bullet Journal', description: 'Premium dotted notebook with 160 gsm acid-free paper and botanical illustrations. A5 size, 200 pages.', category: 'stationery', price: 549, stock: 45, images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop'], tags: ['journal', 'notebook'], isNewProduct: true, isFeatured: true, rating: 4.7, reviewCount: 93 },
  { name: 'Sakura Body Mist', description: 'Light body mist with cherry blossom scent. Moisturizing formula keeps skin soft all day.', category: 'beauty', price: 799, discountPrice: 649, stock: 35, images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=800&fit=crop'], tags: ['body-mist', 'sakura'], isNewProduct: true, rating: 4.6, reviewCount: 55 },
  { name: 'K-Beauty Skincare Set', description: '5-step Korean skincare routine set: toner, essence, serum, moisturizer, and sunscreen. Dermatologically tested.', category: 'beauty', price: 2999, discountPrice: 2399, stock: 20, images: ['https://images.unsplash.com/photo-1596704017254-9b5e2a025acf?w=600&h=800&fit=crop'], tags: ['skincare', 'k-beauty'], isTrending: true, isFeatured: true, rating: 4.9, reviewCount: 112 },
  { name: 'Floral Gift Box Set', description: 'Curated gift box with scented candle, floral tea, artisan soap, and mini journal. Beautifully packaged.', category: 'gifts', price: 2499, discountPrice: 1999, stock: 10, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=800&fit=crop'], tags: ['gift', 'set', 'floral'], isNewProduct: true, isFeatured: true, rating: 4.9, reviewCount: 61 },
  { name: 'Korean Stationery Gift Kit', description: 'Complete kit with notebooks, pens, washi tapes, stickers, and paper clips in Korean design.', category: 'gifts', price: 1799, discountPrice: 1499, stock: 15, images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=800&fit=crop'], tags: ['stationery', 'gift'], rating: 4.7, reviewCount: 38 },
];

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.secret !== 'ziya-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);

    const adminPass = await bcrypt.hash('admin123', 12);
    const userPass = await bcrypt.hash('user123', 12);

    await User.insertMany([
      { name: 'Ziya Admin', email: 'admin@ziya.in', password: adminPass, role: 'admin', phone: '9876543210' },
      { name: 'Priya Sharma', email: 'priya@example.com', password: userPass, role: 'user' },
    ]);

    await Product.insertMany(sampleProducts.map(p => ({ ...p, isActive: true })));

    return NextResponse.json({
      message: '✅ Database seeded successfully!',
      data: { users: 2, products: sampleProducts.length },
      credentials: { admin: 'admin@ziya.in / admin123', user: 'priya@example.com / user123' },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
