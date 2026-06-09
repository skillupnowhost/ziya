'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const banners = [
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&h=500&fit=crop',
    alt: 'New Season',
    overlay: 'from-rose-900/60',
    tag: 'Limited Edition',
    tagColor: 'text-rose-200',
    title: 'Summer\nCollection 2024',
    href: '/products?category=dresses',
    cta: 'Explore Now',
    big: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=700&h=200&fit=crop',
    alt: 'K-Beauty',
    overlay: 'from-purple-900/60',
    tag: 'New Arrivals',
    tagColor: 'text-purple-200',
    title: 'K-Beauty Picks',
    href: '/products?category=accessories',
    cta: 'Shop Now',
  },
  {
    src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=200&fit=crop',
    alt: 'Gift Sets',
    overlay: 'from-teal-900/60',
    tag: 'Perfect Gifting',
    tagColor: 'text-teal-200',
    title: 'Gift Sets',
    href: '/products',
    cta: 'Shop Now',
  },
];

const usps = [
  { icon: '🚚', label: 'Free Shipping', sub: 'Over ₹999' },
  { icon: '🎁', label: 'Secure Packaging', sub: 'Every order' },
  { icon: '✅', label: 'Authentic', sub: 'Korean products' },
];

export default function BannerSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Big banner */}
        <motion.div
          className="relative rounded-3xl overflow-hidden h-72 md:h-80 group"
          initial={{ opacity: 0, x: -32, scale: 0.97 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.012 }}
        >
          <img
            src={banners[0].src}
            alt={banners[0].alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${banners[0].overlay} to-transparent`} />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <motion.p
              className={`${banners[0].tagColor} text-xs tracking-widest uppercase mb-2`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {banners[0].tag}
            </motion.p>
            <motion.h3
              className="text-white text-3xl font-bold font-serif leading-tight mb-4 whitespace-pre-line"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {banners[0].title}
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <Link
                href={banners[0].href}
                className="inline-flex w-fit px-6 py-2.5 bg-white text-rose-500 text-sm font-semibold rounded-full hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
              >
                {banners[0].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Small banners + USP */}
        <div className="flex flex-col gap-6">
          {banners.slice(1).map((b, i) => (
            <motion.div
              key={b.alt}
              className="relative rounded-3xl overflow-hidden h-32 sm:h-36 group"
              initial={{ opacity: 0, x: 32, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.015 }}
            >
              <img
                src={b.src}
                alt={b.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${b.overlay} to-transparent`} />
              <div className="absolute inset-0 flex items-center px-6 gap-4">
                <div>
                  <p className={`${b.tagColor} text-xs tracking-widest uppercase`}>{b.tag}</p>
                  <h3 className="text-white text-xl font-bold font-serif">{b.title}</h3>
                </div>
                <Link
                  href={b.href}
                  className="ml-auto px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30 hover:bg-white/30 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  {b.cta}
                </Link>
              </div>
            </motion.div>
          ))}

          {/* USP bar */}
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-30px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          >
            {usps.map((item) => (
              <motion.div
                key={item.label}
                className="bg-rose-50 rounded-2xl p-3 text-center"
                variants={{ hidden: { opacity: 0, y: 14, scale: 0.92 }, show: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ scale: 1.04, y: -2 }}
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-semibold text-gray-800 mt-1">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
