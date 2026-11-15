'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { HAXUDIO_SOCIALS } from '../data/socials';
import { SocialIcons } from './CoFoundersSlider';
import TextReveal from './animations/TextReveal';
import ScrollReveal from './animations/ScrollReveal';
import Parallax from './animations/Parallax';
import MagneticButton from './animations/MagneticButton';
import { StaggerContainer, StaggerItem } from './animations/StaggerContainer';
import { getOptimizedImageUrl, getCloudinarySrcSet, RESPONSIVE_SIZES } from '../utils/cloudinary';

export default function Hero({ onOpenQuote, content = {} }) {
  const [hoveredMetric, setHoveredMetric] = useState(null);

  const eyebrow = content?.eyebrow || 'Quetta, Balochistan · Digital Solutions Agency';
  const heading = content?.heading || 'Digital Solutions That Help Your Business Grow.';
  const description =
    content?.description ||
    'Haxudio Digital Solutions is a Quetta-based digital agency helping businesses across Balochistan and Pakistan build stronger digital brands through web development, digital marketing, SEO, branding, design, and modern technology solutions.';
  const primaryCtaLabel = content?.primaryCtaLabel || 'Start a Project';
  const primaryCtaUrl = content?.primaryCtaUrl || '';
  const secondaryCtaLabel = content?.secondaryCtaLabel || 'Explore Our Services';
  const secondaryCtaUrl = content?.secondaryCtaUrl || '/services';
  const heroImageUrl = content?.heroImageUrl || '/src/assets/images/hero_agency_studio_1790427835770.webp';
  const heroImageAlt = content?.heroImageAlt || 'Haxudio Digital Solutions digital agency studio in Quetta';
  const isCloudinaryHero = heroImageUrl.includes('res.cloudinary.com');

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background ambient lighting accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#C25E34]/8 to-amber-200/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Messaging (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow / Region Indicator with preserved #D5FF8A pill */}
            <ScrollReveal direction="down" distance={12} delay={0}>
              <div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 md:px-6 md:py-2.5 rounded-full bg-[#D5FF8A] text-[#111111] font-bold text-[11px] sm:text-xs md:text-[13px] tracking-[0.10em] sm:tracking-[0.15em] md:tracking-[0.18em] uppercase max-w-full text-balance leading-normal">
                <span>{eyebrow}</span>
              </div>
            </ScrollReveal>

            {/* Main Headline with Editorial Line-by-Line TextReveal (LCP Priority) */}
            <TextReveal
              tag="h1"
              text={heading}
              priority={true}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold text-[#121316] tracking-tight leading-[1.08] text-balance"
              delay={0}
              stagger={0.025}
            />

            {/* Supporting Copy (Natural Human Phrasing) with ScrollReveal */}
            <ScrollReveal direction="up" distance={16} delay={0.05}>
              <p className="text-base sm:text-lg md:text-xl text-[#666461] leading-relaxed max-w-2xl font-normal">
                {description}
              </p>
            </ScrollReveal>

            {/* CTA Buttons with Magnetic Pull + Stagger */}
            <ScrollReveal direction="up" distance={16} delay={0.1}>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <MagneticButton strength={0.2} maxOffset={6}>
                  {primaryCtaUrl && primaryCtaUrl !== '/contact' ? (
                    <Link
                      href={primaryCtaUrl}
                      className="btn-interactive-primary group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-md shadow-sm whitespace-nowrap active:scale-[0.98]"
                    >
                      <span>{primaryCtaLabel}</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenQuote?.()}
                      className="btn-interactive-primary group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-md shadow-sm whitespace-nowrap active:scale-[0.98] cursor-pointer"
                    >
                      <span>{primaryCtaLabel}</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </button>
                  )}
                </MagneticButton>

                <MagneticButton strength={0.15} maxOffset={5}>
                  <Link
                    href={secondaryCtaUrl}
                    className="btn-interactive-secondary group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-md whitespace-nowrap active:scale-[0.98]"
                  >
                    <span>{secondaryCtaLabel}</span>
                    <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Social Media Channels with Official Haxudio Links */}
            <ScrollReveal direction="up" distance={12} delay={0.15}>
              <div className="pt-2 flex items-center gap-3 text-xs text-[#666461]">
                <span className="font-semibold text-[#121316]">Follow Haxudio:</span>
                <SocialIcons
                  socials={{
                    linkedin: HAXUDIO_SOCIALS.linkedin,
                    x: HAXUDIO_SOCIALS.x,
                    instagram: HAXUDIO_SOCIALS.instagram,
                    facebook: HAXUDIO_SOCIALS.facebook,
                  }}
                  className="w-4 h-4"
                />
              </div>
            </ScrollReveal>

            {/* Grounded Agency Attributes: Staggered Micro-Cards */}
            <StaggerContainer
              stagger={0.06}
              delay={0.2}
              className="pt-6 border-t border-[#121316]/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"
            >
              {/* Card 1 */}
              <StaggerItem>
                <div
                  onMouseEnter={() => setHoveredMetric(1)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  className={`p-3.5 rounded-lg border transition-all duration-300 cursor-default ${
                    hoveredMetric === 1
                      ? 'bg-white border-[#C25E34]/40 shadow-md -translate-y-1'
                      : 'bg-white/50 border-[#121316]/8 hover:border-[#121316]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-lg md:text-xl font-bold text-[#121316]">
                      Full-Stack
                    </span>
                    <Zap className={`w-3.5 h-3.5 transition-colors duration-300 ${hoveredMetric === 1 ? 'text-[#C25E34]' : 'text-neutral-400'}`} />
                  </div>
                  <span className="text-xs text-[#666461] block leading-tight">
                    Engineering & Design
                  </span>
                </div>
              </StaggerItem>

              {/* Card 2 */}
              <StaggerItem>
                <div
                  onMouseEnter={() => setHoveredMetric(2)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  className={`p-3.5 rounded-lg border transition-all duration-300 cursor-default ${
                    hoveredMetric === 2
                      ? 'bg-white border-[#C25E34]/40 shadow-md -translate-y-1'
                      : 'bg-white/50 border-[#121316]/8 hover:border-[#121316]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-lg md:text-xl font-bold text-[#121316]">
                      Quetta Hub
                    </span>
                    <Sparkles className={`w-3.5 h-3.5 transition-colors duration-300 ${hoveredMetric === 2 ? 'text-[#C25E34]' : 'text-neutral-400'}`} />
                  </div>
                  <span className="text-xs text-[#666461] block leading-tight">
                    Nationwide Delivery
                  </span>
                </div>
              </StaggerItem>

              {/* Card 3 */}
              <StaggerItem>
                <div
                  onMouseEnter={() => setHoveredMetric(3)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  className={`p-3.5 rounded-lg border transition-all duration-300 cursor-default ${
                    hoveredMetric === 3
                      ? 'bg-white border-[#C25E34]/40 shadow-md -translate-y-1'
                      : 'bg-white/50 border-[#121316]/8 hover:border-[#121316]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-lg md:text-xl font-bold text-[#121316]">
                      100% Own
                    </span>
                    <ShieldCheck className={`w-3.5 h-3.5 transition-colors duration-300 ${hoveredMetric === 3 ? 'text-[#C25E34]' : 'text-neutral-400'}`} />
                  </div>
                  <span className="text-xs text-[#666461] block leading-tight">
                    Code & Asset Handover
                  </span>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Right Column: Hero Visual Showcase (5 cols) with Parallax */}
          <div className="lg:col-span-5 relative">
            <Parallax offset={20}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Outer decorative halo ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#C25E34]/20 via-transparent to-[#121316]/10 rounded-xl blur-sm -z-10" />

                {/* Main LCP Hero Image Carrier */}
                <div className="rounded-xl border border-[#121316]/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] bg-neutral-100 overflow-hidden relative group aspect-[4/3]">
                  {isCloudinaryHero ? (
                    <img
                      src={getOptimizedImageUrl(heroImageUrl, { width: 960 })}
                      srcSet={getCloudinarySrcSet(heroImageUrl, [480, 768, 960, 1200]) || undefined}
                      sizes={RESPONSIVE_SIZES.hero}
                      alt={heroImageAlt}
                      width="1376"
                      height="768"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <picture>
                      <source
                        type="image/webp"
                        media="(max-width: 767px)"
                        srcSet="/src/assets/images/hero_agency_studio_mobile.webp"
                      />
                      <source
                        type="image/webp"
                        media="(min-width: 768px)"
                        srcSet="/src/assets/images/hero_agency_studio_1790427835770.webp"
                      />
                      <img
                        src="/src/assets/images/hero_agency_studio_1790427835770.webp"
                        alt={heroImageAlt}
                        width="1376"
                        height="768"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </picture>
                  )}
                  {/* Subtle sheen gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121316]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Offset Editorial Tag Card with Floating Animation */}
                <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-[#FAF8F5] border border-[#121316]/10 p-4 rounded-md shadow-lg max-w-[260px] hidden sm:block animate-float-slow card-hover-fx">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#121316] mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E34]" />
                    <span>Crafted for Growth</span>
                  </div>
                  <p className="text-[11px] text-[#666461] leading-snug">
                    Modern digital systems replacing sluggish templates with custom Next.js speed.
                  </p>
                </div>
              </div>
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
