'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import {
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const categories = [
  { label: 'Dresses', href: '/products?category=dresses' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Stationery', href: '/products?category=stationery' },
];

const support = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Contact Us', href: '/contact' },
];

const socials = [
  { icon: FaInstagram, label: 'Instagram', href: 'https://www.instagram.com/ziya.thefashioncloset?igsh=MThoZjZtMzFyOHhtYg==', color: 'hover:text-pink-400', hoverBg: 'hover:bg-pink-400/15' },
  { icon: FaFacebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590776248533', color: 'hover:text-blue-400', hoverBg: 'hover:bg-blue-400/15' },
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

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <footer className="bg-[#1a1a2e] text-gray-300">
        {/* Main footer */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
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
                {socials.map(({ icon: Icon, label, href, color, hoverBg }, i) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
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
