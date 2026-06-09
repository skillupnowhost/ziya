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
  UserIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const floatingBadges = [
  { emoji: '🌸', label: 'Free to Join', top: '12%', left: '6%', delay: 0.65 },
  { emoji: '🎁', label: 'Welcome Gift', top: '72%', left: '4%', delay: 0.95 },
  { emoji: '💎', label: 'VIP Access', top: '36%', right: '5%', delay: 0.8 },
  { emoji: '🛍️', label: 'Shop Smarter', top: '78%', right: '6%', delay: 1.05 },
];

const perks = [
  { icon: '🎀', text: 'Welcome 10% off your first order' },
  { icon: '📦', text: 'Free shipping on orders over ₹999' },
  { icon: '💌', text: 'Early access to limited collections' },
  { icon: '⭐', text: 'Earn reward points on every purchase' },
];

function InputField({
  id,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
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
  icon: React.ElementType;
  suffix?: React.ReactNode;
  required?: boolean;
  delay?: number;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
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
          autoComplete={autoComplete}
          className="w-full pt-5 pb-2 pl-11 pr-11 text-sm text-gray-800 bg-transparent focus:outline-none"
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

        {/* Floating badges */}
        {floatingBadges.map((b, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-2 text-white text-xs font-semibold shadow-xl"
            style={{ top: b.top, left: b.left, right: (b as { right?: string }).right }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
            transition={{
              opacity: { delay: b.delay, duration: 0.5 },
              scale: { delay: b.delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              y: { delay: b.delay + 0.5, duration: 3.2 + i * 0.35, repeat: Infinity, ease: 'easeInOut' },
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
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.62 + i * 0.1, duration: 0.45 }}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-sm flex-shrink-0">
                  {p.icon}
                </div>
                <span className="text-gray-300 text-sm">{p.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-xs text-gray-600 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
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
            className="mb-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-1.5">Create account</h1>
            <p className="text-gray-400 text-sm">Join Ziya and start your Korean fashion journey</p>
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
                icon={EnvelopeIcon}
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

          {/* Footer links */}
          <motion.div
            className="mt-6 text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
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
