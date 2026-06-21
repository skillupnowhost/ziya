'use client';
import { useState } from 'react';
import { motion, AnimatePresence, type Transition, type Variants } from 'framer-motion';
import {
  ChevronDownIcon, ChatBubbleLeftEllipsisIcon,
  ShoppingBagIcon, TruckIcon, ArrowPathIcon,
  CreditCardIcon, SparklesIcon, QuestionMarkCircleIcon,
  EnvelopeIcon, MagnifyingGlassIcon, StarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const spring: Transition = { type: 'spring', stiffness: 360, damping: 30 };
const ease: Transition   = { duration: 0.45, ease: 'easeOut' };
const fadeUp: Variants   = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const scaleIn: Variants  = { hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1 } };
const stagger = (s = 0.08, d = 0.04): Variants => ({
  hidden: {}, show: { transition: { staggerChildren: s, delayChildren: d } },
});

const faqCategories = [
  {
    id: 'orders', label: 'Orders', Icon: ShoppingBagIcon,
    color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', ring: 'rgba(244,63,94,0.12)',
    iconAnim: { animate: { y: [0, -2, 0], rotate: [0, -6, 0] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 2 } },
    questions: [
      { q: 'How do I place an order?', a: 'Browse our collections, add items to your cart, and proceed to checkout. Pay via Razorpay (UPI, cards, net banking). You\'ll receive a confirmation email with your order ID right away.' },
      { q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 2 hours of placement. After that, we begin processing and cannot make changes. Email ziyasupport@gmail.com immediately if you need to cancel.' },
      { q: 'How will I know my order is confirmed?', a: 'You\'ll receive an email confirmation with your order ID and a summary of items. You can also check real-time status in My Orders after logging in.' },
      { q: 'Can I order without an account?', a: 'A Ziya account is required to place an order. Registration is quick, free, and unlocks a 10% welcome discount!' },
    ],
  },
  {
    id: 'shipping', label: 'Shipping', Icon: TruckIcon,
    color: '#f97316', bg: '#fff7ed', border: '#fed7aa', ring: 'rgba(249,115,22,0.12)',
    iconAnim: { animate: { x: [0, 4, 0, -2, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1.5 } },
    questions: [
      { q: 'How long does delivery take?', a: 'Tamil Nadu: 2–3 days. South India: 2–5 days. North India: 5–8 days. Remote areas: 3–8 days. J&K / North East: 7–14 business days.' },
      { q: 'Is there free shipping?', a: 'Yes! All orders above ₹999 qualify for free standard shipping. Orders below ₹999 have a shipping fee of ₹79 within Tamil Nadu and ₹99 for the rest of India.' },
      { q: 'Do you ship internationally?', a: 'Currently, Ziya ships only within India. We\'re working on international expansion!' },
      { q: 'How is my order dispatched?', a: 'Orders placed before 2 PM on working days are dispatched the same day. Orders after 2 PM or on weekends ship the next working day.' },
    ],
  },
  {
    id: 'returns', label: 'Returns', Icon: ArrowPathIcon,
    color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', ring: 'rgba(139,92,246,0.12)',
    iconAnim: { animate: { rotate: [0, 360] }, transition: { duration: 3, repeat: Infinity, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
    questions: [
      { q: 'What is your return policy?', a: 'We do not accept returns or exchanges. However, if you receive a damaged item, please share an unboxing video with our WhatsApp (+91 9003828556) or email within 24 hours of delivery.' },
      { q: 'What if I receive a damaged item?', a: 'Email us at ziyasupport@gmail.com with photos and order details within 24 hours of delivery. We\'ll review promptly and arrange a replacement.' },
      { q: 'What happens if my shipment is returned?', a: 'If returned due to wrong address or failed delivery — we cover return shipping cost. Re-shipping charges will be paid by the customer.' },
      { q: 'What if my order is lost in transit?', a: 'Refunds cannot be provided for lost parcels, but we will ensure a replacement is sent to you. Contact us with your order ID and we\'ll raise a claim.' },
    ],
  },
  {
    id: 'products', label: 'Products', Icon: SparklesIcon,
    color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', ring: 'rgba(236,72,153,0.12)',
    iconAnim: { animate: { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 2.5 } },
    questions: [
      { q: 'How do I find my size?', a: 'Every product page has a size guide with measurements in centimetres. When in doubt, size up — Korean styles tend to run slim.' },
      { q: 'Are your products authentic Korean fashion?', a: 'Yes! Our collections are sourced directly from Korean fashion suppliers — K-drama-inspired dresses, accessories, and stationery.' },
      { q: 'How often do you add new products?', a: 'We drop new collections every 2–3 weeks! Subscribe to our newsletter to get notified first.' },
      { q: 'Can I request a specific style?', a: 'Absolutely! DM us on Instagram @ziya.thefashioncloset or WhatsApp us at +91 9003828556.' },
    ],
  },
  {
    id: 'payment', label: 'Payment', Icon: CreditCardIcon,
    color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', ring: 'rgba(14,165,233,0.12)',
    iconAnim: { animate: { rotateY: [0, 180, 360] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 2 } },
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept all major methods via Razorpay — UPI (PhonePe, Google Pay, Paytm), credit/debit cards, net banking, and EMI on select banks.' },
      { q: 'Is my payment information secure?', a: 'All payments are processed by Razorpay with 256-bit SSL encryption. Ziya never stores your card details.' },
      { q: 'Can I use multiple discount codes?', a: 'Only one discount code per order. Free shipping auto-applies when cart meets the ₹999 threshold.' },
      { q: 'What if my payment fails?', a: 'If payment fails, no amount is deducted (or reverses within 5–7 days). Retry with a different method or email ziyasupport@gmail.com.' },
    ],
  },
];

const stats = [
  { icon: CheckCircleIcon, label: 'Questions answered', value: '20+' },
  { icon: StarIcon,        label: 'Topics covered',     value: '5' },
  { icon: MagnifyingGlassIcon, label: 'Average read time', value: '2 min' },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openItem, setOpenItem] = useState<string | null>(null);
  const cat = faqCategories.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-slate-50 page-enter">

      {/* ── HERO ── */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #f43f5e, transparent 70%)' }}
            animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
            animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 6 }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 mb-7"
            initial={{ opacity: 0, y: -18, scale: 0.84 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.05 }}>
            <motion.div animate={{ rotate: [0, -12, 12, -6, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}>
              <QuestionMarkCircleIcon className="w-4 h-4 text-rose-500" />
            </motion.div>
            <span className="text-rose-600 text-xs font-bold tracking-[0.18em] uppercase">Help Centre</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-4"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.1 }}>
            Got a question?{' '}
            <motion.span
              className="block mt-1 bg-gradient-to-r from-rose-500 via-violet-500 to-sky-500 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
              animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              We have answers.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-slate-500 text-base sm:text-lg max-w-sm mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.18 }}>
            Browse topics to quickly find answers about orders, shipping, returns, and more.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={stagger(0.08, 0.28)} initial="hidden" animate="show">
            {stats.map(s => (
              <motion.div key={s.label} variants={scaleIn} transition={spring}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <s.icon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="text-slate-700 text-sm font-bold">{s.value}</span>
                <span className="text-slate-400 text-xs">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* ── STICKY TABS ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 overflow-x-auto hide-scrollbar">
          <motion.div
            className="flex gap-1 sm:gap-1.5 py-2.5 sm:py-3 w-max sm:w-auto sm:justify-center mx-auto"
            variants={stagger(0.05, 0.08)} initial="hidden" animate="show">
            {faqCategories.map(c => {
              const active = activeCategory === c.id;
              return (
                <motion.button key={c.id} type="button"
                  variants={scaleIn} transition={spring}
                  onClick={() => { setActiveCategory(c.id); setOpenItem(null); }}
                  className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 group"
                  style={{
                    background: active ? `linear-gradient(135deg, ${c.color}, ${c.color}dd)` : 'transparent',
                    color:      active ? '#fff' : '#64748b',
                    boxShadow:  active ? `0 4px 20px ${c.ring}, 0 2px 8px ${c.ring}` : 'none',
                  }}
                  whileHover={{
                    scale: active ? 1.02 : 1.05,
                    y: active ? 0 : -2,
                    backgroundColor: active ? undefined : c.bg,
                    color: active ? '#fff' : c.color,
                    boxShadow: active ? `0 6px 24px ${c.ring}, 0 2px 8px ${c.ring}` : `0 4px 16px ${c.ring}`,
                  }}
                  whileTap={{
                    scale: 0.92,
                    backgroundColor: active ? undefined : c.bg,
                    color: active ? '#fff' : c.color,
                    boxShadow: active ? `0 4px 20px ${c.ring}` : `0 2px 12px ${c.ring}`,
                  }}>
                  <motion.div
                    className="flex-shrink-0"
                    animate={c.iconAnim.animate}
                    transition={c.iconAnim.transition as Transition}
                    whileHover={{ scale: 1.25, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 1.3, transition: { duration: 0.15 } }}>
                    <c.Icon className="w-4 h-4" />
                  </motion.div>
                  {c.label}
                  {!active && (
                    <motion.span
                      className="absolute bottom-0.5 left-1/2 h-[2px] rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
                      initial={{ width: 0, x: '-50%', opacity: 0 }}
                      whileHover={{ width: '60%', x: '-50%', opacity: 1 }}
                      whileTap={{ width: '50%', x: '-50%', opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── FAQ CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.26, ease: 'easeOut' }}>

            {/* Category heading */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${cat.color},${cat.color}cc)` }}
                whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                <cat.Icon className="w-5 h-5" />
              </motion.div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{cat.label}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{cat.questions.length} questions in this section</p>
              </div>
            </div>

            {/* Accordion items */}
            <motion.div className="space-y-2.5" variants={stagger(0.07, 0.04)} initial="hidden" animate="show">
              {cat.questions.map((item, i) => {
                const key   = `${activeCategory}-${i}`;
                const isOpen = openItem === key;
                return (
                  <motion.div key={key} variants={fadeUp} transition={ease}
                    className="overflow-hidden bg-white rounded-2xl"
                    style={{
                      border:     isOpen ? `1.5px solid ${cat.border}` : '1.5px solid #f1f5f9',
                      boxShadow:  isOpen ? `0 4px 24px ${cat.ring}` : '0 1px 3px rgba(0,0,0,0.04)',
                      borderLeft: isOpen ? `4px solid ${cat.color}` : '4px solid transparent',
                    }}
                    whileHover={!isOpen ? { y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } : {}}>
                    <button type="button" onClick={() => setOpenItem(isOpen ? null : key)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left">
                      <motion.div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{
                          background: isOpen ? cat.color  : '#f8fafc',
                          color:      isOpen ? '#ffffff'  : '#94a3b8',
                          border:     isOpen ? 'none'     : '1px solid #e2e8f0',
                        }}
                        animate={{ scale: isOpen ? 1.05 : 1 }} transition={spring}>
                        {i + 1}
                      </motion.div>
                      <span className="flex-1 font-semibold text-slate-800 text-sm sm:text-[15px] leading-snug">
                        {item.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                        style={{ color: isOpen ? cat.color : '#cbd5e1' }}
                        className="flex-shrink-0">
                        <ChevronDownIcon className="w-5 h-5" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                          className="overflow-hidden">
                          <div className="px-5 pb-5 pt-0.5 border-t"
                            style={{ background: cat.bg, borderColor: cat.border }}>
                            <p className="text-slate-600 text-sm leading-relaxed pt-3">{item.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ── Divider ── */}
        <div className="my-14 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
            <SparklesIcon className="w-4 h-4 text-rose-300" />
          </motion.div>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* ── CTA ── */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          style={{ background: 'linear-gradient(135deg,#f43f5e 0%,#a855f7 60%,#0ea5e9 100%)' }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={ease}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-20"
              style={{ background: 'rgba(255,255,255,0.5)' }}
              animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-15"
              style={{ background: 'rgba(255,255,255,0.4)' }}
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
          </div>
          <div className="relative px-7 py-10 sm:py-12 text-center">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-5"
              animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}>
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-white font-black text-2xl sm:text-3xl mb-3">Still need help?</h3>
            <p className="text-white/75 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Our support team is available <span className="font-bold text-white">Mon–Sat</span>. We typically reply within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.a href="mailto:ziyasupport@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm bg-white text-rose-600 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }} transition={spring}>
                <EnvelopeIcon className="w-4 h-4" />
                Email Us
              </motion.a>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }} transition={spring}>
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white border border-white/30 bg-white/10 hover:bg-white/20 transition-colors">
                  All Contact Options
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
