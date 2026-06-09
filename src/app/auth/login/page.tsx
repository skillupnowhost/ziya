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
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const floatingBadges = [
  { emoji: '🌸', label: 'Korean Style', top: '14%', left: '8%', delay: 0.6 },
  { emoji: '✨', label: 'New Arrivals', top: '68%', left: '5%', delay: 0.9 },
  { emoji: '💝', label: 'Members Only', top: '38%', right: '6%', delay: 0.75 },
  { emoji: '🎀', label: 'Exclusive Deals', top: '80%', right: '8%', delay: 1.0 },
];

const features = [
  { icon: '🛍️', text: 'Early access to new collections' },
  { icon: '💌', text: 'Exclusive member discounts' },
  { icon: '🚚', text: 'Priority shipping & returns' },
];

function InputField({
  id,
  type,
  value,
  onChange,
  label,
  placeholder,
  icon: Icon,
  suffix,
  required,
  delay,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  suffix?: React.ReactNode;
  required?: boolean;
  delay?: number;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div
        className={`relative flex items-center rounded-2xl border transition-all duration-300 overflow-hidden
          ${active
            ? 'border-rose-400 shadow-[0_0_0_3px_rgba(251,113,133,0.15)]'
            : 'border-gray-200 hover:border-gray-300'
          } bg-white`}
      >
        <span className={`absolute left-4 transition-colors duration-200 ${active ? 'text-rose-400' : 'text-gray-300'}`}>
          <Icon className="w-4 h-4" />
        </span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          placeholder=""
          className="w-full pt-5 pb-2 pl-11 pr-11 text-sm text-gray-800 bg-transparent focus:outline-none peer"
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
        />

        <label
          htmlFor={id}
          className={`absolute left-11 pointer-events-none transition-all duration-200 font-medium
            ${active
              ? 'top-[7px] text-[10px] text-rose-400 tracking-wider uppercase'
              : 'top-1/2 -translate-y-1/2 text-[13px] text-gray-400'
            }`}
        >
          {placeholder}
        </label>

        {suffix && (
          <div className="absolute right-3.5">{suffix}</div>
        )}
      </div>
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

        {/* Floating badges */}
        {floatingBadges.map((b, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-2 text-white text-xs font-semibold shadow-xl"
            style={{ top: b.top, left: b.left, right: (b as { right?: string }).right }}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{
              opacity: { delay: b.delay, duration: 0.5 },
              scale: { delay: b.delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              y: { delay: b.delay + 0.5, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span>{b.emoji}</span>
            <span>{b.label}</span>
          </motion.div>
        ))}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link href="/">
            <Image
              src="/ziya-logo.png"
              alt="Ziya"
              width={140}
              height={52}
              className="h-12 w-auto object-contain brightness-0 invert opacity-90"
              priority
            />
          </Link>
        </motion.div>

        {/* Center content */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.45 }}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-base flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          className="text-xs text-gray-600 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          © 2026 Ziya — the Fashion Closet
        </motion.p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12 bg-[#fafafa]">
        {/* Mobile logo */}
        <motion.div
          className="lg:hidden mb-8 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link href="/">
            <Image src="/ziya-logo.png" alt="Ziya" width={130} height={48} className="h-11 w-auto object-contain mx-auto" priority />
          </Link>
        </motion.div>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-1.5">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue shopping with Ziya</p>
          </motion.div>

          {/* Card */}
          <motion.div
            className="bg-white rounded-3xl shadow-sm border border-gray-100/80 p-7 sm:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="login-email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                label="Email"
                placeholder="Email address"
                icon={EnvelopeIcon}
                required
                delay={0.15}
              />

              <InputField
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                label="Password"
                placeholder="Password"
                icon={LockClosedIcon}
                required
                delay={0.22}
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

          {/* Footer links */}
          <motion.div
            className="mt-6 text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
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
