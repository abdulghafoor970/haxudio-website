import React from 'react';

/**
 * Editorial section heading following anti-slop rules with title animations:
 * - Natural human editorial numbering
 * - Balanced headline prose (text-wrap: balance)
 * - Smooth entrance animations
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  alignment = 'left',
  className = '',
}) {
  const isCentered = alignment === 'center';

  return (
    <div className={`space-y-3 mb-12 md:mb-16 animate-fade-up ${isCentered ? 'text-center max-w-2xl mx-auto' : 'max-w-3xl'} ${className}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold transition-all">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#121316] leading-[1.15] text-balance transition-all hover:tracking-normal">
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-[#666461] leading-relaxed pt-1 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
