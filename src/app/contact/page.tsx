'use client';
import { motion, type Transition, type Variants } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import {
  EnvelopeIcon, ClockIcon, ArrowTopRightOnSquareIcon,
  ChatBubbleLeftEllipsisIcon, QuestionMarkCircleIcon,
  TruckIcon, PhoneIcon, CheckCircleIcon, SparklesIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const spring: Transition = { type: 'spring', stiffness: 360, damping: 30 };
const ease: Transition   = { duration: 0.48, ease: 'easeOut' };
const fadeUp: Variants   = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } };
const scaleIn: Variants  = { hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1 } };
const stagger = (s = 0.1, d = 0.05): Variants => ({
  hidden: {}, show: { transition: { staggerChildren: s, delayChildren: d } },
});

const channels = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    sub: 'Fastest response — replies in minutes',
    handle: '+91 9003828556',
    ctaLabel: 'Chat on WhatsApp',
    href: 'https://wa.me/919003828556',
    Icon: FaWhatsapp,
    isFA: true,
    gradient: 'linear-gradient(145deg,#22c55e,#16a34a)',
    glow: 'rgba(34,197,94,0.18)',
    accentBg: '#f0fdf4',
    accentBorder: '#bbf7d0',
    iconBg: 'linear-gradient(145deg,#22c55e,#16a34a)',
    badge: { text: 'Online Now', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
    external: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    sub: 'Style queries & collection lookups',
    handle: '@ziya.thefashioncloset',
    ctaLabel: 'DM on Instagram',
    href: 'https://www.instagram.com/ziya.thefashioncloset?igsh=MThoZjZtMzFyOHhtYg==',
    Icon: FaInstagram,
    isFA: true,
    gradient: 'linear-gradient(145deg,#833ab4,#fd1d1d,#fcb045)',
    glow: 'rgba(131,58,180,0.15)',
    accentBg: '#faf5ff',
    accentBorder: '#e9d5ff',
    iconBg: 'linear-gradient(145deg,#833ab4,#fd1d1d,#fcb045)',
    badge: { text: 'Style Help', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
    external: true,
  },
  {
    id: 'email',
    label: 'Email Support',
    sub: 'Detailed queries, complaints & order issues',
    handle: 'ziyasupport@gmail.com',
    ctaLabel: 'Send an Email',
    href: 'mailto:ziyasupport@gmail.com',
    Icon: EnvelopeIcon,
    isFA: false,
    gradient: 'linear-gradient(145deg,#f43f5e,#e11d48)',
    glow: 'rgba(244,63,94,0.15)',
    accentBg: '#fff1f2',
    accentBorder: '#fecdd3',
    iconBg: 'linear-gradient(145deg,#f43f5e,#e11d48)',
    badge: { text: 'Replies in 24h', bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
    external: false,
  },
];

const quickLinks = [
  { Icon: QuestionMarkCircleIcon, label: 'Browse FAQ',       sub: 'Common questions answered', href: '/faq',         color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { Icon: TruckIcon,              label: 'Track Your Order',  sub: 'Live order status',          href: '/track-order', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { Icon: ChatBubbleLeftEllipsisIcon, label: 'Shipping Info', sub: 'Delivery timelines',         href: '/shipping',    color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
];

const hours = [
  { day: 'Monday – Friday', hours: '10:00 AM – 6:00 PM', open: true  },
  { day: 'Saturday',        hours: '10:00 AM – 2:00 PM', open: true  },
  { day: 'Sunday',          hours: 'Closed',              open: false },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 page-enter">

      {/* ══ HERO ══ */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-[0.10]"
            style={{ background: 'radial-gradient(circle,#f43f5e,transparent 70%)' }}
            animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-[0.07]"
            style={{ background: 'radial-gradient(circle,#8b5cf6,transparent 70%)' }}
            animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 mb-7"
            initial={{ opacity: 0, scale: 0.8, y: -12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={spring}>
            <motion.div animate={{ rotate: [0, -12, 12, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}>
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-rose-500" />
            </motion.div>
            <span className="text-rose-600 text-xs font-bold tracking-[0.18em] uppercase">Contact Us</span>
          </motion.div>

          <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-4"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.1 }}>
            We&apos;re here to{' '}
            <motion.span
              className="block mt-1 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
              animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
              help you.
            </motion.span>
          </motion.h1>

          <motion.p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.18 }}>
            Reach out any way you like — style questions, order updates, or just a hello.
          </motion.p>

          {/* Live indicator */}
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.3 }}>
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            <span className="text-emerald-700 text-xs font-semibold">Support available Mon–Sat</span>
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* ══ CHANNEL CARDS ══ */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-8">
        <motion.div className="grid sm:grid-cols-3 gap-4 sm:gap-5"
          variants={stagger(0.1, 0.1)} initial="hidden" animate="show">
          {channels.map(ch => (
            <motion.a key={ch.id} href={ch.href}
              target={ch.external ? '_blank' : undefined}
              rel={ch.external ? 'noopener noreferrer' : undefined}
              variants={scaleIn} transition={spring}
              className="group block bg-white rounded-3xl overflow-hidden relative cursor-pointer"
              style={{
                border: `1.5px solid ${ch.accentBorder}`,
                boxShadow: `0 2px 16px ${ch.glow}`,
              }}
              whileHover={{ scale: 1.02, y: -5, boxShadow: `0 12px 40px ${ch.glow}` }}
              whileTap={{ scale: 0.98 }}>

              {/* Top colour bar */}
              <div className="h-1 w-full" style={{ background: ch.iconBg }} />

              {/* Hover glow overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 80% 15%,${ch.glow} 0%,transparent 65%)` }} />

              <div className="relative p-6">
                {/* Badge */}
                <motion.span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full mb-4"
                  style={{ background: ch.badge.bg, color: ch.badge.color, border: `1px solid ${ch.badge.border}` }}
                  whileHover={{ scale: 1.06 }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ch.badge.color }}
                    animate={{ scale: [1, 1.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  {ch.badge.text}
                </motion.span>

                {/* Icon */}
                <div className="relative mb-4">
                  <motion.div className="absolute inset-0 rounded-2xl blur-md"
                    style={{ background: ch.glow }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
                  <motion.div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: ch.iconBg }}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }} transition={{ duration: 0.4 }}>
                    {ch.isFA
                      ? <ch.Icon className="text-2xl text-white" />
                      : <ch.Icon className="w-6 h-6 text-white" />}
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="font-black text-slate-900 text-lg mb-1">{ch.label}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">{ch.sub}</p>
                <p className="font-bold text-sm break-all mb-4" style={{ color: ch.badge.color }}>{ch.handle}</p>

                {/* CTA row */}
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: ch.badge.color }}>
                  <span className="group-hover:underline underline-offset-2">{ch.ctaLabel}</span>
                  <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ══ HOURS + CONTACTS ══ */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <motion.div
          className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={ease}>

          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

            {/* Hours */}
            <div className="p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 border border-rose-100 flex-shrink-0"
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}>
                  <ClockIcon className="w-5 h-5 text-rose-500" />
                </motion.div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                  <h2 className="text-lg font-black text-slate-900">Support Hours</h2>
                </div>
              </div>

              <div className="space-y-1">
                {hours.map((row, i) => (
                  <motion.div key={row.day}
                    className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                    initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ ...ease, delay: i * 0.08 }}>
                    <div className="flex items-center gap-2.5">
                      <motion.span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.open ? 'bg-emerald-400' : 'bg-slate-300'}`}
                        animate={row.open ? { scale: [1, 1.5, 1] } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
                      <span className="text-sm text-slate-700 font-medium">{row.day}</span>
                    </div>
                    <motion.span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={row.open
                        ? { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }
                        : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}
                      whileHover={{ scale: 1.06 }}>
                      {row.hours}
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              <motion.div className="mt-5 flex items-start gap-2.5 rounded-2xl px-4 py-3 bg-amber-50 border border-amber-100"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ ...ease, delay: 0.3 }}>
                <motion.div animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}>
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                </motion.div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  After-hours queries are addressed the next working day.{' '}
                  <span className="font-semibold">WhatsApp</span> is fastest for urgent matters.
                </p>
              </motion.div>
            </div>

            {/* Contacts */}
            <div className="p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-50 border border-sky-100 flex-shrink-0"
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <PhoneIcon className="w-5 h-5 text-sky-500" />
                </motion.div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct</p>
                  <h2 className="text-lg font-black text-slate-900">Reach Us At</h2>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { href: 'tel:+919003828556',           Icon: PhoneIcon,    isFA: false, label: 'Phone',    val: '+91 9003828556',        bg: '#dcfce7', border: '#86efac', color: '#15803d', ext: false },
                  { href: 'https://wa.me/919003828556',  Icon: FaWhatsapp,   isFA: true,  label: 'WhatsApp', val: '+91 9003828556',        bg: '#dcfce7', border: '#86efac', color: '#16a34a', ext: true  },
                  { href: 'mailto:ziyasupport@gmail.com',Icon: EnvelopeIcon, isFA: false, label: 'Email',    val: 'ziyasupport@gmail.com', bg: '#ffe4e6', border: '#fecdd3', color: '#e11d48', ext: false },
                ].map(({ href, Icon, isFA, label, val, bg, border, color, ext }, i) => (
                  <motion.a key={label} href={href}
                    target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 group"
                    style={{ background: bg, border: `1.5px solid ${border}` }}
                    initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ ...ease, delay: i * 0.09 }}
                    whileHover={{ x: 4, scale: 1.015 }} whileTap={{ scale: 0.97 }}>
                    <motion.div className="flex-shrink-0"
                      whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                      {isFA
                        ? <Icon className="text-lg" style={{ color }} />
                        : <Icon className="w-4 h-4" style={{ color }} />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${color}99` }}>{label}</p>
                      <p className="text-sm font-bold truncate" style={{ color }}>{val}</p>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ LOCATION NOTE ══ */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <motion.div
          className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-6 py-4 shadow-sm"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={ease}>
          <motion.div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0"
            animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <MapPinIcon className="w-4 h-4 text-rose-500" />
          </motion.div>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Ziya – The Fashion Closet</span>{' '}
            · Operates across India, with support available Mon–Sat.
          </p>
        </motion.div>
      </section>

      {/* ══ QUICK LINKS ══ */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <motion.div className="flex items-center gap-2.5 mb-5"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={ease}>
          <motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
            <SparklesIcon className="w-4 h-4 text-rose-400" />
          </motion.div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Links</p>
        </motion.div>

        <motion.div className="grid sm:grid-cols-3 gap-3"
          variants={stagger(0.08, 0.06)} initial="hidden" whileInView="show"
          viewport={{ once: true, margin: '-40px' }}>
          {quickLinks.map(link => (
            <motion.div key={link.href} variants={fadeUp} transition={ease}>
              <Link href={link.href}>
                <motion.div
                  className="group flex items-center gap-4 rounded-2xl p-4 bg-white"
                  style={{ border: `1.5px solid ${link.border}`, boxShadow: `0 2px 10px ${link.bg}` }}
                  whileHover={{ scale: 1.02, y: -3, boxShadow: `0 6px 20px ${link.bg}` }}
                  whileTap={{ scale: 0.97 }} transition={spring}>
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: link.bg, border: `1.5px solid ${link.border}` }}
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }} transition={{ duration: 0.4 }}>
                    <link.Icon className="w-5 h-5" style={{ color: link.color }} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{link.label}</p>
                    <p className="text-slate-400 text-xs truncate">{link.sub}</p>
                  </div>
                  <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
