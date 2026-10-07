'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, ArrowUpRight } from 'lucide-react';

export default function ProjectModal({ project, onClose, onStartSimilarProject }) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  if (!project) return null;

  const imageUrl = project.coverImage || project.image || '/src/assets/images/hero_agency_studio_1790427835770.webp';
  const outcomeText = project.results || project.outcome || '';
  const deliverablesList = Array.isArray(project.deliverables) ? project.deliverables : [];
  const technologiesList = Array.isArray(project.technologies) ? project.technologies : [];
  const liveLink = project.liveUrl || project.projectUrl;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#121316]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-lg shadow-2xl border border-[#121316]/10 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative aspect-[16/9] w-full bg-neutral-900 overflow-hidden">
          <img
            src={imageUrl}
            alt={project.coverImageAlt || project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#121316]/60 text-white hover:bg-[#121316] transition-colors"
            aria-label="Close Case Study Details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Title in Hero Image */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs text-neutral-300 mb-1">
              <span>{project.industry || project.client || 'Case Study'}</span>
              <span aria-hidden="true">·</span>
              <span>{project.location || 'Quetta, Balochistan'}</span>
              <span aria-hidden="true">·</span>
              <span>{project.year || project.completionDate || '2025'}</span>
            </div>
            <h2
              id="project-modal-title"
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight"
            >
              {project.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Overview */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#C25E34] font-semibold mb-2">
              Project Overview
            </h3>
            <p className="text-sm sm:text-base text-[#121316] leading-relaxed">
              {project.description || project.shortDescription || project.summary}
            </p>
          </div>

          {/* Challenge & Solution Grid */}
          {(project.challenge || project.solution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
              {project.challenge && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#666461] font-semibold mb-2">
                    The Challenge
                  </h4>
                  <p className="text-sm text-[#666461] leading-relaxed">
                    {project.challenge}
                  </p>
                </div>
              )}
              {project.solution && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#666461] font-semibold mb-2">
                    The Solution
                  </h4>
                  <p className="text-sm text-[#666461] leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Key Deliverables */}
          {deliverablesList.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs uppercase tracking-wider text-[#121316] font-semibold mb-3">
                Verified Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {deliverablesList.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs sm:text-sm text-[#121316]">
                    <CheckCircle className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grounded Outcome / Result */}
          {outcomeText && (
            <div className="p-4 bg-[#F4F1EA] rounded-md border border-[#121316]/10">
              <p className="text-xs font-semibold text-[#121316] mb-1 uppercase tracking-wider">
                Measurable Result
              </p>
              <p className="text-sm text-[#121316] leading-relaxed">
                {outcomeText}
              </p>
            </div>
          )}

          {/* Technology Stack & Live Link */}
          {technologiesList.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#666461] font-semibold mb-2">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#121316]">
                  {technologiesList.map((tech) => (
                    <span key={tech} className="font-mono bg-neutral-200/70 px-2.5 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {liveLink && (
                <a
                  href={liveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C25E34] hover:underline"
                >
                  <span>Visit Live Website</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-neutral-100 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#666461]">
            Ready to build a similar platform for your business?
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#666461] hover:text-[#121316]"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onStartSimilarProject(project);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] transition-colors"
            >
              <span>Discuss Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
