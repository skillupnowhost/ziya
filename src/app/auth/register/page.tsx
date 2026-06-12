'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from 'framer-motion';

/* ─── Animated envelope icon — flap morphs open on focus ─── */
function AnimatedEnvelopeIcon({ focused, active }: { focused: boolean; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 overflow-visible"
    >
      {/* Envelope body */}
      <rect x="2" y="6" width="20" height="14" rx="2" />
      {/* Flap — morphs from V-down (closed) to V-up (open) on focus */}
      <motion.path
        animate={{
          d: focused
            ? 'M2 6 L12 2 L22 6'
            : active
              ? 'M2 7 L12 12 L22 7'
              : 'M2 8 L12 14 L22 8',
        }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Sparkle that pops out when opened */}
      <AnimatePresence>
        {focused && (
          <motion.g
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -3 }}
            exit={{ opacity: 0, scale: 0, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <circle cx="12" cy="3" r="1" fill="currentColor" opacity={0.6} />
            <circle cx="9" cy="2" r="0.5" fill="currentColor" opacity={0.4} />
            <circle cx="15" cy="2" r="0.5" fill="currentColor" opacity={0.4} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── Bottom-left badge unique animation variants ─── */
const badgeAnimations: Array<{ animate: TargetAndTransition; transition: Transition }> = [
  // 🌸 Join Ziya — petal spin + bloom
  {
    animate: { rotate: [0, 15, -10, 20, 0, -15, 10, 0], scale: [1, 1.18, 0.95, 1.22, 1, 0.92, 1.15, 1] },
    transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 },
  },
  // 🎁 Welcome Gift — bounce + "open" scale pop
  {
    animate: { y: [0, -6, 0, -3, 0], scale: [1, 1.15, 0.9, 1.2, 1], rotate: [0, -5, 5, -3, 0] },
    transition: { duration: 2.8, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1.2 },
  },
  // 💎 VIP Access — diamond rotation + shimmer glow pulse
  {
    animate: { rotate: [0, 10, -10, 15, -5, 0], scale: [1, 1.2, 0.95, 1.25, 0.98, 1], opacity: [0.85, 1, 0.9, 1, 0.88, 0.85] },
    transition: { duration: 3.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], repeatDelay: 0.8 },
  },
  // 🛍️ Shop Smarter — bag swing animation
  {
    animate: { rotate: [-12, 0, 12, 0, -12], y: [0, -4, 0, -4, 0], scale: [0.95, 1.05, 0.95, 1.05, 0.95] },
    transition: { duration: 2.0, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1 },
  },
];

const floatingBadges = [
  { emoji: '🌸', label: 'Join Ziya'    },
  { emoji: '🎁', label: 'Welcome Gift' },
  { emoji: '💎', label: 'VIP Access'   },
  { emoji: '🛍️', label: 'Shop Smarter' },
];

const perks = [
  { icon: '🎀', text: 'Welcome 10% off your first order' },
  { icon: '📦', text: 'Free shipping on orders over ₹999' },
  { icon: '💌', text: 'Early access to limited collections' },
  { icon: '⭐', text: 'Earn reward points on every purchase' },
];

/* ─── Per-perk icon animations ─── */
const perkIconAnimations: Array<{ animate: TargetAndTransition; transition: Transition; glow: string }> = [
  // 🎀 — ribbon elastic twist
  {
    animate: { rotate: [0, -18, 18, -10, 10, 0], scale: [1, 0.92, 1.08, 0.95, 1.05, 1] },
    transition: { duration: 2.8, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1.6 },
    glow: 'shadow-[0_0_14px_rgba(244,114,182,0.55)]',
  },
  // 📦 — box bounce + "drop" feel
  {
    animate: { y: [0, -5, 1, -3, 0], scale: [1, 0.95, 1.08, 0.98, 1] },
    transition: { duration: 2.0, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 2 },
    glow: 'shadow-[0_0_14px_rgba(251,191,36,0.45)]',
  },
  // 💌 — envelope heartbeat float
  {
    animate: { scale: [1, 1.22, 1, 1.15, 1], y: [0, -4, 0, -2, 0] },
    transition: { duration: 2.0, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1.8 },
    glow: 'shadow-[0_0_14px_rgba(249,168,212,0.55)]',
  },
  // ⭐ — star twinkle: scale + opacity flicker + slight spin
  {
    animate: { scale: [1, 1.3, 0.9, 1.2, 1], opacity: [0.8, 1, 0.7, 1, 0.8], rotate: [0, 20, -10, 15, 0] },
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 },
    glow: 'shadow-[0_0_14px_rgba(251,211,36,0.55)]',
  },
];

function InputField({
  id,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  iconVariant,
  onFocusChange,
  suffix,
  required,
  delay,
  autoComplete,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: React.ElementType;
  iconVariant?: 'email';
  onFocusChange?: (v: boolean) => void;
  suffix?: React.ReactNode;
  required?: boolean;
  delay?: number;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const handleFocus = () => { setFocused(true); onFocusChange?.(true); };
  const handleBlur = () => { setFocused(false); onFocusChange?.(false); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.93, filter: 'blur(7px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, delay: delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.div
        animate={{ scale: focused ? 1.018 : 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        className={`relative flex items-center rounded-2xl border transition-colors duration-300 overflow-hidden
          ${focused
            ? 'border-rose-400 bg-rose-50/30 shadow-[0_0_0_3.5px_rgba(251,113,133,0.16),inset_0_1px_3px_rgba(251,113,133,0.05)]'
            : active
              ? 'border-rose-300/55 bg-white'
              : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/15'
          }`}
      >
        {/* Shimmer sweep on each focus */}
        <AnimatePresence>
          {focused && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            >
              <motion.div
                className="auth-input-shimmer absolute inset-y-0 w-1/2"
                initial={{ left: '-52%' }}
                animate={{ left: '152%' }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon — spring scale + color, email gets animated envelope */}
        <motion.span
          className="absolute left-4 flex"
          animate={{
            color: active ? 'rgb(251,113,133)' : 'rgb(209,213,219)',
            scale: active ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 440, damping: 22 }}
        >
          {iconVariant === 'email' ? (
            <AnimatedEnvelopeIcon focused={focused} active={active} />
          ) : Icon ? (
            <Icon className="w-4 h-4" />
          ) : null}
        </motion.span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          placeholder=""
          {...(autoComplete ? { autoComplete } : {})}
          className="w-full pt-5 pb-2 pl-11 pr-11 text-sm text-gray-800 bg-transparent focus:outline-none"
        />

        <label
          htmlFor={id}
          className={`absolute left-11 pointer-events-none font-medium
            transition-[top,font-size,color,letter-spacing] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            ${active
              ? 'top-[7px] text-[10px] tracking-[0.07em] uppercase'
              : 'top-1/2 -translate-y-1/2 text-[13px] tracking-normal'
            }
            ${focused ? 'text-rose-400' : active ? 'text-rose-300' : 'text-gray-400'}`}
        >
          {placeholder}
        </label>

        {suffix && <div className="absolute right-3.5">{suffix}</div>}

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-300 via-rose-400 to-pink-400 origin-center"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={focused ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ chars', pass: password.length >= 6 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="pt-2 space-y-1.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="flex-1 h-1 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            >
              <div
                className={`h-full w-full rounded-full transition-colors duration-300 ${
                  i < score
                    ? score === 1 ? 'bg-red-400' : score === 2 ? 'bg-amber-400' : 'bg-emerald-400'
                    : 'bg-gray-200'
                }`}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3">
          {checks.map((c) => (
            <div key={c.label} className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${c.pass ? 'text-emerald-500' : 'text-gray-400'}`}>
              <CheckIcon className={`w-2.5 h-2.5 ${c.pass ? 'opacity-100' : 'opacity-30'}`} />
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RegisterContent() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to Ziya! 🌸');
      router.push(redirect);
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <motion.div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col justify-between p-10 auth-brand-panel"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-8%] right-[-8%] w-80 h-80 bg-rose-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[5%] left-[-8%] w-72 h-72 bg-pink-600/20 rounded-full blur-[90px]" />
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-rose-900/25 rounded-full blur-[120px]" />
        </div>

        <div className="absolute inset-0 opacity-[0.05] pointer-events-none auth-dot-grid" />

        {/* Center content */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-rose-300" />
            <span className="text-rose-300 text-xs font-bold tracking-[0.25em] uppercase">Join Ziya</span>
          </div>
          <h2 className="text-white font-serif text-4xl xl:text-5xl font-bold leading-[1.15] mb-5">
            Discover your<br />
            <span className="auth-shimmer-text">K-fashion story.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            Join thousands of Korean fashion lovers who shop smarter. Create your account and unlock exclusive member perks today.
          </p>

          <div className="space-y-3">
            {perks.map((p, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 group/perk cursor-default"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.52 + i * 0.1, duration: 0.45 }}
                whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
              >
                {/* Icon circle — glows + continuous unique animation */}
                <motion.div
                  className={`w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-sm flex-shrink-0 border border-white/10 group-hover/perk:border-rose-400/40 group-hover/perk:bg-white/18 transition-colors duration-300 ${perkIconAnimations[i].glow}`}
                  whileHover={{ scale: 1.18 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={perkIconAnimations[i].animate}
                    transition={{ ...perkIconAnimations[i].transition, delay: 1.0 + i * 0.4 }}
                  >
                    {p.icon}
                  </motion.span>
                </motion.div>
                <div className="flex-1">
                  <span className="text-gray-300 text-sm group-hover/perk:text-white transition-colors duration-200">{p.text}</span>
                  <div className="h-px bg-gradient-to-r from-rose-400/60 to-transparent mt-0.5 origin-left scale-x-0 group-hover/perk:scale-x-100 transition-transform duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature badges grid — unique animation per badge */}
        <motion.div
          className="relative z-20 grid grid-cols-2 gap-2.5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {floatingBadges.map((b, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-rose-400/25 rounded-2xl px-3.5 py-3 backdrop-blur-sm transition-colors duration-300 cursor-default"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.07, duration: 0.4 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(251,113,133,0.35)' }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base flex-shrink-0 overflow-hidden">
                <motion.span
                  animate={badgeAnimations[i].animate}
                  transition={{ ...badgeAnimations[i].transition, delay: 1.2 + i * 0.3 }}
                  className="inline-block"
                >
                  {b.emoji}
                </motion.span>
              </span>
              <span className="text-white/65 text-[11px] font-semibold leading-tight">{b.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-xs text-gray-600 relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          © 2026 Ziya — the Fashion Closet
        </motion.p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center px-6 sm:px-10 pt-7 pb-28 sm:pt-10 sm:pb-10 lg:py-12 bg-[#fafafa] relative overflow-hidden">

        {/* Background orbs */}
        <div className="absolute top-[-12%] right-[-10%] w-[420px] h-[420px] bg-rose-100/55 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-8%] w-[360px] h-[360px] bg-pink-100/45 rounded-full blur-[95px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[280px] bg-rose-50/40 rounded-full blur-[130px] pointer-events-none" />

        {/* Dot grid */}
        <div className="auth-form-dot-grid absolute inset-0 pointer-events-none opacity-[0.32]" />

        {/* Mobile logo */}
        <motion.div
          className="lg:hidden mb-8 text-center relative z-10"
          initial={{ opacity: 0, y: -18, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Link href="/">
            <Image src="/ziya-logo.png" alt="Ziya" width={130} height={48} className="h-11 w-auto object-contain mx-auto" priority />
          </Link>
        </motion.div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Header */}
          <div className="mb-7">
            <motion.div
              className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-full px-3 py-1 mb-4"
              initial={{ opacity: 0, scale: 0.72, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <motion.span
                className="text-xs"
                animate={{ rotate: [0, 18, -12, 6, 0] }}
                transition={{ delay: 0.65, duration: 0.9, ease: 'easeInOut' }}
              >
                🌸
              </motion.span>
              <span className="text-rose-500 text-[11px] font-semibold tracking-wide">Join · No card needed</span>
            </motion.div>

            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-1.5"
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              Create account
            </motion.h1>
            <motion.p
              className="text-gray-400 text-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.19, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              Join Ziya and start your Korean fashion journey
            </motion.p>
          </div>

          {/* Card */}
          <div className="relative group/card">
            <div className="absolute -inset-[1.5px] rounded-[26px] bg-gradient-to-br from-rose-200/70 via-transparent to-pink-200/70 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <motion.div
              className="relative bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] p-7 sm:p-8"
              initial={{ opacity: 0, y: 26, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.58, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Full name"
                icon={UserIcon}
                required
                delay={0.14}
                autoComplete="name"
              />

              <InputField
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="Email address"
                iconVariant="email"
                required
                delay={0.2}
                autoComplete="email"
              />

              <div>
                <InputField
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  placeholder="Password"
                  icon={LockClosedIcon}
                  required
                  delay={0.26}
                  autoComplete="new-password"
                  suffix={
                    <motion.button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-gray-300 hover:text-rose-400 transition-colors p-1"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait">
                        {showPass ? (
                          <motion.span key="hide" initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <EyeSlashIcon className="w-4 h-4" />
                          </motion.span>
                        ) : (
                          <motion.span key="show" initial={{ opacity: 0, rotate: 20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <EyeIcon className="w-4 h-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  }
                />
                <AnimatePresence>
                  {form.password && <PasswordStrength password={form.password} />}
                </AnimatePresence>
              </div>

              <div className="relative">
                <InputField
                  id="reg-confirm-password"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(v) => setForm({ ...form, confirmPassword: v })}
                  placeholder="Confirm password"
                  icon={LockClosedIcon}
                  required
                  delay={0.32}
                  autoComplete="new-password"
                  suffix={
                    <div className="flex items-center gap-1">
                      <AnimatePresence>
                        {passwordsMatch && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400 }}>
                            <CheckIcon className="w-4 h-4 text-emerald-400" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="text-gray-300 hover:text-rose-400 transition-colors p-1"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <AnimatePresence mode="wait">
                          {showConfirmPass ? (
                            <motion.span key="hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                              <EyeSlashIcon className="w-4 h-4" />
                            </motion.span>
                          ) : (
                            <motion.span key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                              <EyeIcon className="w-4 h-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  }
                />
                <AnimatePresence>
                  {passwordsMismatch && (
                    <motion.p
                      className="text-xs text-red-400 mt-1.5 ml-1"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      Passwords don&apos;t match
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={loading || passwordsMismatch}
                className="auth-submit-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm tracking-wide disabled:opacity-55 disabled:cursor-not-allowed overflow-hidden relative mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4 }}
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 8px 24px rgba(253,164,175,0.45)' }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </motion.span>
                  ) : (
                    <motion.span key="idle" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Create Account
                      <motion.span whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <ArrowRightIcon className="w-4 h-4" />
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
            </motion.div>
          </div>

          {/* Footer links */}
          <motion.div
            className="mt-6 text-center space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href={`/auth/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                className="text-rose-400 font-semibold hover:text-rose-500 transition-colors"
              >
                Sign in →
              </Link>
            </p>
            <motion.div
              className="flex items-center justify-center gap-4 py-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.72, duration: 0.4 }}
            >
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>🔒</span>SSL Secured
              </span>
              <span className="w-px h-3 bg-gray-200" />
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>🛡️</span>Privacy Protected
              </span>
            </motion.div>
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-rose-400 hover:underline">Terms</Link>
              {' & '}
              <Link href="/privacy" className="text-rose-400 hover:underline">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="animate-spin w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-rose-400 text-sm font-medium">Loading...</span>
        </motion.div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
