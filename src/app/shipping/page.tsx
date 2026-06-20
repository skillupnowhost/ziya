'use client';
import { useRef } from 'react';
import { motion, useInView, type Transition, type Variants } from 'framer-motion';
import {
  TruckIcon, ClockIcon, CubeIcon, EnvelopeIcon, PhoneIcon,
  CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon,
  ShieldExclamationIcon, MapPinIcon, BellAlertIcon,
  ChatBubbleLeftEllipsisIcon, SparklesIcon, BoltIcon,
  MoonIcon, GlobeAsiaAustraliaIcon,
} from '@heroicons/react/24/outline';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';

const spring: Transition = { type: 'spring', stiffness: 320, damping: 26 };
const ease: Transition   = { duration: 0.5, ease: 'easeOut' };
const fadeUp:    Variants = { hidden: { opacity: 0, y: 28  }, show: { opacity: 1, y: 0  } };
const fadeLeft:  Variants = { hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0  } };
const fadeRight: Variants = { hidden: { opacity: 0, x:  24 }, show: { opacity: 1, x: 0  } };
const scaleIn:   Variants = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } };
const stagger = (s = 0.1, d = 0.05): Variants => ({
  hidden: {}, show: { transition: { staggerChildren: s, delayChildren: d } },
});

const deliveryZones = [
  { zone: 'Tamil Nadu',                           time: '2 – 3 days',  color: '#f43f5e', bg: 'bg-rose-50',   border: 'border-rose-100',   dot: 'bg-rose-400'    },
  { zone: 'Karnataka, Andhra, Kerala, Telangana', time: '2 – 5 days',  color: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-100', dot: 'bg-violet-400'  },
  { zone: 'North India',                          time: '5 – 8 days',  color: '#3b82f6', bg: 'bg-blue-50',   border: 'border-blue-100',   dot: 'bg-blue-400'    },
  { zone: 'Remote Areas',                         time: '3 – 8 days',  color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-400'  },
];

const navItems = [
  { num: '01', label: 'Support',    Icon: ClockIcon,             color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',  ring: 'rgba(244,63,94,0.18)',
    anim: { animate: { rotate: [0, 360] },                                         transition: { duration: 6,   repeat: Infinity, ease: 'linear' } } },
  { num: '02', label: 'Processing', Icon: CubeIcon,              color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', ring: 'rgba(139,92,246,0.18)',
    anim: { animate: { rotateY: [0, 180, 360] },                                   transition: { duration: 4,   repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 } } },
  { num: '03', label: 'Delivery',   Icon: TruckIcon,             color: '#f97316', bg: 'rgba(249,115,22,0.08)', ring: 'rgba(249,115,22,0.18)',
    anim: { animate: { x: [0, 3, 0, -2, 0] },                                     transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 } } },
  { num: '04', label: 'Tracking',   Icon: BellAlertIcon,         color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', ring: 'rgba(59,130,246,0.18)',
    anim: { animate: { rotate: [0, -15, 15, -10, 10, 0] },                         transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 } } },
  { num: '05', label: 'Returns',    Icon: ArrowPathIcon,         color: '#ec4899', bg: 'rgba(236,72,153,0.08)', ring: 'rgba(236,72,153,0.18)',
    anim: { animate: { rotate: [0, 360] },                                         transition: { duration: 3,   repeat: Infinity, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } } },
  { num: '06', label: 'Damage',     Icon: ShieldExclamationIcon, color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  ring: 'rgba(239,68,68,0.18)',
    anim: { animate: { scale: [1, 1.18, 1], rotate: [0, -5, 5, 0] },              transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 } } },
  { num: '07', label: 'Zones',      Icon: MapPinIcon,            color: '#6366f1', bg: 'rgba(99,102,241,0.08)', ring: 'rgba(99,102,241,0.18)',
    anim: { animate: { y: [0, -3, 0] },                                            transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 } } },
];

function AnimatedDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-center gap-4 my-2">
      <motion.div className="flex-1 h-px bg-slate-100"
        initial={{ scaleX: 0, originX: '0%' }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
      <motion.div className="w-1.5 h-1.5 rounded-full bg-rose-300"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: 0.25, type: 'spring', stiffness: 500 }} />
      <motion.div className="flex-1 h-px bg-slate-100"
        initial={{ scaleX: 0, originX: '100%' }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

function SectionHeader({ num, Icon, color, bg, title }: {
  num: string; Icon: React.ElementType; color: string; bg: string; title: string;
}) {
  return (
    <motion.div variants={fadeLeft} transition={ease} className="flex items-center gap-3 mb-6">
      <motion.div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}
        whileHover={{ scale: 1.12, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </motion.div>
      <div>
        <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{num}</span>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">{title}</h2>
      </div>
    </motion.div>
  );
}

function InfoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
      transition={spring}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-50/50 via-violet-50/30 to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export default function ShippingPage() {
  const staggerParent = stagger();

  return (
    <div className="min-h-screen bg-slate-50 page-enter overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-[0.10]"
            style={{ background: 'radial-gradient(circle,#f97316,transparent 70%)' }}
            animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-[0.08]"
            style={{ background: 'radial-gradient(circle,#f43f5e,transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-7"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
            <motion.div animate={{ x: [0, 5, 0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <TruckIcon className="w-4 h-4 text-orange-500" />
            </motion.div>
            <span className="text-orange-600 text-xs font-bold tracking-[0.18em] uppercase">Shipping Policy</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 leading-[1.05]"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.1 }}>
            Fast, safe &amp;{' '}
            <motion.span
              className="bg-gradient-to-r from-orange-500 via-rose-500 to-violet-500 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
              animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
              transparent.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.2 }}>
            Everything about how we handle, pack, and deliver your Ziya orders — from click to doorstep.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-3"
            variants={stagger(0.09, 0.3)} initial="hidden" animate="show">
            {[
              { Icon: BoltIcon,        text: 'Same-day dispatch before 2 PM', color: 'text-orange-500' },
              { Icon: GlobeAsiaAustraliaIcon, text: 'Pan-India delivery',     color: 'text-blue-500'   },
              { Icon: CheckCircleIcon, text: 'WhatsApp & Email tracking',     color: 'text-emerald-500' },
            ].map(({ Icon, text, color }) => (
              <motion.div key={text} variants={scaleIn} transition={spring}
                className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 text-slate-600 text-sm shadow-sm"
                whileHover={{ scale: 1.04, y: -1 }}>
                <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                {text}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* ══ STICKY NAV ══ */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <div className="flex gap-0.5 sm:gap-1 overflow-x-auto hide-scrollbar py-2 sm:py-2.5 md:justify-center">
            {navItems.map((s, i) => (
              <motion.a key={s.num} href={`#section-${s.num}`}
                className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 group"
                style={{ color: '#94a3b8' }}
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400, damping: 25 }}
                whileHover={{
                  y: -2,
                  color: s.color,
                  backgroundColor: s.bg,
                  boxShadow: `0 4px 16px ${s.ring}`,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                whileTap={{
                  scale: 0.93,
                  color: s.color,
                  backgroundColor: s.bg,
                  boxShadow: `0 2px 12px ${s.ring}`,
                }}>
                <motion.div
                  className="flex-shrink-0"
                  animate={s.anim.animate}
                  transition={s.anim.transition as Transition}
                  whileHover={{ scale: 1.25, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 1.3, transition: { duration: 0.15 } }}>
                  <s.Icon className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                </motion.div>
                <span className="font-mono text-[9px] sm:text-[10px] opacity-40 group-hover:opacity-70 group-active:opacity-70 transition-opacity duration-300">{s.num}</span>
                {s.label}
                <motion.span
                  className="absolute bottom-0 left-1/2 h-[2px] rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }}
                  initial={{ width: 0, x: '-50%', opacity: 0 }}
                  whileHover={{ width: '70%', x: '-50%', opacity: 1 }}
                  whileTap={{ width: '60%', x: '-50%', opacity: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-4xl mx-auto px-4 py-14 space-y-16">

        {/* 01 · OFFICE HOURS & SUPPORT */}
        <motion.section id="section-01" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="01" Icon={ClockIcon} color="#f43f5e" bg="bg-rose-50" title="Office Hours & Customer Support" />

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.05 }} className="grid sm:grid-cols-2 gap-5">
            <InfoCard>
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <motion.div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center"
                    whileHover={{ rotate: 20 }} transition={spring}>
                    <ClockIcon className="w-4 h-4 text-rose-500" />
                  </motion.div>
                  <h3 className="font-bold text-slate-900">Working Hours</h3>
                </div>
                {[
                  { day: 'Monday – Friday', hours: '10:00 AM – 6:00 PM', open: true  },
                  { day: 'Saturday',        hours: '10:00 AM – 2:00 PM', open: true  },
                  { day: 'Sunday',          hours: 'Closed',              open: false },
                ].map((row, i) => (
                  <motion.div key={row.day}
                    className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                    initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08, ...ease }}>
                    <span className="text-sm text-slate-600 font-medium">{row.day}</span>
                    <motion.span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={row.open
                        ? { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }
                        : { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                      whileHover={{ scale: 1.06 }}>
                      {row.hours}
                    </motion.span>
                  </motion.div>
                ))}
                <motion.div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-3"
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.28, ...ease }}>
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    After-hours queries are addressed the next working day.
                  </p>
                </motion.div>
              </div>
            </InfoCard>

            <InfoCard>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Customer Support Contacts</h3>
                <div className="space-y-1.5">
                  {[
                    { href: 'tel:+919003828556',             Icon: PhoneIcon,    isFA: false, bg: 'bg-emerald-50', border: 'border-emerald-100', ic: 'text-emerald-600', label: 'Phone',    val: '+91 9003828556'        },
                    { href: 'https://wa.me/919003828556',     Icon: FaWhatsapp,   isFA: true,  bg: 'bg-green-50',   border: 'border-green-100',   ic: 'text-green-600',   label: 'WhatsApp', val: '+91 9003828556'        },
                    { href: 'mailto:ziyasupport@gmail.com',   Icon: EnvelopeIcon, isFA: false, bg: 'bg-rose-50',    border: 'border-rose-100',    ic: 'text-rose-500',    label: 'Email',    val: 'ziyasupport@gmail.com' },
                  ].map(({ href, Icon, isFA, bg, border, ic, label, val }, i) => (
                    <motion.a key={label} href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 rounded-xl p-3 -mx-1 group hover:bg-slate-50 transition-colors`}
                      initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.05 + i * 0.09, ...ease }}
                      whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
                      <motion.div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}
                        whileHover={{ scale: 1.12, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                        {isFA
                          ? <Icon className={`${ic} text-base`} />
                          : <Icon className={`w-4 h-4 ${ic}`} />}
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                        <p className="text-sm font-semibold text-slate-900 break-all">{val}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </InfoCard>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.15 }}
            className="mt-4 flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
            <motion.div whileHover={{ scale: 1.15 }} transition={spring} className="flex-shrink-0 mt-0.5">
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-emerald-600" />
            </motion.div>
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">For faster support,</span> reach out via{' '}
              <a href="https://wa.me/919003828556" target="_blank" rel="noopener noreferrer"
                className="text-emerald-700 font-semibold hover:underline underline-offset-2 transition-colors">
                WhatsApp (+91 9003828556)
              </a>{' '}or{' '}
              <a href="mailto:ziyasupport@gmail.com"
                className="text-rose-600 font-semibold hover:underline underline-offset-2 transition-colors">
                ziyasupport@gmail.com
              </a>.
            </p>
          </motion.div>
        </motion.section>

        <AnimatedDivider />

        {/* 02 · ORDER PROCESSING */}
        <motion.section id="section-02" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="02" Icon={CubeIcon} color="#8b5cf6" bg="bg-violet-50" title="Order Processing Time" />

          <motion.div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                variants: fadeLeft, Icon: BoltIcon, iconColor: '#8b5cf6',
                bg: 'bg-violet-50', border: 'border-violet-100',
                badge: 'bg-violet-100 text-violet-700', badgeLabel: 'Same-day dispatch',
                title: 'Orders before 2 PM',
                desc: 'Orders placed before 2:00 PM on working days are dispatched the',
                highlight: 'same day', highlightColor: 'text-violet-700',
              },
              {
                variants: fadeRight, Icon: MoonIcon, iconColor: '#f97316',
                bg: 'bg-orange-50', border: 'border-orange-100',
                badge: 'bg-orange-100 text-orange-700', badgeLabel: 'Next day dispatch',
                title: 'Orders after 2 PM / Weekends',
                desc: 'Orders placed after 2 PM or on weekends are dispatched the',
                highlight: 'next working day', highlightColor: 'text-orange-700',
              },
            ].map(card => (
              <motion.div key={card.title} variants={card.variants} transition={ease}>
                <InfoCard className={`${card.bg} border ${card.border}`}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0"
                        animate={{ rotate: [0, -5, 5, 0], y: [0, -3, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                        <card.Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                      </motion.div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${card.badge}`}>
                        {card.badgeLabel}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {card.desc}{' '}
                      <motion.span className={`font-black ${card.highlightColor}`}
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                        viewport={{ once: true }} transition={{ delay: 0.4 }}>
                        {card.highlight}
                      </motion.span>.
                    </p>
                  </div>
                </InfoCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.18 }}
            className="mt-4 flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
            <motion.div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0"
              animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <CubeIcon className="w-4 h-4 text-violet-600" />
            </motion.div>
            <p className="text-sm text-slate-700">
              All orders are dispatched within{' '}
              <span className="font-black text-violet-700">24 hours to 3 working days</span>{' '}
              from order placement.
            </p>
          </motion.div>
        </motion.section>

        <AnimatedDivider />

        {/* 03 · DELIVERY TIMELINES */}
        <motion.section id="section-03" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="03" Icon={TruckIcon} color="#f97316" bg="bg-orange-50" title="Delivery Timelines" />
          <motion.p variants={fadeUp} transition={ease} className="text-sm text-slate-500 -mt-2 mb-7">
            After dispatch, delivery time varies based on your location.
          </motion.p>

          <motion.div className="grid sm:grid-cols-2 gap-3" variants={stagger(0.08, 0.08)}>
            {deliveryZones.map(zone => (
              <motion.div key={zone.zone} variants={scaleIn} transition={spring}
                whileHover={{ scale: 1.02, y: -3 }}>
                <div className={`${zone.bg} border ${zone.border} rounded-2xl p-5 flex items-center justify-between gap-4 overflow-hidden relative`}>
                  <motion.div className="absolute inset-0 opacity-[0.03]"
                    style={{ background: `linear-gradient(90deg,${zone.color},transparent)` }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
                  <div className="relative flex items-center gap-3">
                    <motion.span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${zone.dot}`}
                      animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
                    <h3 className="font-bold text-slate-900 text-sm">{zone.zone}</h3>
                  </div>
                  <motion.span className="relative text-xs font-black px-3 py-1.5 rounded-full text-white whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg,${zone.color},${zone.color}cc)` }}
                    whileHover={{ scale: 1.08 }} transition={spring}>
                    {zone.time}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.32 }}
            className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
            </motion.div>
            <p className="text-sm text-slate-700">
              <span className="font-bold text-amber-700">Note:</span>{' '}
              Timelines are estimates and may vary during festive periods, weather disruptions, or limited courier access areas.
            </p>
          </motion.div>
        </motion.section>

        <AnimatedDivider />

        {/* 04 · TRACKING & UPDATES */}
        <motion.section id="section-04" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="04" Icon={BellAlertIcon} color="#3b82f6" bg="bg-blue-50" title="Order Tracking & Updates" />

          <motion.div className="grid sm:grid-cols-2 gap-4" variants={stagger(0.1, 0.06)}>
            {[
              {
                Icon: FaWhatsapp, isFA: true,
                title: 'WhatsApp Tracking',
                desc: 'Once dispatched, you will receive the tracking ID directly on your WhatsApp number.',
                color: '#25D366', bg: 'bg-green-50', border: 'border-green-100',
              },
              {
                Icon: EnvelopeIcon, isFA: false,
                title: 'Email Tracking',
                desc: 'A dispatch confirmation with full tracking details is sent to your registered email.',
                color: '#f43f5e', bg: 'bg-rose-50', border: 'border-rose-100',
              },
            ].map(item => (
              <motion.div key={item.title} variants={scaleIn} transition={spring}>
                <InfoCard className={`${item.bg} border ${item.border}`}>
                  <div className="p-6 flex items-start gap-4">
                    <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                      style={{ background: `linear-gradient(135deg,${item.color},${item.color}bb)` }}
                      whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                      {item.isFA
                        ? <item.Icon className="text-xl" />
                        : <item.Icon className="w-5 h-5" />}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </InfoCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.22 }}
            className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              <ClockIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
            </motion.div>
            <p className="text-sm text-slate-700">
              Tracking details update within <span className="font-bold text-blue-700">24 hours</span> of dispatch.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.28 }}
            className="mt-3 flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
            whileHover={{ x: 4 }}>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <TruckIcon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            </motion.div>
            <p className="text-sm text-slate-600">
              Track your order live →{' '}
              <Link href="/track-order" className="text-rose-500 font-semibold hover:text-rose-600 underline underline-offset-2 transition-colors">
                Track Order
              </Link>
            </p>
          </motion.div>
        </motion.section>

        <AnimatedDivider />

        {/* 05 · RETURNS & EXCHANGE */}
        <motion.section id="section-05" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="05" Icon={ArrowPathIcon} color="#ec4899" bg="bg-pink-50" title="Return and Exchange Policy" />

          <motion.div variants={scaleIn} transition={{ ...spring, delay: 0.05 }}>
            <div className="relative overflow-hidden rounded-2xl p-7 text-white"
              style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899,#f43f5e)' }}>
              <motion.div className="absolute bottom-0 left-0 w-full h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)' }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
              <div className="flex items-start gap-5">
                <motion.div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0"
                  animate={{ rotate: [0, 180, 360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                  <ArrowPathIcon className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-black text-2xl mb-2">No Returns or Exchanges</h3>
                  <p className="text-rose-100 text-sm leading-relaxed">
                    We do not accept returns. In case of any damage, share an{' '}
                    <span className="font-bold text-white underline underline-offset-2">unboxing video</span>{' '}
                    with our WhatsApp or email. Once received, the necessary action will be taken promptly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.1 }} className="mt-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
              If a shipment is returned due to:
            </h3>
            <motion.div className="space-y-2.5" variants={stagger(0.07, 0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {['Incorrect address or phone number', 'Customer unavailability', 'Delivery attempt failed multiple times'].map((reason, i) => (
                <motion.div key={reason} variants={fadeLeft} transition={ease}
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3.5 shadow-sm"
                  whileHover={{ x: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <motion.span className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.2 }} transition={spring}>{i + 1}</motion.span>
                  <p className="text-sm text-slate-700">{reason}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ ...ease, delay: 0.24 }}
            className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-sm text-slate-700 leading-relaxed">
              We cover the <span className="font-bold text-amber-700">return shipping cost</span>{' '}
              back to our warehouse. However, if you want the order re-shipped,{' '}
              <span className="font-bold text-amber-700">re-shipping charges are paid by the customer</span>.
            </p>
          </motion.div>
        </motion.section>

        <AnimatedDivider />

        {/* 06 · DAMAGED / LOST */}
        <motion.section id="section-06" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="06" Icon={ShieldExclamationIcon} color="#ef4444" bg="bg-red-50" title="Damaged or Lost Shipment Policy" />
          <motion.p variants={fadeUp} transition={ease} className="text-sm text-slate-500 -mt-2 mb-7">
            If your order arrives damaged or does not arrive at all.
          </motion.p>

          <motion.div className="grid sm:grid-cols-2 gap-4" variants={stagger(0.1, 0.06)}>
            {[
              {
                emoji: '📦', title: 'Damaged Shipment',
                color: '#ef4444', bg: 'bg-red-50', border: 'border-red-100',
                points: ['Report within 24 hours of delivery.', 'Send photos and order details to ziyasupport@gmail.com.', 'Action will be taken promptly after review.'],
                cta: { label: 'Email Us', href: 'mailto:ziyasupport@gmail.com', ext: false },
              },
              {
                emoji: '🔍', title: 'Lost Shipment',
                color: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-100',
                points: ['Refunds cannot be provided for lost parcels.', 'We will ensure a replacement is sent to you.', 'Contact us with your order ID to raise a claim.'],
                cta: { label: 'WhatsApp Us', href: 'https://wa.me/919003828556', ext: true },
              },
            ].map(item => (
              <motion.div key={item.title} variants={scaleIn} transition={spring}>
                <InfoCard className={`${item.bg} border ${item.border} h-full`}>
                  <div className="p-6 flex flex-col h-full">
                    <motion.div className="text-4xl mb-4 inline-block"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                      {item.emoji}
                    </motion.div>
                    <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
                    <ul className="space-y-2 flex-1 mb-5">
                      {item.points.map((pt, j) => (
                        <motion.li key={j} className="flex items-start gap-2.5 text-sm text-slate-600"
                          initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ delay: 0.1 + j * 0.07, ...ease }}>
                          <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                            style={{ background: item.color }}
                            animate={{ scale: [1, 1.7, 1] }} transition={{ duration: 2.2, repeat: Infinity, delay: j * 0.3 }} />
                          {pt}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.a href={item.cta.href}
                      target={item.cta.ext ? '_blank' : undefined} rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl text-white self-start"
                      style={{ background: `linear-gradient(135deg,${item.color},${item.color}cc)` }}
                      whileHover={{ scale: 1.05, x: 3 }} whileTap={{ scale: 0.96 }} transition={spring}>
                      {item.cta.label} →
                    </motion.a>
                  </div>
                </InfoCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <AnimatedDivider />

        {/* 07 · SPECIAL ZONES */}
        <motion.section id="section-07" variants={staggerParent}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SectionHeader num="07" Icon={MapPinIcon} color="#6366f1" bg="bg-indigo-50" title="Special or Restricted Zones" />
          <motion.p variants={fadeUp} transition={ease} className="text-sm text-slate-500 -mt-2 mb-7">
            For orders to J&amp;K, North East India, Andaman &amp; Nicobar, and other remote areas:
          </motion.p>

          <motion.div className="grid sm:grid-cols-3 gap-4" variants={stagger(0.08, 0.06)}>
            {[
              { Icon: ClockIcon,             title: 'Longer Delivery',  desc: 'Typically 7 to 14 business days for delivery to these regions.', color: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-100' },
              { Icon: ExclamationTriangleIcon, title: 'Coverage Limits', desc: 'Some couriers may not service all pincodes in these zones.',      color: '#f59e0b', bg: 'bg-amber-50',  border: 'border-amber-100'  },
              { Icon: CubeIcon,              title: 'ODA Charges',      desc: 'Additional handling charges may apply for Out of Delivery Area (ODA) pincodes.', color: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-100' },
            ].map(item => (
              <motion.div key={item.title} variants={scaleIn} transition={spring}
                whileHover={{ scale: 1.04, y: -4 }}>
                <div className={`${item.bg} border ${item.border} rounded-2xl p-5`}>
                  <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${item.color}18` }}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.45 }}>
                    <item.Icon className="w-5 h-5" style={{ color: item.color }} />
                  </motion.div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ══ BOTTOM CTA ══ */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          style={{ background: 'linear-gradient(135deg,#f97316 0%,#f43f5e 50%,#a855f7 100%)' }}
          initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: 'rgba(255,255,255,0.4)' }}
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-15"
              style={{ background: 'rgba(255,255,255,0.35)' }}
              animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
          </div>
          <div className="relative px-8 py-12 sm:py-14 text-center">
            <motion.div className="inline-flex mb-5"
              animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
              <SparklesIcon className="w-7 h-7 text-white/80" />
            </motion.div>
            <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-2">Still have questions?</p>
            <h3 className="text-white font-black text-2xl sm:text-3xl mb-8">We&apos;re happy to help.</h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {[
                { label: 'WhatsApp Us', href: 'https://wa.me/919003828556', bg: '#ffffff', color: '#16a34a', Icon: FaWhatsapp, isFA: true, ext: true },
                { label: 'Email Us',    href: 'mailto:ziyasupport@gmail.com', bg: 'rgba(255,255,255,0.15)', color: '#ffffff', Icon: EnvelopeIcon, isFA: false, ext: false },
              ].map(btn => (
                <motion.a key={btn.label} href={btn.href}
                  target={btn.ext ? '_blank' : undefined} rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm border border-white/20"
                  style={{ background: btn.bg, color: btn.color }}
                  whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }} transition={spring}>
                  {btn.isFA ? <btn.Icon className="text-lg" /> : <btn.Icon className="w-4 h-4" />}
                  {btn.label}
                </motion.a>
              ))}
              <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }} transition={spring}>
                <Link href="/faq"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-sm transition-colors">
                  Browse FAQ
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
