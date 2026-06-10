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
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
const badgeAnimations = [
  // 🌸 Korean Style — petal spin + bloom
  {
    animate: { rotate: [0, 15, -10, 20, 0, -15, 10, 0], scale: [1, 1.18, 0.95, 1.22, 1, 0.92, 1.15, 1] },
    transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 },
  },
  // ✨ New Arrivals — multi-directional sparkle burst
  {
    animate: { rotate: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360], scale: [1, 1.2, 0.9, 1.25, 0.95, 1.15, 0.9, 1.2, 1, 1.1, 0.95, 1.1, 1] },
    transition: { duration: 5, repeat: Infinity, ease: 'linear' },
  },
  // 💝 Members Only — realistic double heartbeat (lub-dub)
  {
    animate: { scale: [1, 1.3, 1, 1.22, 1, 1, 1, 1], y: [0, -3, 0, -2, 0, 0, 0, 0] },
    transition: { duration: 2.2, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 0.8 },
  },
  // 🎀 Exclusive Deals — ribbon twist: rotate + elastic bounce
  {
    animate: { rotate: [0, -18, 18, -12, 12, -6, 6, 0], scale: [1, 0.92, 1.08, 0.95, 1.05, 0.98, 1.02, 1] },
    transition: { duration: 3, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1.5 },
  },
];

const floatingBadges = [
  { emoji: '🌸', label: 'Korean Style'    },
  { emoji: '✨', label: 'New Arrivals'    },
  { emoji: '💝', label: 'Members Only'   },
  { emoji: '🎀', label: 'Exclusive Deals' },
];

const features = [
  { icon: '🛍️', text: 'Early access to new collections' },
  { icon: '💌', text: 'Exclusive member discounts' },
  { icon: '🚚', text: 'Priority shipping & returns' },
];

/* ─── Per-feature icon animations ─── */
const featureIconAnimations = [
  // 🛍️ — shopping bag pendulum swing
  {
    animate: { rotate: [-10, 10, -10], y: [0, -3, 0] },
    transition: { duration: 2.2, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1.5 },
    glow: 'shadow-[0_0_14px_rgba(251,113,133,0.55)]',
  },
  // 💌 — envelope heartbeat float
  {
    animate: { scale: [1, 1.22, 1, 1.15, 1], y: [0, -4, 0, -2, 0] },
    transition: { duration: 2.0, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1], repeatDelay: 1.8 },
    glow: 'shadow-[0_0_14px_rgba(249,168,212,0.55)]',
  },
  // 🚚 — truck drives right then snaps back
  {
    animate: { x: [0, 6, 3, 8, 0], rotate: [0, 2, -1, 2, 0] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 },
    glow: 'shadow-[0_0_14px_rgba(52,211,153,0.45)]',
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
  focused: externalFocused,
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
  focused?: boolean;
  onFocusChange?: (v: boolean) => void;
  suffix?: React.ReactNode;
  required?: boolean;
  delay?: number;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  const handleFocus = () => {
    setFocused(true);
    onFocusChange?.(true);
  };
  const handleBlur = () => {
    setFocused(false);
    onFocusChange?.(false);
  };

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
            : isActive
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

        {/* Icon */}
        <motion.span
          className="absolute left-4 flex"
          animate={{
            color: isActive ? 'rgb(251,113,133)' : 'rgb(209,213,219)',
            scale: isActive ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 440, damping: 22 }}
        >
          {iconVariant === 'email' ? (
            <AnimatedEnvelopeIcon focused={focused} active={isActive} />
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
            ${isActive
              ? 'top-[7px] text-[10px] tracking-[0.07em] uppercase'
              : 'top-1/2 -translate-y-1/2 text-[13px] tracking-normal'
            }
            ${focused ? 'text-rose-400' : isActive ? 'text-rose-300' : 'text-gray-400'}`}
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

function LoginContent() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌸');
      router.push(redirect);
    } catch {
      toast.error('Invalid email or password');
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
          <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-rose-600/25 rounded-full blur-[90px]" />
          <div className="absolute bottom-[-5%] right-[-10%] w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-900/30 rounded-full blur-[120px]" />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none auth-dot-grid" />

        {/* Center content */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-rose-300" />
            <span className="text-rose-300 text-xs font-bold tracking-[0.25em] uppercase">Members Area</span>
          </div>
          <h2 className="text-white font-serif text-4xl xl:text-5xl font-bold leading-[1.15] mb-5">
            Your style,<br />
            <span className="auth-shimmer-text">
              curated for you.
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            Sign in to unlock your personal Ziya experience — wishlist, order history, exclusive drops and more.
          </p>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 group/feat cursor-default"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.52 + i * 0.1, duration: 0.45 }}
                whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
              >
                {/* Icon circle — glows and animates on hover + continuously */}
                <motion.div
                  className={`w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-base flex-shrink-0 border border-white/10 group-hover/feat:border-rose-400/40 group-hover/feat:bg-white/18 transition-colors duration-300 ${featureIconAnimations[i].glow}`}
                  whileHover={{ scale: 1.18 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={featureIconAnimations[i].animate}
                    transition={{ ...featureIconAnimations[i].transition, delay: 1.0 + i * 0.4 }}
                  >
                    {f.icon}
                  </motion.span>
                </motion.div>
                <div className="flex-1">
                  <span className="text-gray-300 text-sm group-hover/feat:text-white transition-colors duration-200">{f.text}</span>
                  <div className="h-px bg-gradient-to-r from-rose-400/60 to-transparent mt-0.5 origin-left scale-x-0 group-hover/feat:scale-x-100 transition-transform duration-300" />
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
          transition={{ delay: 0.85, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {floatingBadges.map((b, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-rose-400/25 rounded-2xl px-3.5 py-3 backdrop-blur-sm transition-colors duration-300 cursor-default"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.07, duration: 0.4 }}
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

        {/* Bottom tagline */}
        <motion.p
          className="text-xs text-gray-600 relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          © 2026 Ziya — the Fashion Closet
        </motion.p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center px-6 sm:px-10 pt-7 pb-28 sm:pt-10 sm:pb-10 lg:py-12 bg-[#fafafa] relative overflow-hidden">

        {/* Background orbs */}
        <div className="absolute top-[-10%] right-[-8%] w-[400px] h-[400px] bg-rose-100/50 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[-8%] left-[-6%] w-[340px] h-[340px] bg-pink-100/40 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[260px] bg-rose-50/35 rounded-full blur-[130px] pointer-events-none" />

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
          <div className="mb-8">
            {/* Trust badge */}
            <motion.div
              className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-4"
              initial={{ opacity: 0, scale: 0.72, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <motion.span
                className="text-xs"
                animate={{ rotate: [0, -15, 10, -5, 0] }}
                transition={{ delay: 0.6, duration: 0.9, ease: 'easeInOut' }}
              >
                🔒
              </motion.span>
              <span className="text-emerald-600 text-[11px] font-semibold tracking-wide">Secure &amp; encrypted login</span>
            </motion.div>

            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-1.5"
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="text-gray-400 text-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.19, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              Sign in to continue shopping with Ziya
            </motion.p>
          </div>

          {/* Card */}
          <div className="relative group/card">
            {/* Hover glow ring */}
            <div className="absolute -inset-[1.5px] rounded-[26px] bg-gradient-to-br from-rose-200/70 via-transparent to-pink-200/70 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <motion.div
              className="relative bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] p-7 sm:p-8"
              initial={{ opacity: 0, y: 26, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.58, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="login-email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                autoComplete="email"
                placeholder="Email address"
                iconVariant="email"
                required
                delay={0.15}
              />

              <InputField
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                placeholder="Password"
                icon={LockClosedIcon}
                required
                delay={0.22}
                autoComplete="current-password"
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
                        <motion.span key="hide" initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 20 }} transition={{ duration: 0.2 }}>
                          <EyeSlashIcon className="w-4 h-4" />
                        </motion.span>
                      ) : (
                        <motion.span key="show" initial={{ opacity: 0, rotate: 20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -20 }} transition={{ duration: 0.2 }}>
                          <EyeIcon className="w-4 h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                }
              />

              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/auth/forgot-password" className="text-xs text-rose-400 hover:text-rose-500 font-medium transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="auth-submit-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm tracking-wide disabled:opacity-55 disabled:cursor-not-allowed overflow-hidden relative"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.4 }}
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
                      Signing in...
                    </motion.span>
                  ) : (
                    <motion.span key="idle" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Sign In
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
            transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                href={`/auth/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                className="text-rose-400 font-semibold hover:text-rose-500 transition-colors"
              >
                Create one free →
              </Link>
            </p>
            <motion.div
              className="flex items-center justify-center gap-4 py-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
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
              By continuing, you agree to our{' '}
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

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
