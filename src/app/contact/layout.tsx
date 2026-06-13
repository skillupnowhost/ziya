import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Korean Fashion Support | Ziyakart Chennai",
  description: "Reach Ziyakart's support team via WhatsApp, Instagram or email. Get help with orders, returns, and Korean fashion queries. Based in Chennai, Tamil Nadu.",
  alternates: { canonical: "https://www.ziyakart.com/contact" },
  openGraph: {
    title: "Contact Ziyakart | Korean Fashion Store – Chennai",
    description: "Chat with us on WhatsApp or DM on Instagram for styling help, order updates, and Korean fashion queries. Support Mon–Sat.",
    url: "https://www.ziyakart.com/contact",
    images: [{ url: "https://www.ziyakart.com/ziya-logo.png", width: 1200, height: 630, alt: "Ziyakart – Contact Korean Fashion Store Chennai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Ziyakart | Korean Fashion Chennai",
    description: "Reach us on WhatsApp, Instagram or email for order help and style queries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
