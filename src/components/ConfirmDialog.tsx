'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowRightStartOnRectangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export type ConfirmDialogType = 'danger' | 'signout' | 'warning';

interface ConfirmDialogProps {
  open: boolean;
  type?: ConfirmDialogType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const CONFIG = {
  danger: {
    icon: TrashIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-rose-500',
    shadowColor: 'shadow-red-200/60',
    accentLine: 'from-red-400 via-rose-400 to-pink-400',
    orb: 'bg-red-400/20',
    ring: 'ring-red-200/50',
  },
  signout: {
    icon: ArrowRightStartOnRectangleIcon,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-rose-500',
    shadowColor: 'shadow-orange-200/60',
    accentLine: 'from-orange-400 via-rose-400 to-pink-400',
    orb: 'bg-orange-400/20',
    ring: 'ring-orange-200/50',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    shadowColor: 'shadow-amber-200/60',
    accentLine: 'from-amber-400 via-orange-400 to-rose-400',
    orb: 'bg-amber-400/20',
    ring: 'ring-amber-200/50',
  },
};

export default function ConfirmDialog({
  open,
  type = 'danger',
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  // Escape key closes dialog
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0.82, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* Glow border */}
            <div className={`absolute -inset-[1.5px] rounded-[28px] bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo} opacity-25 blur-[2px]`} />

            {/* Inner card */}
            <div className="relative bg-white rounded-[26px] overflow-hidden shadow-2xl">

              {/* Top accent bar */}
              <div className={`h-[3px] w-full bg-gradient-to-r ${cfg.accentLine}`} />

              {/* Decorative orb */}
              <div className={`pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full ${cfg.orb} blur-2xl`} />

              <div className="px-7 pt-8 pb-7">
                {/* Icon badge */}
                <motion.div
                  className="mb-5"
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 360, damping: 20 }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} ${cfg.ring} ring-4 flex items-center justify-center shadow-lg ${cfg.shadowColor}`}>
                    <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
                  </div>
                </motion.div>

                {/* Text */}
                <motion.h2
                  className="text-xl font-black text-gray-900 mb-2 leading-tight"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                >
                  {title}
                </motion.h2>
                <motion.p
                  className="text-sm text-gray-500 leading-relaxed"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.3 }}
                >
                  {message}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  className="flex gap-3 mt-7"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 text-sm font-bold hover:border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50 active:scale-[0.97]"
                  >
                    {cancelLabel}
                  </button>

                  {/* Confirm */}
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-2xl bg-gradient-to-r ${cfg.gradientFrom} ${cfg.gradientTo} text-white text-sm font-black shadow-lg ${cfg.shadowColor} hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing…
                      </span>
                    ) : confirmLabel}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
