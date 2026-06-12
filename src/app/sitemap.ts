import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.ziyakart.com";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...STATIC_ROUTES, ...productRoutes];
  } catch {
    return STATIC_ROUTES;
  }
}
