'use client';

import React from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import { BRAND } from '../data/navigation';
import { PAGE_SEO } from '../data/seo';
import LocationMapCard from '../components/LocationMapCard';
import { useModal } from '../context/ModalContext';
import { MapPin, CheckCircle2, Building2, Utensils, Stethoscope, Truck, GraduationCap } from 'lucide-react';

export default function LocalQuettaPage({ onOpenQuote }) {
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;

  const localIndustries = [
    {
      icon: Stethoscope,
      title: 'Clinics & Medical Complexes',
      desc: 'Doctor OPD schedules, mobile booking, Google Maps directions, and patient triage systems for Quetta medical practitioners.',
    },
    {
      icon: Utensils,
      title: 'Restaurants & Hospitality',
      desc: 'Sensory digital menus, direct WhatsApp reservation funnels, and local social media campaigns for Quetta dining venues.',
    },
    {
      icon: Truck,
      title: 'Agro Logistics & Cold Storage',
      desc: 'Corporate supply chain portals, warehousing capacity listings, and national B2B outreach for Balochistan fruit distributors.',
    },
    {
      icon: Building2,
      title: 'Retail & Commercial Stores',
      desc: 'High-speed eCommerce storefronts, catalog showcases, and localized search presence along Prince Road and Liaquat Bazaar.',
    },
    {
      icon: GraduationCap,
      title: 'Educational Institutions',
      desc: 'Admissions portals, prospectus downloads, and institutional branding for Quetta academies and private colleges.',
    },
  ];

  const quettaLocalBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Haxudio Digital Solutions',
    alternateName: 'Haxudio Quetta',
    url: 'https://www.haxudio.com/locations/quetta',
    telephone: '+92 318 3690179',
    email: 'hello@haxudio.com',
    image: 'https://www.haxudio.com/og-image.jpg',
    description:
      'Quetta headquarters of Haxudio Digital Solutions. Providing custom web development, local SEO, graphic design, and modern marketing systems for businesses across Balochistan and Pakistan.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'A1 City, Hazara Town, Brewery Road',
      addressLocality: 'Quetta',
      addressRegion: 'Balochistan',
      addressCountry: 'PK',
    },
    hasMap: 'https://share.google/zFaaZlrDoY9v7zIEZ',
    areaServed: [
      { '@type': 'City', name: 'Quetta' },
      { '@type': 'State', name: 'Balochistan' },
      { '@type': 'Country', name: 'Pakistan' },
    ],
    sameAs: [
      'https://www.instagram.com/haxudio/',
      'https://www.facebook.com/haxudio/',
      'https://www.linkedin.com/company/haxudio/',
      'https://x.com/haxudio',
      'https://share.google/zFaaZlrDoY9v7zIEZ',
    ],
  };

  return (
    <>
      <SEOHead
        title={PAGE_SEO.quettaLocation.title}
        description={PAGE_SEO.quettaLocation.description}
        canonical="https://www.haxudio.com/locations/quetta"
        image="https://www.haxudio.com/og-image.jpg"
        jsonLd={quettaLocalBusinessJsonLd}
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="max-w-4xl space-y-5 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Quetta Headquarters & Regional Hub</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            Digital Solutions for Businesses in Quetta & Balochistan.
          </h1>
          <p className="text-lg text-[#666461] leading-relaxed">
            Haxudio Digital Solutions is headquartered in Quetta. We work directly with local business owners,
            medical centers, and entrepreneurs to build custom web systems, brand identities, and local search
            prominence that move your business forward.
          </p>
        </div>

        {/* Local Advantage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 pb-16 border-b border-[#121316]/10">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121316]">
              Why Partner with a Native Quetta Agency?
            </h2>
            <p className="text-sm sm:text-base text-[#121316] leading-relaxed">
              When you hire a remote freelancer or distant agency in another province, they often fail to grasp
              how business actually moves in Balochistan. They don’t know local commercial hubs, regional search
              intent, or the critical importance of WhatsApp communication.
            </p>
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#121316]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span><strong>In-Person Strategy Meetings:</strong> Meet our team face-to-face at our Quetta office on M.A Jinnah Road.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span><strong>Mobile Speed Calibrated for Regional 4G:</strong> Fast-loading code engineered to function smoothly even on fluctuating cellular data.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span><strong>Local Google 3-Pack Mastery:</strong> Proven strategies to help your business dominate map search results when Quetta residents search for your services.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span><strong>Long-Term Local Accountability:</strong> We don’t disappear after launch. We are here in your city to support your growth year-round.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#121316]/10 p-8 rounded-xl space-y-5 shadow-sm">
            <h3 className="font-display text-xl font-bold text-[#121316]">
              Quetta Office & Consultations
            </h3>
            <div className="space-y-3 text-xs text-[#666461]">
              <p><strong className="text-[#121316]">Location:</strong> {BRAND.address}</p>
              <p><strong className="text-[#121316]">Phone / WhatsApp:</strong> {BRAND.phone}</p>
              <p><strong className="text-[#121316]">Email:</strong> {BRAND.email}</p>
              <p><strong className="text-[#121316]">Hours:</strong> {BRAND.workingHours}</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleOpenQuote()}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830] transition-colors cursor-pointer"
              >
                Book a Quetta Office Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Local Industries Served in Quetta */}
        <div className="mb-24">
          <SectionHeading
            eyebrow="Local Sectors"
            title="Tailored Solutions for Quetta’s Economy."
            description="We understand the operational requirements of key industries across Quetta and Balochistan."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localIndustries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.title}
                  className="p-6 bg-white border border-[#121316]/10 rounded-lg space-y-3"
                >
                  <div className="w-10 h-10 rounded-md bg-[#FAF8F5] border border-neutral-200 flex items-center justify-center text-[#C25E34]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#121316]">
                    {ind.title}
                  </h3>
                  <p className="text-xs text-[#666461] leading-relaxed">
                    {ind.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quetta Location Map Card with Google Business Profile */}
        <LocationMapCard className="mb-20" />

        {/* Regional Balochistan & Nationwide Reach */}
        <div id="balochistan" className="p-8 sm:p-12 bg-[#121316] text-[#FAF8F5] rounded-xl mb-24">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
              Balochistan & Nationwide Outreach
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Expanding Commercial Corridors from Quetta to Karachi, Islamabad, and Lahore.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              While our creative studio is anchored in Quetta, our systems are built to connect Balochistan’s
              enterprises to nationwide customer bases. We build high-speed eCommerce and B2B platforms
              that bridge geographical distance with digital precision.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => handleOpenQuote()}
                className="px-6 py-3 text-xs font-semibold text-[#121316] bg-[#FAF8F5] rounded-md hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Schedule Local Consultation
              </button>
              <Link
                href="/services"
                className="px-6 py-3 text-xs font-semibold text-white border border-white/20 rounded-md hover:border-white transition-colors inline-block"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
