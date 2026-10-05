'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import Hero from '../components/Hero';
import PremiumMarquee from '../components/PremiumMarquee';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import ProjectCard from '../components/ProjectCard';
import LocalTrustBanner from '../components/LocalTrustBanner';
import CoFoundersSlider from '../components/CoFoundersSlider';
import LocationMapCard from '../components/LocationMapCard';
import { SERVICES } from '../data/services';
import { PROJECTS } from '../data/projects';
import { TESTIMONIALS } from '../data/testimonials';
import { BLOG_POSTS } from '../data/blog';
import { PAGE_SEO } from '../data/seo';
import { fetchPublicServices } from '../services/serviceApi';
import { fetchPublicProjects } from '../services/projectApi';
import { fetchPublicTestimonials } from '../services/testimonialApi';
import { fetchPublicContent } from '../services/contentApi';
import { useModal } from '../context/ModalContext';
import { useSettings } from '../context/SettingsContext';
import { BRAND } from '../data/navigation';
import { ArrowUpRight, ArrowRight, Shield, Sparkles, CheckCircle2, MapPin } from 'lucide-react';

// Animation primitives
import ScrollReveal from '../components/animations/ScrollReveal';
import TextReveal from '../components/animations/TextReveal';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import MagneticButton from '../components/animations/MagneticButton';
import Parallax from '../components/animations/Parallax';

export default function HomePage({ onOpenQuote, onSelectProject }) {
  const modal = useModal();
  const { settings } = useSettings();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;
  const handleSelectProject = onSelectProject || modal.openProjectModal;

  // Initialize with initial dynamic state; audit ensures CMS overrides bundled data
  const [servicesList, setServicesList] = useState(SERVICES);
  const [projectsList, setProjectsList] = useState(PROJECTS);
  const [testimonialsList, setTestimonialsList] = useState(TESTIMONIALS);
  const [homeContent, setHomeContent] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [dynamicServices, dynamicProjects, dynamicTestimonials, dynamicContent] = await Promise.allSettled([
          fetchPublicServices(),
          fetchPublicProjects(),
          fetchPublicTestimonials(),
          fetchPublicContent('home'),
        ]);
        if (isMounted) {
          if (dynamicServices.status === 'fulfilled' && Array.isArray(dynamicServices.value)) {
            setServicesList(dynamicServices.value);
          }
          if (dynamicProjects.status === 'fulfilled' && Array.isArray(dynamicProjects.value)) {
            setProjectsList(dynamicProjects.value);
          }
          if (dynamicTestimonials.status === 'fulfilled' && Array.isArray(dynamicTestimonials.value)) {
            setTestimonialsList(dynamicTestimonials.value);
          }
          if (dynamicContent.status === 'fulfilled' && dynamicContent.value?.sections) {
            // Normalize section keys to lowercase for flexible access
            const normalized = {};
            for (const [key, val] of Object.entries(dynamicContent.value.sections)) {
              normalized[key.toLowerCase()] = val.content || {};
            }
            setHomeContent(normalized);
          }
        }
      } catch (err) {
        console.warn('[HomePage] Error loading dynamic data:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredServices = servicesList.slice(0, 6);
  // Sort featured projects: prioritizes featured=true, then displayOrder
  const featuredProjects = projectsList
    .filter((p) => p.featured)
    .concat(projectsList.filter((p) => !p.featured))
    .slice(0, 3);
  const latestArticles = BLOG_POSTS.slice(0, 3);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': 'https://www.haxudio.com/#organization',
        name: settings.business?.businessName || BRAND.name || 'Haxudio Digital Solutions',
        alternateName: 'Haxudio',
        url: 'https://www.haxudio.com/',
        logo: 'https://www.haxudio.com/og-image.jpg',
        image: 'https://www.haxudio.com/og-image.jpg',
        description:
          settings.business?.description ||
          'A modern digital solutions agency based in Quetta, Balochistan. We engineer high-performance web systems, brand identities, SEO architecture, and growth strategies for ambitious businesses across Pakistan.',
        telephone: settings.contact?.phone || '+92 318 3690179',
        email: settings.contact?.primaryEmail || 'hello@haxudio.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings.contact?.streetAddress || 'A1 City, Hazara Town, Brewery Road',
          addressLocality: settings.contact?.city || 'Quetta',
          addressRegion: settings.contact?.region || 'Balochistan',
          addressCountry: 'PK',
        },
        hasMap: settings.contact?.mapUrl || 'https://share.google/zFaaZlrDoY9v7zIEZ',
        areaServed: [
          { '@type': 'City', name: 'Quetta' },
          { '@type': 'State', name: 'Balochistan' },
          { '@type': 'Country', name: 'Pakistan' },
        ],
        sameAs: [
          settings.social?.instagram || 'https://www.instagram.com/haxudio/',
          settings.social?.facebook || 'https://www.facebook.com/haxudio/',
          settings.social?.linkedin || 'https://www.linkedin.com/company/haxudio/',
          settings.social?.x || 'https://x.com/haxudio',
          settings.contact?.mapUrl || 'https://share.google/zFaaZlrDoY9v7zIEZ',
        ].filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.haxudio.com/#website',
        url: 'https://www.haxudio.com/',
        name: 'Haxudio Digital Solutions',
        publisher: {
          '@id': 'https://www.haxudio.com/#organization',
        },
      },
    ],
  };

  return (
    <>
      <SEOHead
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        canonical="https://www.haxudio.com/"
        image="https://www.haxudio.com/og-image.jpg"
        jsonLd={organizationJsonLd}
      />

      {/* 1. Hero Section with Cinematic Reveals */}
      <Hero content={homeContent.hero} onOpenQuote={handleOpenQuote} />

      {/* 2. Premium Moving Services Strip (Dual Direction Infinite Loop) */}
      <PremiumMarquee showDualStrip={true} variant="light" className="my-2" />

      {/* 3. Positioning / Agency Guarantee */}
      <section className="border-y border-[#121316]/10 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <ScrollReveal direction="up" distance={16} delay={0.1}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
                  {homeContent.guarantee?.eyebrow || 'Our Guarantee'}
                </span>
                <p className="font-display text-lg sm:text-xl font-bold text-[#121316]">
                  {homeContent.guarantee?.heading || 'Modern engineering tailored for Balochistan and expanding across Pakistan.'}
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs text-[#666461] shrink-0">
                <span className="flex items-center gap-1.5 text-[#121316] font-medium">
                  <Shield className="w-4 h-4 text-[#C25E34]" />
                  <span>{homeContent.guarantee?.badge1 || 'Zero Vulnerable Plugins'}</span>
                </span>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 text-[#121316] font-medium">
                  <Sparkles className="w-4 h-4 text-[#C25E34]" />
                  <span>{homeContent.guarantee?.badge2 || 'Sub-Second Page Speeds'}</span>
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Core Capabilities / Services (Staggered Grid) */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <ScrollReveal direction="up" distance={24} className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider mb-2">
                <span>01. Core Capabilities</span>
              </div>
              <TextReveal
                tag="h2"
                text="Digital Services Engineered for Real Growth."
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121316] leading-[1.12]"
              />
              <p className="text-base text-[#666461] leading-relaxed max-w-2xl mt-3">
                We combine engineering rigor, editorial design, and search expertise to build platforms that elevate your commercial presence.
              </p>
            </div>
            <Link
              href="/services"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-[#121316] hover:text-[#C25E34] transition-colors shrink-0"
            >
              <span>View All 9 Capabilities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service, index) => (
            <StaggerItem key={service._id || service.slug || service.id || `featured-srv-${index}`}>
              <ServiceCard
                service={service}
                featured={index === 0}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 5. Selected Work / Case Studies */}
      <section className="py-24 bg-[#F4F1EA] border-y border-[#121316]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <ScrollReveal direction="up" distance={24} className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider mb-2">
                  <span>02. Featured Case Studies</span>
                </div>
                <TextReveal
                  tag="h2"
                  text="Built for Purpose. Validated by Real Delivery."
                  className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121316] leading-[1.12]"
                />
                <p className="text-base text-[#666461] leading-relaxed max-w-2xl mt-3">
                  Explore selected showcase projects demonstrating how we help healthcare centers, regional artisans, and hospitality brands grow in Quetta and nationwide.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3 shrink-0">
                <MagneticButton strength={0.2} maxOffset={5}>
                  <Link
                    href="/portfolio"
                    className="btn-interactive-primary group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-md shadow-xs"
                  >
                    <span>Explore All Services</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.15} maxOffset={4}>
                  <Link
                    href="/portfolio"
                    className="btn-interactive-secondary group inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-md"
                  >
                    <span>View All Projects</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>

          {/* 3 Featured Projects Showcase Grid with Stagger */}
          <StaggerContainer stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <StaggerItem key={project.id || project._id || project.slug || `featured-proj-${index}`}>
                <ProjectCard
                  project={project}
                  onSelect={handleSelectProject}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Quick Action Bar to Explore All Services & Projects */}
          <ScrollReveal direction="up" distance={16} delay={0.2} className="mt-10">
            <div className="p-5 bg-white border border-[#121316]/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-fx">
              <div className="space-y-1">
                <p className="font-display text-sm sm:text-base font-bold text-[#121316]">
                  Need a custom digital system or brand identity for your business?
                </p>
                <p className="text-xs text-[#666461]">
                  Browse our complete portfolio of web applications, branding, and digital marketing services.
                </p>
              </div>
              <MagneticButton strength={0.15} maxOffset={5}>
                <Link
                  href="/portfolio"
                  className="btn-interactive-primary group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-md whitespace-nowrap"
                >
                  <span>Explore All Services</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>

          {/* Co-Founders Round Slider (Sliding left-to-right every 3 seconds) */}
          <ScrollReveal direction="up" distance={20} delay={0.1}>
            <CoFoundersSlider />
          </ScrollReveal>

          {/* Grounded Client Voices (Staggered Testimonials) */}
          <StaggerContainer stagger={0.08} className="mt-16 pt-16 border-t border-[#121316]/10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsList.map((t, index) => {
              const quoteText = t.quote || t.testimonial || '';
              const authorName = t.author || t.name || 'Client';
              const roleTitle = t.role || t.position || 'Executive';
              const companyName = t.organization || t.company || '';

              return (
                <StaggerItem key={t._id || t.id || `testimonial-${index}`}>
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-[#121316] italic leading-relaxed">
                      "{quoteText}"
                    </p>
                    <div className="text-xs text-[#666461]">
                      <p className="font-semibold text-[#121316]">{authorName}</p>
                      <p>{roleTitle}{companyName ? ` · ${companyName}` : ''}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 6. Mid-Page Editorial Dark Marquee Transition Strip */}
      <PremiumMarquee showDualStrip={false} variant="dark" />

      {/* 7. Dedicated Local Authority: Digital Solutions in Quetta, Balochistan */}
      <section className="py-20 bg-white border-b border-[#121316]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <ScrollReveal direction="up" distance={24} className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>{homeContent.agencyintro?.eyebrow || 'Local Authority · Quetta, Balochistan'}</span>
              </div>
              <TextReveal
                tag="h2"
                text={homeContent.agencyintro?.heading || 'Digital Solutions in Quetta, Balochistan'}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121316] leading-[1.15] text-balance"
              />
              <p className="text-base sm:text-lg text-[#666461] leading-relaxed">
                {homeContent.agencyintro?.description || 'From Quetta to businesses across Pakistan, Haxudio Digital Solutions provides modern digital services designed to help businesses establish, improve, and grow their online presence. We work with startups, retailers, restaurants, hotels, professional services, and other businesses looking to strengthen their digital presence.'}
              </p>
              <p className="text-sm text-[#666461] leading-relaxed">
                Whether you need a full-scale web development company in Quetta, an SEO agency to improve your Google search rankings, or a dedicated digital marketing partner in Pakistan, our team combines engineering rigor with creative precision to deliver measurable commercial results.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200/80">
                  <h3 className="font-bold text-sm text-[#121316] mb-1">Local Quetta Focus</h3>
                  <p className="text-xs text-[#666461] leading-relaxed">
                    Custom web engineering, Google Business Profile local 3-pack dominance, and regional branding tailored for Balochistan businesses.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200/80">
                  <h3 className="font-bold text-sm text-[#121316] mb-1">Nationwide Delivery</h3>
                  <p className="text-xs text-[#666461] leading-relaxed">
                    High-performance Next.js architectures, nationwide digital marketing campaigns, and business automation across Pakistan.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <MagneticButton strength={0.15} maxOffset={5}>
                  <Link
                    href="/services"
                    className="btn-interactive-primary group inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold rounded-md shadow-xs"
                  >
                    <span>Explore All Services</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.15} maxOffset={5}>
                  <Link
                    href={homeContent.agencyintro?.ctaUrl || '/contact'}
                    className="btn-interactive-secondary group inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold rounded-md"
                  >
                    <span>{homeContent.agencyintro?.ctaLabel || 'Contact Quetta Office'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            <div className="lg:col-span-5 relative">
              <Parallax offset={16}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#121316]/10 shadow-lg bg-neutral-100 group">
                  <img
                    src={homeContent.agencyintro?.hubImageUrl || '/src/assets/images/haxudio_quetta_hub_1790427878986.jpg'}
                    alt="Haxudio Digital Solutions digital agency headquarters in Quetta Balochistan"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                    <div className="text-white">
                      <span className="text-[11px] font-mono uppercase tracking-wider bg-[#C25E34] px-2 py-0.5 rounded">
                        Quetta Engineering Hub
                      </span>
                      <p className="font-display text-base font-bold mt-1">
                        {homeContent.agencyintro?.hubImageCaption || 'Serving Balochistan & Pakistan'}
                      </p>
                    </div>
                  </div>
                </div>
              </Parallax>
            </div>
          </div>

          {/* Interactive Location Map Card with Google Business Profile & ScrollReveal */}
          <ScrollReveal direction="up" distance={20} delay={0.15}>
            <LocationMapCard className="mt-12" />
          </ScrollReveal>
        </div>
      </section>

      {/* 8. Local Trust & Regional Roots Banner */}
      <LocalTrustBanner />

      {/* 9. Latest Digital Insights from Blog with Staggered Entrance */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
        <ScrollReveal direction="up" distance={20} className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider mb-2">
                <span>04. Insights & Guides</span>
              </div>
              <TextReveal
                tag="h2"
                text="Actionable Guides for Local Commerce."
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121316] leading-[1.12]"
              />
              <p className="text-base text-[#666461] leading-relaxed max-w-2xl mt-3">
                Read our latest perspectives on web technology, SEO in Pakistan, and digital growth in Balochistan.
              </p>
            </div>
            <Link
              href="/blog"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-[#121316] hover:text-[#C25E34] transition-colors shrink-0"
            >
              <span>Browse All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestArticles.map((article, index) => (
            <StaggerItem key={article.id || article.slug || `article-${index}`}>
              <article className="group bg-white border border-[#121316]/10 rounded-lg p-6 sm:p-7 flex flex-col justify-between hover:border-[#121316]/30 transition-all hover:shadow-md h-full">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#666461] mb-3">
                    <span className="font-semibold text-[#C25E34]">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#121316] mb-3 group-hover:text-[#C25E34] transition-colors leading-snug">
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666461] leading-relaxed line-clamp-3 mb-6">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-[#666461]">{article.publishedDate}</span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="font-semibold text-[#121316] group-hover:text-[#C25E34] inline-flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 10. Conversion Section with Cinematic Contrast */}
      <section className="bg-[#121316] text-[#FAF8F5] py-20 md:py-28 my-12 border-y border-[#121316]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <ScrollReveal direction="down" distance={16}>
            <p className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
              {homeContent.finalcta?.eyebrow || "Let's Work Together"}
            </p>
          </ScrollReveal>

          <TextReveal
            tag="h2"
            text={homeContent.finalcta?.heading || "Have a Project in Mind? Let's Build Something Meaningful."}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance leading-tight text-white"
          />

          <ScrollReveal direction="up" distance={20} delay={0.2}>
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {homeContent.finalcta?.description || 'Whether you need a custom corporate website, a brand identity refresh, or a targeted search engine campaign in Quetta, our engineers and designers are ready to assist.'}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" distance={20} delay={0.3}>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.2} maxOffset={6}>
                {homeContent.finalcta?.buttonUrl && homeContent.finalcta?.buttonUrl !== '/contact' ? (
                  <Link
                    href={homeContent.finalcta.buttonUrl}
                    className="btn-interactive-primary group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-md shadow-sm active:scale-[0.98]"
                  >
                    <span>{homeContent.finalcta?.buttonLabel || 'Start a Project'}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                ) : (
                  <button
                    onClick={handleOpenQuote}
                    className="btn-interactive-primary group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-md shadow-sm active:scale-[0.98]"
                  >
                    <span>{homeContent.finalcta?.buttonLabel || 'Start a Project'}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                )}
              </MagneticButton>

              <MagneticButton strength={0.15} maxOffset={5}>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white border border-white/20 rounded-md hover:border-white hover:bg-white/10 transition-all duration-300 active:scale-[0.98]"
                >
                  <span>Contact Quetta Office</span>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
