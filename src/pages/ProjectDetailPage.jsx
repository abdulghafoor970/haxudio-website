'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SEOHead from '../components/SEOHead';
import { fetchPublicProjectBySlug } from '../services/projectApi';
import { useModal } from '../context/ModalContext';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, Globe, Layers, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/cloudinary';

export default function ProjectDetailPage({ slug: propSlug, onOpenQuote }) {
  const urlParams = useParams();
  const slug = propSlug || urlParams?.slug;
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProject() {
      if (!slug) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }
      setIsLoading(true);
      setNotFound(false);

      try {
        const data = await fetchPublicProjectBySlug(slug);
        if (!isMounted) return;
        if (data && data.isPublished !== false) {
          setProject(data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.warn('[ProjectDetailPage] Error loading project:', err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProject();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-40 pb-32 text-center max-w-lg mx-auto px-6 space-y-4">
        <span className="font-mono text-xs text-[#C25E34]">Loading Case Study...</span>
        <div className="w-8 h-8 border-2 border-[#C25E34] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <>
        <SEOHead
          title="Case Study Not Found | Haxudio Digital Solutions"
          description="The requested portfolio case study could not be found or has been moved."
          noindex={true}
          robotsContent="noindex, follow"
        />
        <div className="pt-40 pb-32 text-center max-w-lg mx-auto px-6 space-y-4">
          <span className="font-mono text-xs font-bold text-[#C25E34]">404 Not Found</span>
          <h1 className="font-display text-3xl font-bold text-[#121316]">Case Study Not Found</h1>
          <p className="text-sm text-[#666461]">
            The project you are looking for has either been moved, unpublished, or does not exist.
          </p>
          <div className="pt-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Portfolio</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const imageUrl = project.coverImage || project.image || '/src/assets/images/hero_agency_studio_1790427835770.webp';
  const summaryText = project.shortDescription || project.summary || project.description || '';
  const outcomeText = project.results || project.outcome || '';
  const deliverablesList = Array.isArray(project.deliverables) ? project.deliverables : [];
  const technologiesList = Array.isArray(project.technologies) ? project.technologies : [];
  const servicesList = Array.isArray(project.services) ? project.services : [];
  const galleryImages = Array.isArray(project.images) ? project.images : [];
  const liveLink = project.liveUrl || project.projectUrl;

  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        name: project.title,
        headline: project.title,
        description: summaryText,
        image: imageUrl,
        creator: {
          '@type': 'LocalBusiness',
          name: 'Haxudio Digital Solutions',
          url: 'https://www.haxudio.com/',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'A1 City, Hazara Town, Brewery Road',
            addressLocality: 'Quetta',
            addressRegion: 'Balochistan',
            addressCountry: 'PK',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.haxudio.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Portfolio',
            item: 'https://www.haxudio.com/portfolio',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: project.title,
            item: `https://www.haxudio.com/portfolio/${project.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <SEOHead
        title={project.seoTitle || `${project.title} | Case Study | Haxudio Digital Solutions`}
        description={project.seoDescription || summaryText}
        canonical={`https://www.haxudio.com/portfolio/${project.slug}`}
        image={imageUrl}
        jsonLd={projectJsonLd}
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#666461] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#121316]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/portfolio" className="hover:text-[#121316]">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#121316] font-medium truncate max-w-xs">{project.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl space-y-4 mb-12">
          <div className="flex items-center gap-2 text-xs text-[#C25E34] font-semibold uppercase tracking-wider">
            <span>{project.category || 'Portfolio'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#666461]">{project.industry || 'Commercial Enterprise'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#666461]">{project.year || project.completionDate || '2025'}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            {project.title}
          </h1>

          <p className="text-lg text-[#666461] leading-relaxed max-w-3xl">
            {summaryText}
          </p>
        </div>

        {/* Hero Cover Image Banner */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-16 border border-[#121316]/10 shadow-lg bg-neutral-900">
          <img
            src={getOptimizedImageUrl(imageUrl, { width: 1200 })}
            alt={project.coverImageAlt || `${project.title} Case Study Preview`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121316]/80 via-transparent to-transparent flex items-end p-6 sm:p-10">
            <div className="text-white space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#C25E34]">Client / Location</span>
              <p className="text-base sm:text-lg font-semibold">
                {project.client || project.clientType || 'Corporate Client'} — {project.location || 'Quetta, Balochistan'}
              </p>
            </div>
          </div>
        </div>

        {/* Project Narrative (Overview) */}
        {project.description && (
          <div className="max-w-4xl mb-16 space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#121316]">
              Project Background & Scope
            </h2>
            <p className="text-base text-[#121316]/80 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>
        )}

        {/* Challenge & Solution Dual Column */}
        {(project.challenge || project.solution) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {project.challenge && (
              <div className="p-8 bg-white border border-[#121316]/10 rounded-xl space-y-3">
                <span className="font-mono text-xs uppercase font-bold text-rose-500">
                  The Problem & Bottleneck
                </span>
                <h3 className="font-display text-xl font-bold text-[#121316]">
                  The Challenge
                </h3>
                <p className="text-sm text-[#666461] leading-relaxed">
                  {project.challenge}
                </p>
              </div>
            )}

            {project.solution && (
              <div className="p-8 bg-[#FAF8F5] border border-[#C25E34]/20 rounded-xl space-y-3">
                <span className="font-mono text-xs uppercase font-bold text-[#C25E34]">
                  Haxudio Engineering & Design
                </span>
                <h3 className="font-display text-xl font-bold text-[#121316]">
                  The Solution
                </h3>
                <p className="text-sm text-[#121316] leading-relaxed">
                  {project.solution}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Deliverables & Measurable Outcome */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Deliverables List (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#121316]/10 rounded-xl p-8 space-y-5">
            <h3 className="font-display text-2xl font-bold text-[#121316]">
              Verified Deliverables
            </h3>
            {deliverablesList.length > 0 ? (
              <ul className="space-y-3 text-sm text-[#121316]">
                {deliverablesList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 pb-2.5 border-b border-neutral-100 last:border-b-0 last:pb-0">
                    <CheckCircle2 className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#666461]">End-to-end design, development, and commercial deployment.</p>
            )}
          </div>

          {/* Measurable Outcome Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#121316] text-[#FAF8F5] rounded-xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase font-bold text-[#C25E34] tracking-wider">
                Measurable Impact
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                Project Outcome
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {outcomeText || 'Delivered on schedule with positive commercial and operational feedback.'}
              </p>
            </div>

            {liveLink && (
              <a
                href={liveLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#FAF8F5] text-[#121316] text-xs font-semibold hover:bg-neutral-200 transition-colors w-full sm:w-auto"
              >
                <Globe className="w-4 h-4 text-[#C25E34]" />
                <span>Visit Live Platform</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Gallery Images (if multiple images exist) */}
        {galleryImages.length > 1 && (
          <div className="mb-16 space-y-6">
            <h3 className="font-display text-2xl font-bold text-[#121316]">
              Project Media Gallery
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-[#121316]/10 shadow-sm aspect-[16/10] bg-neutral-100">
                  <img src={img} alt={`${project.title} gallery preview ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies & Services Applied */}
        <div className="p-8 bg-[#FAF8F5] border border-[#121316]/10 rounded-xl mb-16 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technologiesList.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#666461] font-semibold block">
                  Technologies & Frameworks Applied
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {technologiesList.map((tech) => (
                    <span key={tech} className="font-mono bg-white border border-neutral-200 px-3 py-1 rounded text-[#121316]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {servicesList.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#666461] font-semibold block">
                  Related Agency Disciplines
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {servicesList.map((srv) => (
                    <span key={srv} className="bg-white border border-[#C25E34]/30 text-[#C25E34] px-3 py-1 rounded font-medium">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation & CTA */}
        <div className="pt-8 border-t border-[#121316]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#121316] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Work</span>
          </Link>

          <button
            onClick={() => handleOpenQuote(servicesList[0] || 'web-development')}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830] transition-colors"
          >
            <span>Discuss a Similar Project</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
