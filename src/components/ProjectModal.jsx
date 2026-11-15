'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowUpRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const FALLBACK_HERO_IMAGE = '/src/assets/images/hero_agency_studio_1790427835770.webp';

const CATEGORY_LABELS = {
  websites: 'Websites',
  branding: 'Branding',
  'ui-ux': 'UI/UX',
  marketing: 'Marketing & SEO',
  'graphic-design': 'Graphic Design',
};

function formatCategoryLabel(category, fallback) {
  if (!category) return fallback || 'Case Study';
  const normalized = String(category).toLowerCase().trim();
  if (CATEGORY_LABELS[normalized]) return CATEGORY_LABELS[normalized];
  return normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ProjectModal({
  project,
  isOpen = true,
  onClose,
  onStartSimilarProject,
  onStartSimilar,
}) {
  const rawImageUrl = project?.coverImage || project?.image || FALLBACK_HERO_IMAGE;
  const optimizedImageUrl = getOptimizedImageUrl(rawImageUrl, { width: 1200 });
  const [imgSrc, setImgSrc] = useState(optimizedImageUrl);

  useEffect(() => {
    setImgSrc(optimizedImageUrl);
  }, [optimizedImageUrl]);

  useEffect(() => {
    if (!project || isOpen === false) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [project, isOpen, onClose]);

  if (!project || isOpen === false) return null;

  const categoryText = formatCategoryLabel(project.category, project.industry || project.client);
  const locationText = project.location || 'Quetta, Balochistan';
  const yearText = project.year || project.completionDate || '2025';
  const overviewText = project.description || project.shortDescription || project.summary || '';
  const outcomeText = project.results || project.outcome || '';
  const deliverablesList = Array.isArray(project.deliverables) ? project.deliverables : [];
  const technologiesList = Array.isArray(project.technologies) ? project.technologies : [];
  const liveLink = project.liveUrl || project.projectUrl;
  const handleDiscuss = onStartSimilarProject || onStartSimilar;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-[#121316]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#121316]/10 flex flex-col overflow-hidden min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accessible Close Button — pinned & always visible */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 w-10 h-10 inline-flex items-center justify-center rounded-full bg-[#121316]/75 text-white hover:bg-[#121316] border border-white/15 backdrop-blur-xs transition-colors cursor-pointer"
          aria-label="Close Case Study Details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Single Main Vertical Scrolling Container */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* Modal Hero Image Header */}
          <div className="relative w-full h-56 sm:h-72 md:h-[340px] bg-[#121316] overflow-hidden shrink-0">
            <img
              src={imgSrc}
              alt={project.coverImageAlt || project.title}
              onError={() => {
                if (imgSrc !== FALLBACK_HERO_IMAGE) {
                  setImgSrc(FALLBACK_HERO_IMAGE);
                }
              }}
              className="w-full h-full object-cover object-center block"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121316]/90 via-[#121316]/45 to-[#121316]/20" />

            {/* Hero Metadata & Title */}
            <div className="absolute inset-x-0 bottom-0 px-5 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 pr-14 sm:pr-16 text-white min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-neutral-200/90 mb-1.5 min-w-0">
                <span className="font-semibold text-[#FAF8F5]">{categoryText}</span>
                <span aria-hidden="true">·</span>
                <span>{locationText}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{yearText}</span>
              </div>
              <h2
                id="project-modal-title"
                className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight text-white break-words"
              >
                {project.title}
              </h2>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9 space-y-7 sm:space-y-8 min-w-0">
            {/* Project Overview */}
            {overviewText && (
              <section className="min-w-0">
                <h3 className="text-xs uppercase tracking-[0.14em] text-[#C25E34] font-semibold mb-2.5">
                  Project Overview
                </h3>
                <p className="text-sm sm:text-base text-[#121316] leading-relaxed whitespace-pre-line break-words">
                  {overviewText}
                </p>
              </section>
            )}

            {/* Challenge & Solution Grid */}
            {(project.challenge || project.solution) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-6 border-t border-[#121316]/10 min-w-0">
                {project.challenge && (
                  <div className="min-w-0 space-y-2">
                    <h4 className="text-xs uppercase tracking-[0.14em] text-[#666461] font-semibold">
                      The Challenge
                    </h4>
                    <p className="text-sm text-[#666461] leading-relaxed break-words">
                      {project.challenge}
                    </p>
                  </div>
                )}
                {project.solution && (
                  <div className="min-w-0 space-y-2">
                    <h4 className="text-xs uppercase tracking-[0.14em] text-[#666461] font-semibold">
                      The Solution
                    </h4>
                    <p className="text-sm text-[#666461] leading-relaxed break-words">
                      {project.solution}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Key Deliverables */}
            {deliverablesList.length > 0 && (
              <section className="pt-6 border-t border-[#121316]/10 min-w-0">
                <h4 className="text-xs uppercase tracking-[0.14em] text-[#121316] font-semibold mb-3.5">
                  Verified Deliverables
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                  {deliverablesList.map((item, idx) => (
                    <div
                      key={`${item}-${idx}`}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#121316] min-w-0"
                    >
                      <CheckCircle className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                      <span className="min-w-0 break-words leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Grounded Outcome / Result */}
            {outcomeText && (
              <section className="p-4 sm:p-5 bg-[#F4F1EA] rounded-lg border border-[#121316]/10 min-w-0">
                <p className="text-xs font-semibold text-[#121316] mb-1.5 uppercase tracking-[0.14em]">
                  Measurable Result
                </p>
                <p className="text-sm text-[#121316] leading-relaxed break-words">
                  {outcomeText}
                </p>
              </section>
            )}

            {/* Technology Stack & Live Link */}
            {(technologiesList.length > 0 || liveLink) && (
              <section className="pt-6 border-t border-[#121316]/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 min-w-0">
                {technologiesList.length > 0 && (
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs uppercase tracking-[0.14em] text-[#666461] font-semibold mb-2.5">
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#121316] min-w-0">
                      {technologiesList.map((tech, idx) => (
                        <span
                          key={`${tech}-${idx}`}
                          className="font-mono bg-[#F4F1EA] border border-[#121316]/10 px-2.5 py-1 rounded max-w-full break-words"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {liveLink && (
                  <a
                    href={liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C25E34] hover:underline py-1"
                  >
                    <span>Visit Live Website</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </section>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 md:px-10 bg-[#F4F1EA] border-t border-[#121316]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0 min-w-0">
          <span className="text-xs text-[#666461] text-center sm:text-left">
            Ready to build a similar platform for your business?
          </span>
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-[#666461] hover:text-[#121316] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (handleDiscuss) {
                  handleDiscuss(project);
                }
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#C25E34] transition-colors cursor-pointer"
            >
              <span>Discuss Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
