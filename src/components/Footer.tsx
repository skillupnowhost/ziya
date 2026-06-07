'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaFacebook, FaPinterest, FaYoutube } from 'react-icons/fa';
import { EnvelopeIcon, ClipboardDocumentIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const categories = [
  { label: 'Dresses', href: '/products?category=dresses' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Stationery', href: '/products?category=stationery' },
];

const support = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Track Order', href: '/orders' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  if (pathname.startsWith('/admin')) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setCouponCode(data.couponCode);
      setAlreadyClaimed(!!data.alreadyClaimed);
      setShowModal(true);
      setEmail('');
    } catch {
      toast.error('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      toast.success('Coupon code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Please copy manually.');
    }
  };

  return (
    <>
      {/* Coupon reveal modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-[#12121f] border border-rose-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="text-5xl mb-4">{alreadyClaimed ? '👋' : '🎉'}</div>
            <h3 className="text-white font-bold text-xl mb-1">
              {alreadyClaimed ? 'Welcome back!' : "Here's your 10% off!"}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {alreadyClaimed
                ? 'You already subscribed with this email. Here is your coupon:'
                : 'Use this code at checkout on your first order:'}
            </p>

            <div className="flex items-center gap-2 bg-white/5 border border-rose-400/40 rounded-2xl px-4 py-3 mb-4">
              <span className="flex-1 text-rose-400 font-mono font-bold text-lg tracking-widest text-left">
                {couponCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy coupon code"
                className="text-gray-400 hover:text-rose-400 transition-colors p-1"
              >
                {copied ? <CheckIcon className="w-5 h-5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Valid on your <span className="text-rose-400 font-semibold">first order only</span>. One use per email. Cannot be combined with other offers.
            </p>

            <Link
              href="/products"
              onClick={() => setShowModal(false)}
              className="block w-full py-3 bg-rose-400 hover:bg-rose-500 text-white font-bold rounded-2xl transition-colors text-sm"
            >
              Shop Now →
            </Link>
          </div>
        </div>
      )}

      <footer className="bg-[#1a1a2e] text-gray-300">
        {/* Newsletter */}
        <div className="newsletter-bg relative overflow-hidden py-10">
          {/* Ghost "10%" watermark */}
          <span className="newsletter-watermark absolute right-[-2%] top-1/2 -translate-y-1/2 text-[80px] sm:text-[110px] font-black leading-none select-none pointer-events-none">
            10%
          </span>

          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />

          {/* Top rule */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              {/* Left — copy */}
              <div className="lg:max-w-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-6 bg-rose-500/50" />
                  <span className="text-rose-400 text-[10px] font-bold tracking-[0.3em] uppercase">Ziya Updates</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                  New arrivals.<br />
                  <span className="italic text-rose-400">Your inbox first.</span>
                </h3>

                <p className="text-gray-500 text-xs leading-relaxed">
                  Get notified the moment new Korean collections land — dresses, accessories, stationery &amp; more.
                  Plus a <span className="text-rose-400 font-semibold">10% discount</span> on your very first order.
                </p>
              </div>

              {/* Right — form card */}
              <div className="flex-1 lg:max-w-sm">
                <div className="newsletter-card-border relative rounded-2xl p-[1px]">
                  <div className="rounded-2xl bg-[#12121f] px-5 py-5">
                    <p className="text-white text-sm font-semibold mb-0.5 tracking-wide">Subscribe to Ziya</p>
                    <p className="text-gray-500 text-xs mb-4">Weekly drops, offers &amp; Korean fashion updates</p>

                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <div className="relative group">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                        <div className="relative flex items-center bg-white/5 border border-white/8 group-focus-within:border-rose-400/60 rounded-xl transition-all duration-300">
                          <span className="pl-3 shrink-0">
                            <EnvelopeIcon className="w-4 h-4 text-rose-400/70" />
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                            className="w-full px-3 py-2.5 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="newsletter-submit-btn w-full py-2.5 rounded-xl font-bold text-sm text-white tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Getting your coupon...' : 'Get My 10% Off →'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/">
                <Image
                  src="/ziya-logo.png"
                  alt="Ziya — the Fashion Closet"
                  width={130}
                  height={48}
                  className="h-12 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Korean-inspired fashion, accessories & stationery. Bringing the elegance of Seoul to your doorstep.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-rose-400 transition-colors text-xl"><FaInstagram /></a>
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-rose-400 transition-colors text-xl"><FaFacebook /></a>
                <a href="#" aria-label="Pinterest" className="text-gray-400 hover:text-rose-400 transition-colors text-xl"><FaPinterest /></a>
                <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-rose-400 transition-colors text-xl"><FaYoutube /></a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-white font-semibold mb-4 tracking-wide">Shop</h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.href}>
                    <Link href={cat.href} className="text-sm text-gray-400 hover:text-rose-400 transition-colors">
                      {cat.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products?new=true" className="text-sm text-gray-400 hover:text-rose-400 transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products?trending=true" className="text-sm text-gray-400 hover:text-rose-400 transition-colors">
                    Trending Now
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4 tracking-wide">Support</h4>
              <ul className="space-y-2">
                {support.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-gray-400 hover:text-rose-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 lg:col-span-1">
              <h4 className="text-white font-semibold mb-4 tracking-wide">Contact</h4>
              <div className="space-y-3">
                <a href="mailto:ziyasupport@gmail.com" className="flex items-center gap-2.5 group">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-400/10 text-rose-400 text-sm shrink-0">✉</span>
                  <span className="text-sm text-gray-300 group-hover:text-rose-400 transition-colors break-all">ziyasupport@gmail.com</span>
                </a>
                <a href="tel:+919003828556" className="flex items-center gap-2.5 group">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-400/10 text-rose-400 text-sm shrink-0">📞</span>
                  <span className="text-sm text-gray-300 group-hover:text-rose-400 transition-colors">+91 90038 28556</span>
                </a>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-400/10 text-rose-400 text-sm shrink-0 mt-0.5">🕐</span>
                  <div>
                    <p className="text-sm text-gray-300">Mon – Sat, 10am – 7pm IST</p>
                    <p className="text-xs font-semibold text-rose-400 mt-1 tracking-wide uppercase">Sunday Holiday</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed italic">(Queries after working hours will be addressed the next working day.)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2026 Ziya — the Fashion Closet. All rights reserved. Made with ♥ for Korean fashion lovers.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-rose-400">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-rose-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
