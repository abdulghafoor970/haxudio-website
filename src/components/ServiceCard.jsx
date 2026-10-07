import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ImageReveal from './animations/ImageReveal';
import { getOptimizedImageUrl } from '../utils/cloudinary';

export default function ServiceCard({ service, featured = false }) {
  const serviceImageUrl = service.image ? getOptimizedImageUrl(service.image, { width: 768 }) : '';

  return (
    <article
      className={`group relative bg-white border border-[#121316]/10 rounded-xl overflow-hidden flex flex-col justify-between card-hover-fx h-full ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      <div>
        {/* Service Visual Preview Image Carrier with ImageReveal */}
        {serviceImageUrl && (
          <ImageReveal
            src={serviceImageUrl}
            alt={service.imageAlt || service.title}
            containerClassName="aspect-[16/10] bg-neutral-100 border-b border-[#121316]/8"
            className="transition-transform duration-700 ease-out group-hover:scale-108"
          >
            {/* Ambient subtle hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121316]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <span>Explore {service.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Service Eyebrow Badge Overlay */}
            <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-semibold text-[#121316] border border-[#121316]/10 shadow-xs z-10">
              {service.eyebrow}
            </div>
          </ImageReveal>
        )}

        {/* Content Box */}
        <div className="p-6 sm:p-7">
          {/* Eyebrow & Numbering if no image */}
          {!service.image && (
            <div className="flex items-center justify-between text-xs text-[#666461] mb-3">
              <span className="font-semibold text-[#C25E34] transition-colors group-hover:text-[#121316]">
                {service.eyebrow || 'Digital Capability'}
              </span>
              <span className="font-mono text-neutral-400 group-hover:text-[#121316] transition-colors">
                0{((service.id || service.slug || 'service').length % 9) + 1}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#121316] mb-2.5 group-hover:text-[#C25E34] transition-colors">
            <Link href={`/services/${service.slug}`} className="focus:outline-none">
              {service.title}
            </Link>
          </h3>

          {/* Tagline / Summary */}
          <p className="text-xs sm:text-sm text-[#666461] leading-relaxed mb-5 group-hover:text-[#121316]/80 transition-colors">
            {service.shortDescription}
          </p>

          {/* Key Deliverables (Separated by dot, zero pills!) */}
          {((service.deliverables && service.deliverables.length > 0) || (service.features && service.features.length > 0)) && (
            <div className="pt-3.5 border-t border-neutral-100 mb-5">
              <p className="text-[11px] uppercase tracking-wider text-[#666461] font-semibold mb-2">
                Key Deliverables
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#121316]/80">
                {(service.deliverables?.length ? service.deliverables : service.features).slice(0, 3).map((item, idx, arr) => (
                  <React.Fragment key={item + idx}>
                    <span className="transition-colors group-hover:text-[#121316]">{item}</span>
                    {idx < arr.length - 1 && <span className="text-neutral-300" aria-hidden="true">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-6 pb-6 pt-0 sm:px-7 sm:pb-7 flex items-center justify-between">
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121316] group-hover:text-[#C25E34] transition-colors"
        >
          <span>Explore Service</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
        <span className="text-[11px] text-[#666461]">Quetta & Nationwide</span>
      </div>
    </article>
  );
}
