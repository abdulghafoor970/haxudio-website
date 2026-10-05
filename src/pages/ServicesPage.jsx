'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import { SERVICES } from '../data/services';
import { fetchPublicServices } from '../services/serviceApi';
import { PAGE_SEO } from '../data/seo';
import { useModal } from '../context/ModalContext';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function ServicesPage({ onOpenQuote }) {
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState(SERVICES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadServices() {
      try {
        const dynamicServices = await fetchPublicServices();
        if (isMounted && Array.isArray(dynamicServices)) {
          setServices(dynamicServices);
        }
      } catch (err) {
        console.warn('[ServicesPage] Failed to fetch dynamic services:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = services.filter((s) => {
    const slug = s.slug || s.id;
    if (filter === 'all') return true;
    if (filter === 'engineering') return ['web-development', 'ai-automation'].includes(slug);
    if (filter === 'design') return ['ui-ux-design', 'graphic-design', 'branding', 'video-editing'].includes(slug);
    if (filter === 'growth') return ['digital-marketing', 'seo', 'social-media-management'].includes(slug);
    return true;
  });

  return (
    <>
      <SEOHead
        title={PAGE_SEO.services.title}
        description={PAGE_SEO.services.description}
        canonical="https://www.haxudio.com/services"
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="max-w-4xl space-y-5 mb-14">
          <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
            Capabilities & Disciplines
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            Complete Digital Solutions Engineered for Growth.
          </h1>
          <p className="text-lg text-[#666461] leading-relaxed">
            From custom Next.js web applications to local Quetta SEO dominance, brand identity design,
            and automated customer pipelines, our multidisciplinary team delivers precision digital work.
          </p>
        </div>

        {/* Filter Tabs (Interactive Segmented Control, not pill badge sandwiches) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-200/50 rounded-lg w-fit mb-12 border border-[#121316]/5">
          {[
            { id: 'all', label: 'All 9 Capabilities' },
            { id: 'engineering', label: 'Engineering & Automation' },
            { id: 'design', label: 'Brand & Visual Design' },
            { id: 'growth', label: 'Growth, SEO & Marketing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                filter === tab.id
                  ? 'bg-white text-[#121316] shadow-sm'
                  : 'text-[#666461] hover:text-[#121316]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service._id || service.slug || service.id || `srv-${index}`}
              service={service}
              featured={filter === 'all' && index === 0}
            />
          ))}
        </div>

        {/* Engagement Models (Agency Pricing & Collaboration) */}
        <div className="bg-white border border-[#121316]/10 rounded-xl p-8 sm:p-12 mb-20">
          <SectionHeading
            eyebrow="Collaboration Models"
            title="How We Partner With Businesses."
            description="Whether you require a defined one-time project delivery or an ongoing digital growth partnership, we offer structured engagement options."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#FAF8F5] border border-neutral-200 rounded-lg space-y-4">
              <span className="text-xs uppercase tracking-wider text-[#C25E34] font-bold">
                Model 01
              </span>
              <h3 className="font-display text-xl font-bold text-[#121316]">
                Fixed-Scope Project
              </h3>
              <p className="text-xs text-[#666461] leading-relaxed">
                Ideal for websites, brand identity overhauls, and standalone UI/UX sprints.
                Clear milestones, fixed delivery deadline, and itemized deliverables.
              </p>
              <div className="pt-2 text-xs text-[#121316] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Defined timeline (3–6 weeks)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Staged milestone payments</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#121316] text-[#FAF8F5] rounded-lg space-y-4 shadow-md">
              <span className="text-xs uppercase tracking-wider text-[#C25E34] font-bold">
                Model 02 · Most Popular
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Monthly Growth Retainer
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                For established businesses that require continuous SEO, social media management,
                content updates, and conversion rate optimization.
              </p>
              <div className="pt-2 text-xs text-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Dedicated weekly hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Bi-weekly performance audit</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-neutral-200 rounded-lg space-y-4">
              <span className="text-xs uppercase tracking-wider text-[#C25E34] font-bold">
                Model 03
              </span>
              <h3 className="font-display text-xl font-bold text-[#121316]">
                Dedicated Team Extension
              </h3>
              <p className="text-xs text-[#666461] leading-relaxed">
                For expanding startups and commercial enterprises needing specialized frontend
                engineers, designers, or automated workflow architects on an ongoing basis.
              </p>
              <div className="pt-2 text-xs text-[#121316] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Direct team Slack/WhatsApp access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Agile sprint planning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-xl mx-auto space-y-5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121316]">
            Unsure Which Service Matches Your Need?
          </h2>
          <p className="text-sm text-[#666461]">
            Our consultants will assess your existing platforms and advise on the most cost-effective path.
          </p>
          <button
            onClick={handleOpenQuote}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] transition-colors"
          >
            <span>Request a Custom Recommendation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
