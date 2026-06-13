import type { Metadata } from 'next';
import Script from 'next/script';
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

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: row } = await supabase
    .from('products')
    .select('name, description, images, price, discount_price, category, rating, review_count, stock')
    .eq('id', id)
    .maybeSingle();

  const product = row ? (mapRow(row) as {
    name: string;
    description?: string;
    images?: string[];
    price: number;
    discountPrice?: number;
    category?: string;
    rating?: number;
    reviewCount?: number;
    stock?: number;
  }) : null;

  const productJsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? `Authentic Korean ${product.category ?? 'fashion'} from Ziyakart – delivered across India.`,
    image: product.images ?? [],
    brand: { "@type": "Brand", name: "Ziyakart" },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${id}`,
      priceCurrency: "INR",
      price: product.discountPrice ?? product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: (product.stock ?? 1) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Ziyakart" },
    },
    ...(product.rating && product.reviewCount ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  } : null;

  return (
    <>
      {productJsonLd && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
