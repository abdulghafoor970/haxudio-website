'use client';

import React from 'react';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import ProcessTimeline from '../components/ProcessTimeline';
import { PROCESS_STEPS } from '../data/process';
import { PAGE_SEO } from '../data/seo';
import { useModal } from '../context/ModalContext';
import { CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function ProcessPage({ onOpenQuote }) {
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;
  return (
    <>
      <SEOHead
        title={PAGE_SEO.process.title}
        description={PAGE_SEO.process.description}
        canonical="https://www.haxudio.com/process"
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="max-w-4xl space-y-5 mb-16">
          <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
            Methodology & Standards
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            How We Turn Ideas into Reliable Digital Systems.
          </h1>
          <p className="text-lg text-[#666461] leading-relaxed">
            Our 7-step engineering and design workflow eliminates surprises. We combine upfront
            business discovery and wireframe architecture with rigorous quality assurance and
            long-term growth tracking.
          </p>
        </div>

        {/* Interactive Process Timeline Component */}
        <div className="mb-24">
          <ProcessTimeline />
        </div>

        {/* Quality Checkpoints & Guarantees */}
        <div className="bg-white border border-[#121316]/10 rounded-xl p-8 sm:p-12 mb-20">
          <SectionHeading
            eyebrow="Verification & Integrity"
            title="Quality Standards Embedded in Every Step."
            description="Our delivery contracts ensure complete client transparency and architectural excellence."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#FAF8F5] border border-neutral-200 rounded-lg space-y-3">
              <ShieldCheck className="w-5 h-5 text-[#C25E34]" />
              <h3 className="font-display text-lg font-bold text-[#121316]">
                Code Transparency
              </h3>
              <p className="text-xs text-[#666461] leading-relaxed">
                You receive access to your staging repository and clean documentation.
                There are no proprietary lock-ins or hidden dependencies.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-neutral-200 rounded-lg space-y-3">
              <CheckCircle2 className="w-5 h-5 text-[#C25E34]" />
              <h3 className="font-display text-lg font-bold text-[#121316]">
                Mobile 4G Performance
              </h3>
              <p className="text-xs text-[#666461] leading-relaxed">
                Every screen is tested under simulated 3G/4G bandwidth constraints common
                in Balochistan to ensure rapid loading without layout stutter.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-neutral-200 rounded-lg space-y-3">
              <ShieldCheck className="w-5 h-5 text-[#C25E34]" />
              <h3 className="font-display text-lg font-bold text-[#121316]">
                Technical SEO Audits
              </h3>
              <p className="text-xs text-[#666461] leading-relaxed">
                Before launch, we verify Schema.org JSON-LD structured data, mobile viewport tags,
                and crawlability through Google Search Console.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-xl mx-auto space-y-5">
          <h2 className="font-display text-3xl font-bold text-[#121316]">
            Ready to Begin Phase 01: Discover?
          </h2>
          <p className="text-sm text-[#666461]">
            Schedule an initial consultation with our Quetta engineering team to map out your requirements.
          </p>
          <button
            onClick={() => handleOpenQuote()}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] transition-colors"
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
