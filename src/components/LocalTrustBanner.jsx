import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { BRAND } from '../data/navigation';

export default function LocalTrustBanner() {
  return (
    <section className="bg-[#FAF8F5] border-y border-[#121316]/10 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Headquartered in Quetta · Serving All of Pakistan</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121316] tracking-tight">
              A High-Standards Digital Partner for Ambitious Local Businesses.
            </h2>
            <p className="text-sm sm:text-base text-[#666461] leading-relaxed max-w-2xl">
              We bridge the gap between regional craftsmanship and world-class digital standards.
              Whether you are an established Quetta medical practice, a commercial agricultural distributor,
              or an emerging retail brand expanding to Karachi and Islamabad, we engineer systems that scale.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#121316]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C25E34]" />
                <span>Zero bloated templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#C25E34]" />
                <span>High-speed Next.js frontends</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C25E34]" />
                <span>In-person strategy in Quetta</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <Link
              href="/locations/quetta"
              className="inline-flex items-center justify-between p-4 bg-white border border-[#121316]/10 rounded-lg hover:border-[#121316]/40 transition-colors group"
            >
              <div>
                <p className="text-xs text-[#666461]">Learn about our</p>
                <p className="font-display text-sm font-bold text-[#121316]">
                  Quetta & Balochistan Solutions
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#121316] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-between p-4 bg-[#121316] text-[#FAF8F5] rounded-lg hover:bg-[#252830] transition-colors group"
            >
              <div>
                <p className="text-xs text-neutral-400">Ready to speak?</p>
                <p className="font-display text-sm font-bold text-white">
                  Schedule a Consultation
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
