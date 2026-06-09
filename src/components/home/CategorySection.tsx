'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const categoryConfig = [
  {
    name: 'Accessories',
    key: 'accessories',
    href: '/products?category=accessories',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop',
    description: 'Bags, jewellery & more',
    color: 'from-pink-400/80',
  },
  {
    name: 'Stationery',
    key: 'stationery',
    href: '/products?category=stationery',
    image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=500&fit=crop',
    description: 'Aesthetic planners & notebooks',
    color: 'from-purple-400/80',
  },
  {
    name: 'Dresses',
    key: 'dresses',
    href: '/products?category=dresses',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
    description: 'Flowing silhouettes & elegant cuts',
    color: 'from-rose-400/80',
  },
];

interface CategoryCount {
  [key: string]: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CategorySection() {
  const [counts, setCounts] = useState<CategoryCount>({});

  useEffect(() => {
    Promise.all(
      categoryConfig.map((cat) =>
        fetch(`/api/products?category=${cat.key}&limit=1`)
          .then((r) => r.json())
          .then((d) => ({ key: cat.key, total: d.pagination?.total ?? 0 }))
          .catch(() => ({ key: cat.key, total: 0 }))
      )
    ).then((results) => {
      const map: CategoryCount = {};
      results.forEach(({ key, total }) => { map[key] = total; });
      setCounts(map);
    });
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-rose-400 text-sm tracking-[0.3em] uppercase font-medium mb-2">Explore</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">Shop by Category</h2>
        <p className="text-gray-500 mt-2 text-sm">Curated collections for every style</p>
      </motion.div>

      {/* Mobile: featured first card + 2-col grid for rest */}
      <div className="sm:hidden flex flex-col gap-3">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          <Link
            href={categoryConfig[0].href}
            className="group relative overflow-hidden rounded-2xl aspect-[16/9] shadow-sm active:scale-[0.98] transition-transform duration-200 block"
          >
            <img
              src={categoryConfig[0].image}
              alt={categoryConfig[0].name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${categoryConfig[0].color} to-transparent`} />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-bold text-sm leading-tight">{categoryConfig[0].name}</h3>
              <p className="text-white/80 text-xs mt-0.5">{categoryConfig[0].description}</p>
              {counts[categoryConfig[0].key] !== undefined && (
                <span className="inline-block mt-1.5 text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                  {counts[categoryConfig[0].key]} products
                </span>
              )}
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {categoryConfig.slice(1).map((cat, i) => (
            <motion.div
              key={cat.name}
              custom={i + 1}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              <Link
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm active:scale-[0.98] transition-transform duration-200 block"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <h3 className="text-white font-bold text-xs leading-tight">{cat.name}</h3>
                  <p className="text-white/75 text-[10px] mt-0.5 leading-tight">{cat.description}</p>
                  {counts[cat.key] !== undefined && (
                    <span className="inline-block mt-1 text-[10px] bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
                      {counts[cat.key]} products
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {categoryConfig.map((cat, i) => (
          <motion.div
            key={cat.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <Link
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base leading-tight">{cat.name}</h3>
                <p className="text-white/80 text-xs mt-0.5">{cat.description}</p>
                {counts[cat.key] !== undefined && (
                  <span className="inline-block mt-2 text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                    {counts[cat.key]} products
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
