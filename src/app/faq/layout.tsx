import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FAQ – Orders, Shipping, Returns & Payments | Ziyakart",
  description: "Find answers about Ziyakart's Korean fashion orders, shipping timelines, return policy, payment options, and product authenticity. Help centre for Indian shoppers.",
  alternates: { canonical: "https://www.ziyakart.com/faq" },
  openGraph: {
    title: "FAQ | Ziyakart Korean Fashion Help Centre",
    description: "Common questions about orders, shipping to Tamil Nadu & India, returns, and Korean fashion product authenticity at Ziyakart.",
    url: "https://www.ziyakart.com/faq",
    images: [{ url: "https://www.ziyakart.com/ziya-logo.png", width: 1200, height: 630, alt: "Ziyakart FAQ – Korean Fashion Help" }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I place an order on Ziyakart?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Browse our Korean fashion collections, add items to your cart, and proceed to checkout. Pay via Razorpay (UPI, cards, net banking). You'll receive a confirmation email with your order ID right away.",
      },
    },
    {
      "@type": "Question",
      name: "How long does delivery take in Tamil Nadu and across India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tamil Nadu: 2–3 days. South India (Karnataka, Andhra, Kerala, Telangana): 2–5 days. North India: 5–8 days. Remote areas: 3–8 days. J&K / North East: 7–14 business days.",
      },
    },
    {
      "@type": "Question",
      name: "Is there free shipping on Ziyakart?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! All orders above ₹999 qualify for free standard shipping. Orders below ₹999 have a shipping fee of ₹79 within Tamil Nadu and ₹99 for the rest of India.",
      },
    },
    {
      "@type": "Question",
      name: "What is Ziyakart's return policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ziyakart does not accept returns or exchanges. However, if you receive a damaged item, please share an unboxing video via WhatsApp (+91 9003828556) or email within 24 hours of delivery.",
      },
    },
    {
      "@type": "Question",
      name: "Are Ziyakart's products authentic Korean fashion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! All collections are sourced directly from Korean fashion suppliers — K-drama-inspired dresses, accessories, and stationery.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods does Ziyakart accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept all major methods via Razorpay — UPI (PhonePe, Google Pay, Paytm), credit/debit cards, net banking, and EMI on select banks.",
      },
    },
    {
      "@type": "Question",
      name: "Can I modify or cancel my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Orders can be modified or cancelled within 2 hours of placement. After that, we begin processing and cannot make changes. Email ziyasupport@gmail.com immediately if you need to cancel.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
