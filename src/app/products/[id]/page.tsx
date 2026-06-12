import type { Metadata } from 'next';
import { supabase, mapRow } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';

const BASE_URL = 'https://www.ziyakart.com';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: row } = await supabase
    .from('products')
    .select('name, description, images, price, discount_price, category')
    .eq('id', id)
    .maybeSingle();

  if (!row) {
    return { title: 'Product Not Found' };
  }

  const product = mapRow(row) as {
    name: string;
    description?: string;
    images?: string[];
    price: number;
    discountPrice?: number;
    category?: string;
  };

  const title = `${product.name} | Ziyakart`;
  const description = product.description
    ? product.description.slice(0, 155)
    : `Buy ${product.name} – authentic Korean ${product.category ?? 'fashion'} at Ziyakart. Fast delivery across India.`;
  const image = product.images?.[0] ?? `${BASE_URL}/ziya-logo.png`;
  const url = `${BASE_URL}/products/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [{ url: image, alt: product.name }],
      siteName: 'Ziyakart',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
