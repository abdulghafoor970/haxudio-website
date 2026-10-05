'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import { SERVICES } from '../data/services';
import { fetchPublicServiceBySlug } from '../services/serviceApi';
import { useModal } from '../context/ModalContext';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function ServiceDetailPage({ slug: propSlug, onOpenQuote }) {
  const urlParams = useParams();
  const slug = propSlug || urlParams?.slug;
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;

  const [service, setService] = useState(() => SERVICES.find((s) => s.slug === slug) || null);
  const [isLoading, setIsLoading] = useState(!service);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadService() {
      if (!slug) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }
      try {
        const dynamicService = await fetchPublicServiceBySlug(slug);
        if (isMounted) {
          if (dynamicService) {
            setService(dynamicService);
            setNotFound(false);
          } else {
            setService(null);
            setNotFound(true);
          }
        }
      } catch (err) {
        console.warn('[ServiceDetailPage] Error fetching dynamic service:', err);
        if (isMounted) {
          setService(null);
          setNotFound(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadService();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-40 pb-32 text-center max-w-lg mx-auto px-6 space-y-4">
        <span className="font-mono text-xs text-[#C25E34]">Loading Service...</span>
        <div className="w-8 h-8 border-2 border-[#C25E34] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="pt-40 pb-32 text-center max-w-lg mx-auto px-6 space-y-4">
        <span className="font-mono text-xs font-bold text-[#C25E34]">404 Not Found</span>
        <h1 className="font-display text-3xl font-bold text-[#121316]">Service Not Found</h1>
        <p className="text-sm text-[#666461]">
          The service you are looking for has either been moved, unpublished, or does not exist.
        </p>
        <div className="pt-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Services</span>
          </Link>
        </div>
      </div>
    );
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.title,
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'Haxudio Digital Solutions',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Quetta',
        'addressRegion': 'Balochistan',
        'addressCountry': 'PK',
      },
    },
    'description': service.shortDescription,
    'areaServed': [
      { '@type': 'City', 'name': 'Quetta' },
      { '@type': 'State', 'name': 'Balochistan' },
      { '@type': 'Country', 'name': 'Pakistan' },
    ],
  };

  return (
    <>
      <SEOHead
        title={service.seoTitle}
        description={service.seoDescription}
        canonical={`https://www.haxudio.com/services/${service.slug}`}
        jsonLd={serviceJsonLd}
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Breadcrumb Navigation (Unboxed text metadata) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#666461] mb-8">
          <Link href="/" className="hover:text-[#121316]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/services" className="hover:text-[#121316]">Services</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#121316] font-medium">{service.title}</span>
        </nav>

        {/* Service Hero */}
        <div className="max-w-4xl space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider">
            <span>{service.eyebrow}</span>
            <span aria-hidden="true">·</span>
            <span>Quetta & Pakistan</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.08] text-balance">
            {service.title}
          </h1>

          <p className="text-xl sm:text-2xl text-[#121316] font-medium leading-relaxed">
            {service.tagline}
          </p>

          <p className="text-base sm:text-lg text-[#666461] leading-relaxed max-w-3xl">
            {service.heroDescription}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenQuote(service.id)}
              className="btn-interactive-primary group inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold rounded-md shadow-xs"
            >
              <span>Get Estimate for {service.title}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>

            <Link
              href="/portfolio"
              className="btn-interactive-secondary group inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold rounded-md"
            >
              <span>View Related Projects</span>
            </Link>
          </div>
        </div>

        {/* Visual Service Mockup Showcase Carrier */}
        {service.image && (
          <div className="mb-20 rounded-2xl overflow-hidden border border-[#121316]/10 shadow-lg bg-neutral-100 aspect-[21/9] sm:aspect-[24/9] relative group">
            <img
              src={service.image}
              alt={service.imageAlt || `${service.title} in Quetta Pakistan`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white">
                <span className="text-[11px] font-mono uppercase tracking-wider bg-[#C25E34] px-2.5 py-1 rounded">
                  {service.eyebrow}
                </span>
                <p className="font-display text-lg sm:text-xl font-bold mt-1.5">
                  {service.title} · Engineered for Quetta & Nationwide Growth
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Problem & Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 sm:p-10 bg-white border border-[#121316]/10 rounded-lg space-y-3">
            <span className="text-xs uppercase tracking-wider text-rose-600 font-semibold">
              The Common Problem
            </span>
            <h2 className="font-display text-2xl font-bold text-[#121316]">
              Why Most Businesses Struggle
            </h2>
            <p className="text-sm text-[#666461] leading-relaxed">
              {service.problem}
            </p>
          </div>

          <div className="p-8 sm:p-10 bg-[#FAF8F5] border border-[#121316]/10 rounded-lg space-y-3">
            <span className="text-xs uppercase tracking-wider text-[#C25E34] font-semibold">
              The Haxudio Solution
            </span>
            <h2 className="font-display text-2xl font-bold text-[#121316]">
              How We Solve It For You
            </h2>
            <p className="text-sm text-[#121316] leading-relaxed">
              {service.solution}
            </p>
          </div>
        </div>

        {/* Benefits & Deliverables Dual Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Benefits (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121316]">
              Core Commercial Benefits
            </h2>
            <div className="space-y-3.5">
              {(service.benefits || []).map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C25E34] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#121316] leading-relaxed font-medium">
                    {b}
                  </span>
                </div>
              ))}
            </div>

            {service.localFocus && (
              <div className="p-4 bg-white border border-neutral-200 rounded-md text-xs text-[#666461] space-y-1">
                <span className="font-semibold text-[#121316] block">Local Quetta Relevance:</span>
                <p>{service.localFocus}</p>
              </div>
            )}
          </div>

          {/* Deliverables (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#121316]/10 p-8 rounded-lg space-y-5">
            <h2 className="font-display text-2xl font-bold text-[#121316]">
              What You Receive (Deliverables)
            </h2>
            <ul className="space-y-3 text-sm text-[#121316]">
              {(service.deliverables?.length ? service.deliverables : service.features || []).map((item) => (
                <li key={item} className="flex items-start gap-2.5 pb-2.5 border-b border-neutral-100 last:border-b-0 last:pb-0">
                  <span className="text-[#C25E34] font-bold text-xs pt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {service.techStack && service.techStack.length > 0 && (
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-xs uppercase tracking-wider text-[#666461] font-medium mb-2">
                  Technologies & Tools Applied
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {service.techStack.map((tech) => (
                    <span key={tech} className="font-mono bg-neutral-100 px-2.5 py-1 rounded text-[#121316]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4-Step Process for this Service */}
        {service.process && service.process.length > 0 && (
          <div className="mb-20">
            <SectionHeading
              eyebrow="Implementation Workflow"
              title={`Our Process for ${service.title}`}
              description="A transparent step-by-step roadmap to ensure timely, high-craft delivery."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.process.map((step) => (
                <div
                  key={step.step}
                  className="p-6 bg-[#FAF8F5] border border-[#121316]/10 rounded-lg space-y-3"
                >
                  <span className="font-mono text-xs font-bold text-[#C25E34]">
                    Step {step.step}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#121316]">
                    {step.name}
                  </h3>
                  <p className="text-xs text-[#666461] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="mb-20 max-w-4xl">
            <SectionHeading
              eyebrow="Common Questions"
              title="Frequently Asked Questions"
              description="Direct, transparent answers regarding timelines, deliverables, and requirements."
            />

            <div className="space-y-4">
              {service.faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="p-6 bg-white border border-[#121316]/10 rounded-lg space-y-2"
                >
                  <h3 className="font-display text-base font-bold text-[#121316] flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666461] leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Switcher / Navigation to other services */}
        <div className="pt-12 border-t border-[#121316]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#121316] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Capabilities</span>
          </Link>

          <button
            onClick={() => handleOpenQuote(service.slug || service.id)}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830]"
          >
            <span>Start a Project for {service.title}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
