'use client';
import Link from 'next/link';
import { FireIcon, TruckIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const heroText = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const line = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const imageVariant = {
  hidden: { opacity: 0, scale: 0.92, x: 30 },
  show: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const badgeFloat = {
  hidden: { opacity: 0, y: 16, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] } },
};

export default function HeroSection() {
  return (
    <section className="hero-section relative w-full bg-gradient-to-br from-rose-50 via-pink-50/40 to-white">
      {/* Soft background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-rose-100/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-pink-100/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full pt-10 pb-12 lg:pt-14 lg:pb-14">

          {/* Left — Key text */}
          <motion.div
            className="order-2 lg:order-1 text-center lg:text-left"
            variants={heroText}
            initial="hidden"
            animate="show"
          >
            <motion.span variants={line} className="inline-block bg-rose-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase shadow-md shadow-rose-300/30">
              New Collection
            </motion.span>
            <motion.p variants={line} className="text-rose-400 text-xs sm:text-sm tracking-[0.4em] uppercase mb-3 font-medium">
              Curated Elegance
            </motion.p>
            <motion.h1 variants={line} className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5 font-serif">
              Indo Korean<br />
              <span className="text-rose-400">Fashion</span>
            </motion.h1>
            <motion.p variants={line} className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
              Discover timeless pieces inspired by the streets of Seoul — curated with love for the modern woman.
            </motion.p>
            <motion.div variants={line} className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6 lg:mb-10">
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-400/35 hover:shadow-xl hover:shadow-rose-400/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-base leading-none">✦</span>
                Explore Collection
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-full hover:bg-rose-50 hover:text-rose-500 active:scale-95 transition-all border border-gray-200 text-sm tracking-wide shadow-sm"
              >
                View All
                <span className="text-xs opacity-50">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Image */}
          <motion.div
            className="order-1 lg:order-2 relative flex justify-center lg:justify-end"
            variants={imageVariant}
            initial="hidden"
            animate="show"
          >
            <div className="relative w-full mx-6 sm:mx-0 sm:w-80 lg:w-[380px] xl:w-[420px]">
              <div className="absolute -inset-6 rounded-full bg-rose-200/40 blur-3xl" />
              <div className="absolute -inset-2 rounded-[55%_45%_50%_50%/45%_55%_45%_55%] bg-pink-100/60 blur-2xl" />

              <div className="hero-image-wrapper relative w-full shadow-2xl shadow-rose-300/40">
                <img
                  src="/homepage-image.jpg"
                  alt="Korean Fashion"
                  className="hero-image relative w-full"
                />
                <div className="hero-cloud-overlay absolute inset-0 pointer-events-none" />
              </div>

              {/* Free Shipping badge */}
              <motion.div
                variants={badgeFloat}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.7 }}
                className="absolute -bottom-4 -left-2 sm:-left-8 bg-white/90 backdrop-blur-md rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-4 sm:py-3 shadow-lg shadow-rose-100/50 border border-white/70 flex items-center gap-1.5 sm:gap-3"
              >
                <span className="w-5 h-5 sm:w-9 sm:h-9 rounded-md sm:rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <TruckIcon className="truck-icon w-3 h-3 sm:w-5 sm:h-5 text-rose-400" />
                </span>
                <div>
                  <p className="text-[8px] sm:text-xs text-gray-400 font-medium leading-none mb-0.5">Free Shipping</p>
                  <p className="text-[9px] sm:text-sm font-bold text-gray-800 leading-none">Orders above ₹999</p>
                </div>
              </motion.div>

              {/* Trending badge */}
              <motion.div
                variants={badgeFloat}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.85 }}
                className="absolute -top-2 -right-2 sm:-right-5 bg-gradient-to-br from-rose-400 to-orange-400 text-white rounded-lg sm:rounded-2xl px-1.5 py-1 sm:px-3 sm:py-2.5 shadow-md shadow-rose-400/40 border border-white/20 text-center flex flex-col items-center gap-0.5"
              >
                <FireIcon className="flame-icon w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-200 drop-shadow" />
                <p className="text-[7px] sm:text-xs font-bold tracking-wide leading-none">TRENDING</p>
                <p className="text-[6px] sm:text-[10px] opacity-80 leading-none">Now</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
