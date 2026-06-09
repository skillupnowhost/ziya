'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaFacebook, FaPinterest, FaYoutube } from 'react-icons/fa';
import {
  EnvelopeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const socials = [
  { icon: FaInstagram, label: 'Instagram', color: 'hover:text-pink-400', hoverBg: 'hover:bg-pink-400/15' },
  { icon: FaFacebook, label: 'Facebook', color: 'hover:text-blue-400', hoverBg: 'hover:bg-blue-400/15' },
  { icon: FaPinterest, label: 'Pinterest', color: 'hover:text-red-400', hoverBg: 'hover:bg-red-400/15' },
  { icon: FaYoutube, label: 'YouTube', color: 'hover:text-rose-400', hoverBg: 'hover:bg-rose-400/15' },
];

const contactItems = [
  {
    icon: EnvelopeIcon,
    href: 'mailto:ziyasupport@gmail.com',
    label: 'ziyasupport@gmail.com',
    hoverColor: 'group-hover:text-rose-400',
    iconBg: 'bg-rose-400/10',
    iconColor: 'text-rose-400',
    rotate: true,
  },
  {
    icon: PhoneIcon,
    href: 'tel:+919003828556',
    label: '+91 90038 28556',
    hoverColor: 'group-hover:text-emerald-400',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
    bounce: true,
  },
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
      if (!res.ok) { toast.error(data.error || 'Something went wrong.'); return; }
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
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-[#12121f] border border-rose-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.85, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              <motion.button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>

              <motion.div
                className="text-5xl mb-4"
                initial={{ scale: 0.3, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 18 }}
              >
                {alreadyClaimed ? '👋' : '🎉'}
              </motion.div>
              <h3 className="text-white font-bold text-xl mb-1">
                {alreadyClaimed ? 'Welcome back!' : "Here's your 10% off!"}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {alreadyClaimed
                  ? 'You already subscribed. Here is your coupon:'
                  : 'Use this code at checkout on your first order:'}
              </p>

              <motion.div
                className="flex items-center gap-2 bg-white/5 border border-rose-400/40 rounded-2xl px-4 py-3 mb-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <span className="flex-1 text-rose-400 font-mono font-bold text-lg tracking-widest text-left">
                  {couponCode}
                </span>
                <motion.button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy coupon code"
                  className="text-gray-400 hover:text-rose-400 transition-colors p-1"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckIcon className="w-5 h-5 text-emerald-400" />
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              <p className="text-xs text-gray-500 mb-6">
                Valid on your <span className="text-rose-400 font-semibold">first order only</span>. One use per email.
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/products"
                  onClick={() => setShowModal(false)}
                  className="block w-full py-3 bg-rose-400 hover:bg-rose-500 text-white font-bold rounded-2xl transition-colors text-sm"
                >
                  Shop Now →
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-[#1a1a2e] text-gray-300">
        {/* Newsletter */}
        <div className="newsletter-bg relative overflow-hidden py-10">
          <span className="newsletter-watermark absolute right-[-2%] top-1/2 -translate-y-1/2 text-[80px] sm:text-[110px] font-black leading-none select-none pointer-events-none">
            10%
          </span>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <motion.div
                className="lg:max-w-xs"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
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
              </motion.div>

              <motion.div
                className="flex-1 lg:max-w-sm"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="newsletter-card-border relative rounded-2xl p-[1px]">
                  <div className="rounded-2xl bg-[#12121f] px-5 py-5">
                    <p className="text-white text-sm font-semibold mb-0.5 tracking-wide">Subscribe to Ziya</p>
                    <p className="text-gray-500 text-xs mb-4">Weekly drops, offers &amp; Korean fashion updates</p>
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <div className="relative group">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 blur transition-all duration-300" />
                        <div className="relative flex items-center bg-white/5 border border-white/8 group-focus-within:border-rose-400/60 rounded-xl transition-all duration-300">
                          <span className="pl-3 shrink-0">
                            <motion.span
                              whileHover={{ scale: 1.2, rotate: -10 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                              className="block"
                            >
                              <EnvelopeIcon className="w-4 h-4 text-rose-400/70" />
                            </motion.span>
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
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="newsletter-submit-btn w-full py-2.5 rounded-xl font-bold text-sm text-white tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.97 }}
                      >
                        {loading ? 'Getting your coupon...' : 'Get My 10% Off →'}
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <motion.div
              className="col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Link href="/">
                  <Image
                    src="/ziya-logo.png"
                    alt="Ziya — the Fashion Closet"
                    width={130}
                    height={48}
                    className="h-12 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                  />
                </Link>
              </motion.div>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Korean-inspired fashion, accessories & stationery. Bringing the elegance of Seoul to your doorstep.
              </p>
              {/* Animated social icons */}
              <div className="flex space-x-2 mt-5">
                {socials.map(({ icon: Icon, label, color, hoverBg }, i) => (
                  <motion.a
                    key={label}
                    href="#"
                    aria-label={label}
                    className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 ${color} ${hoverBg} transition-colors duration-200`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.18, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="text-lg" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Shop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4 tracking-wide">Shop</h4>
              <ul className="space-y-2">
                {[...categories, { label: 'New Arrivals', href: '/products?new=true' }, { label: 'Trending Now', href: '/products?trending=true' }].map((cat, i) => (
                  <motion.li
                    key={cat.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <Link href={cat.href} className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-rose-400 transition-colors">
                      <motion.span
                        className="w-0 group-hover:w-3 h-px bg-rose-400 rounded-full transition-all duration-300 overflow-hidden"
                      />
                      {cat.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.18 }}
            >
              <h4 className="text-white font-semibold mb-4 tracking-wide">Support</h4>
              <ul className="space-y-2">
                {support.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.18 + i * 0.06 }}
                  >
                    <Link href={item.href} className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-rose-400 transition-colors">
                      <motion.span className="w-0 group-hover:w-3 h-px bg-rose-400 rounded-full transition-all duration-300 overflow-hidden" />
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              className="col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <h4 className="text-white font-semibold mb-4 tracking-wide">Contact</h4>
              <div className="space-y-3">
                {contactItems.map(({ icon: Icon, href, label, hoverColor, iconBg, iconColor, rotate, bounce }) => (
                  <motion.a
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 group"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <motion.span
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBg} ${iconColor} text-sm shrink-0`}
                      whileHover={
                        rotate
                          ? { rotate: [0, -15, 15, -8, 0] }
                          : bounce
                            ? { y: [0, -4, 0, -2, 0] }
                            : { scale: 1.15 }
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.span>
                    <span className={`text-sm text-gray-300 ${hoverColor} transition-colors break-all`}>{label}</span>
                  </motion.a>
                ))}
                <div className="flex items-start gap-2.5">
                  <motion.span
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-400/10 text-violet-400 shrink-0 mt-0.5"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ClockIcon className="w-4 h-4" />
                  </motion.span>
                  <div>
                    <p className="text-sm text-gray-300">Mon – Sat, 10am – 7pm IST</p>
                    <p className="text-xs font-semibold text-rose-400 mt-1 tracking-wide uppercase">Sunday Holiday</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed italic">(Queries after working hours will be addressed the next working day.)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <motion.div
            className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-gray-500">© 2026 Ziya — the Fashion Closet. All rights reserved. Made with ♥ for Korean fashion lovers.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">Terms of Service</Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
}
