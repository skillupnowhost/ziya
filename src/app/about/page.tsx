import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-center">
        <div className="rounded-[1.75rem] border border-gray-200 bg-[#f7f3f2] p-2.5 sm:p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="relative aspect-[4/4.7] sm:aspect-[3/3.9] lg:aspect-[5/5.8] overflow-hidden rounded-[1.3rem] bg-[#f3efee]">
            <Image
              src="/Uma%20Ziyakart.jpg"
              alt="Uma Ziyakart"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white border border-rose-100 shadow-lg p-6 sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-rose-500 font-semibold mb-3">About Ziyakart</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-rose-600 leading-tight mb-5">A joyful place for curated fashion, antique jewellery, and thoughtful lifestyle finds.</h1>
          <p className="text-gray-600 text-base sm:text-lg leading-7 mb-4">
            Ziyakart began with a simple idea: bring elegant style and personal care together in one enjoyable shopping experience. From modern apparel and accessories to antique jewellery and handbags, every item is chosen for its charm, quality, and personality.
          </p>
          <p className="text-gray-600 text-base sm:text-lg leading-7 mb-6">
            We serve customers who appreciate beautiful design, honest service, and the comfort of a store that listens. Our goal is to make every order feel special, whether you're shopping for yourself or sending a gift.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {[
              {
                title: 'Curated Finds',
                description: 'Thoughtful selections that blend trend, comfort, and timeless appeal.',
              },
              {
                title: 'Personal Service',
                description: 'Friendly support from order placement through delivery and beyond.',
              },
              {
                title: 'Transparent Pricing',
                description: 'No hidden platform fees — you pay only the listed price plus standard shipping.',
              },
              {
                title: 'Gift-Ready Style',
                description: 'Beautifully coordinated combos and accessories for effortless gifting.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-rose-50 p-5 border border-rose-100 shadow-sm">
                <h2 className="text-sm text-rose-500 font-semibold uppercase tracking-[0.25em] mb-2">{item.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          

          <div className="mt-6 text-sm text-gray-500 space-y-3">
           
            <p>
              For questions or personalized styling help, visit the{' '}
              <Link href="/contact" className="font-semibold text-rose-600 hover:text-rose-700">Contact Us</Link>{' '}
              page anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-semibold mb-3">Our mission</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Deliver joyful style with care.</h2>
          <p className="text-gray-600 leading-7">We make every outfit, accessory, and gifting moment feel warm, personal, and beautifully presented.</p>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500 font-semibold mb-4">Our values</p>
          <ul className="space-y-3 text-gray-600 leading-7">
            <li>Quality craftsmanship and timeless pieces.</li>
            <li>Empathy in every customer interaction.</li>
            <li>Honest pricing with no hidden surprises.</li>
            <li>Curated style for everyday and special occasions.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500 font-semibold mb-4">What we offer</p>
          <ul className="space-y-3 text-gray-600 leading-7">
            <li>Curated fashion and accessory collections.</li>
            <li>Antique jewellery and handbag bundles.</li>
            <li>Gift-ready styling and thoughtful presentation.</li>
            <li>Fast support and reliable delivery updates.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
