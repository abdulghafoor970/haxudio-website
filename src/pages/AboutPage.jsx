'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import { AGENCY_VALUES } from '../data/testimonials';
import { BRAND } from '../data/navigation';
import { PAGE_SEO } from '../data/seo';
import { useModal } from '../context/ModalContext';
import { fetchPublicContent } from '../services/contentApi';
import { MapPin, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage({ onOpenQuote }) {
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;
  const [aboutContent, setAboutContent] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        const res = await fetchPublicContent('about');
        if (isMounted && res?.sections) {
          const normalized = {};
          for (const [key, val] of Object.entries(res.sections)) {
            normalized[key.toLowerCase()] = val.content || {};
          }
          setAboutContent(normalized);
        }
      } catch (err) {
        console.warn('[AboutPage] Error loading dynamic content:', err);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const hero = aboutContent.hero || {};
  const story = aboutContent.story || {};
  const mission = aboutContent.mission || {};
  const vision = aboutContent.vision || {};
  const values = aboutContent.values || {};
  const finalCta = aboutContent.finalcta || {};

  return (
    <>
      <SEOHead
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        canonical="https://www.haxudio.com/about"
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Hero Banner */}
        <div className="max-w-4xl space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>{hero.eyebrow || 'Rooted in Quetta, Balochistan · Serving All of Pakistan'}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            {hero.heading || 'Building Digital Products with Pride, Integrity, and Craftsmanship.'}
          </h1>

          <p className="text-lg md:text-xl text-[#666461] leading-relaxed">
            {hero.description || 'Haxudio Digital Solutions was founded to solve a persistent challenge: businesses in Quetta and Balochistan deserve the same standard of software engineering, editorial design, and digital growth infrastructure enjoyed by leading global enterprises.'}
          </p>
        </div>

        {/* Narrative & Origin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 pb-20 border-b border-[#121316]/10">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121316]">
              {story.heading || 'Who We Are'}
            </h2>
            <p className="text-sm sm:text-base text-[#121316]/90 leading-relaxed">
              {story.description || 'We are an independent digital solutions agency composed of frontend engineers, visual designers, SEO strategists, and growth advisors based in Quetta.'}
            </p>
            <p className="text-sm sm:text-base text-[#666461] leading-relaxed">
              Too many regional businesses were sold bloated WordPress themes packed with 50 unstable
              plugins that crash on mobile 4G networks. We set out to change that by engineering
              lightweight, accessible web applications built from scratch with clean modern technologies
              like Next.js, React, and modular Tailwind CSS.
            </p>
            <p className="text-sm sm:text-base text-[#666461] leading-relaxed">
              From our office on M.A Jinnah Road in Quetta, we partner with healthcare facilities,
              artisan craft brands, hospitality groups, educational centers, and commercial suppliers
              across Balochistan, Karachi, Lahore, and Islamabad.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#121316]/10 shadow-md bg-neutral-100">
              <img
                src={hero.heroImageUrl || '/src/assets/images/haxudio_quetta_hub_1790427878986.jpg'}
                alt={hero.heroImageAlt || 'Haxudio Digital Solutions Quetta workspace'}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-[#666461] mt-2.5">
              Haxudio Agency Studio — Quetta, Balochistan, Pakistan
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 sm:p-10 bg-white border border-[#121316]/10 rounded-lg space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#C25E34] font-bold">
              Our Mission
            </span>
            <h3 className="font-display text-2xl font-bold text-[#121316]">
              {mission.heading || 'To Engineer Enduring Digital Assets'}
            </h3>
            <p className="text-sm text-[#666461] leading-relaxed">
              {mission.description || 'Our mission is to help Pakistani businesses transition from transient social posts and fragile templates to high-speed, secure, and enduring digital platforms that drive verifiable inbound inquiries, customer retention, and commercial independence.'}
            </p>
          </div>

          <div className="p-8 sm:p-10 bg-white border border-[#121316]/10 rounded-lg space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#C25E34] font-bold">
              Our Vision
            </span>
            <h3 className="font-display text-2xl font-bold text-[#121316]">
              {vision.heading || 'Elevating the Digital Standard in Balochistan'}
            </h3>
            <p className="text-sm text-[#666461] leading-relaxed">
              {vision.description || 'We envision Quetta as a recognized center of software excellence and creative industry within Pakistan—proving that world-class design and engineering can be built right here in the heart of Balochistan.'}
            </p>
          </div>
        </div>

        {/* Core Principles & Values */}
        <div className="mb-24">
          <SectionHeading
            eyebrow="Our Principles"
            title={values.heading || 'The Values That Guide Every Decision.'}
            description={values.description || 'We believe in straightforward contracts, radical technical transparency, and measurable business value.'}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENCY_VALUES.map((val) => (
              <div
                key={val.number}
                className="p-6 bg-[#F4F1EA] border border-[#121316]/10 rounded-lg space-y-3"
              >
                <span className="font-mono text-xs font-bold text-[#C25E34]">
                  {val.number}
                </span>
                <h4 className="font-display text-lg font-bold text-[#121316]">
                  {val.title}
                </h4>
                <p className="text-xs text-[#666461] leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Haxudio Different */}
        <div className="bg-[#121316] text-[#FAF8F5] rounded-xl p-8 sm:p-12 mb-24">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
              The Haxudio Standard
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Why Discerning Businesses Choose Us Over Freelancer Pools and Template Resellers.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span>Zero pre-built bloated themes; every interface is engineered from clean code</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span>In-person strategy sessions and face-to-face accountability in Quetta</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span>Transparent timelines and itemized deliverables with zero surprise fees</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <span>Technical SEO baked in from line one, including Schema.org structured data</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-3xl font-bold text-[#121316]">
            {finalCta.heading || 'Ready to Discuss Your Organization’s Digital Trajectory?'}
          </h2>
          <p className="text-sm text-[#666461] leading-relaxed">
            {finalCta.description || 'Visit our office on M.A Jinnah Road in Quetta, or schedule a discovery call with our engineering leads.'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleOpenQuote}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] transition-colors"
            >
              <span>{finalCta.buttonLabel || 'Start a Project'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <Link
              href={finalCta.buttonUrl || '/contact'}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#121316] border border-[#121316]/20 rounded-md hover:border-[#121316] transition-colors"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
