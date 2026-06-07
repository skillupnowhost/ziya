import Link from 'next/link';

export default function BannerSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Big banner */}
        <div className="relative rounded-3xl overflow-hidden h-72 md:h-80 group">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&h=500&fit=crop"
            alt="New Season"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-900/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <p className="text-rose-200 text-xs tracking-widest uppercase mb-2">Limited Edition</p>
            <h3 className="text-white text-3xl font-bold font-serif leading-tight mb-4">
              Summer<br />Collection 2024
            </h3>
            <Link
              href="/products?category=dresses"
              className="inline-flex w-fit px-6 py-2.5 bg-white text-rose-500 text-sm font-semibold rounded-full hover:bg-rose-50 transition-colors"
            >
              Explore Now
            </Link>
          </div>
        </div>

        {/* Two small banners */}
        <div className="flex flex-col gap-6">
          <div className="relative rounded-3xl overflow-hidden h-32 sm:h-36 group">
            <img
              src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=700&h=200&fit=crop"
              alt="K-Beauty"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-transparent" />
            <div className="absolute inset-0 flex items-center px-6 gap-4">
              <div>
                <p className="text-purple-200 text-xs tracking-widest uppercase">New Arrivals</p>
                <h3 className="text-white text-xl font-bold font-serif">K-Beauty Picks</h3>
              </div>
              <Link
                href="/products?category=beauty"
                className="ml-auto px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-colors whitespace-nowrap"
              >
                Shop Now
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden h-32 sm:h-36 group">
            <img
              src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&h=200&fit=crop"
              alt="Gift Sets"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/60 to-transparent" />
            <div className="absolute inset-0 flex items-center px-6 gap-4">
              <div>
                <p className="text-teal-200 text-xs tracking-widest uppercase">Perfect Gifting</p>
                <h3 className="text-white text-xl font-bold font-serif">Gift Sets</h3>
              </div>
              <Link
                href="/products?category=gifts"
                className="ml-auto px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-colors whitespace-nowrap"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* USP bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🚚', label: 'Free Shipping', sub: 'Over ₹999' },
              { icon: '🎁', label: 'Secure Packaging', sub: 'Every order' },
              { icon: '✅', label: 'Authentic', sub: 'Korean products' },
            ].map((item) => (
              <div key={item.label} className="bg-rose-50 rounded-2xl p-3 text-center">
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-semibold text-gray-800 mt-1">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
