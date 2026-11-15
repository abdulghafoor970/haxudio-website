'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SEOHead from '../components/SEOHead';
import ProjectCard from '../components/ProjectCard';
import { PROJECT_CATEGORIES } from '../data/projects';
import { PAGE_SEO } from '../data/seo';
import { fetchPublicProjects } from '../services/projectApi';
import { useModal } from '../context/ModalContext';
import { ArrowUpRight, RotateCw } from 'lucide-react';

export default function PortfolioPage({ onSelectProject, onOpenQuote }) {
  const modal = useModal();
  const handleSelectProject = onSelectProject || modal.openProjectModal;
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;

  const [selectedCategory, setSelectedCategory] = useState('all');
  // Never fall back to static PROJECTS so deleted or unpublished items are never resurrected
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const dynamicProjects = await fetchPublicProjects();
      if (Array.isArray(dynamicProjects)) {
        setProjectsList(dynamicProjects.filter((p) => p.isPublished !== false));
      } else {
        setProjectsList([]);
        setApiError('Unable to reach the portfolio service right now.');
      }
    } catch (err) {
      console.warn('[PortfolioPage] Error loading dynamic projects:', err);
      setProjectsList([]);
      setApiError('Unable to reach the portfolio service right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projectsList.filter((p) => {
    if (selectedCategory === 'all') return true;
    return (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <>
      <SEOHead
        title={PAGE_SEO.portfolio.title}
        description={PAGE_SEO.portfolio.description}
        canonical="https://www.haxudio.com/portfolio"
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="max-w-4xl space-y-5 mb-14">
          <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
            Selected Work & Case Studies
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            Digital Products Built with Intent and Precision.
          </h1>
          <p className="text-lg text-[#666461] leading-relaxed">
            A curated selection of responsive web platforms, brand identity systems, and conversion-focused
            user interfaces created for healthcare centers, hospitality suites, artisans, and commercial distributors.
          </p>
        </div>

        {/* Interactive Category Filter Tabs (Original clean segmented control) */}
        <div
          role="tablist"
          aria-label="Filter portfolio work by category"
          className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-200/50 rounded-lg w-fit mb-12 border border-[#121316]/5"
        >
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#121316] shadow-sm'
                  : 'text-[#666461] hover:text-[#121316]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid / Loading / Error / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-lg bg-white border border-[#121316]/10 overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-neutral-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-24 bg-neutral-200 rounded" />
                  <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-3 w-full bg-neutral-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : apiError ? (
          <div className="p-12 bg-white border border-[#121316]/10 rounded-xl text-center space-y-4 mb-24">
            <h2 className="font-display text-xl font-bold text-[#121316]">
              Could Not Load Portfolio Projects
            </h2>
            <p className="text-sm text-[#666461] max-w-md mx-auto">
              {apiError}
            </p>
            <button
              type="button"
              onClick={loadProjects}
              className="btn-interactive-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-md cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 bg-white border border-[#121316]/10 rounded-xl text-center space-y-3 mb-24">
            <h2 className="font-display text-xl font-bold text-[#121316]">
              No Published Projects Found
            </h2>
            <p className="text-sm text-[#666461] max-w-md mx-auto">
              {selectedCategory !== 'all'
                ? 'There are currently no published case studies in this category.'
                : 'No published case studies are currently available in the portfolio.'}
            </p>
            {selectedCategory !== 'all' ? (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-semibold text-[#C25E34] hover:underline cursor-pointer"
              >
                View All Projects
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenQuote()}
                className="text-xs font-semibold text-[#C25E34] hover:underline cursor-pointer"
              >
                Request Relevant Samples
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project._id || project.slug || project.id || `proj-${idx}`}
                project={project}
                onSelect={handleSelectProject}
              />
            ))}
          </div>
        )}

        {/* Client Collaboration Banner */}
        <div className="bg-[#121316] text-[#FAF8F5] p-8 sm:p-12 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase tracking-wider text-[#C25E34] font-bold">
              Looking for a Custom Solution?
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Every Great Digital Product Starts with a Conversation.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              We review your existing brand collateral, current customer friction points, and
              draft an itemized roadmap tailored specifically for your target market in Quetta or nationwide.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenQuote()}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold text-[#121316] bg-[#FAF8F5] rounded-md hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <span>Discuss Your Project</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
