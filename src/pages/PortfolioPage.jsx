'use client';

import React, { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import { PROJECTS, PROJECT_CATEGORIES } from '../data/projects';
import { PAGE_SEO } from '../data/seo';
import { fetchPublicProjects } from '../services/projectApi';
import { useModal } from '../context/ModalContext';
import { ArrowUpRight } from 'lucide-react';

export default function PortfolioPage({ onSelectProject, onOpenQuote }) {
  const modal = useModal();
  const handleSelectProject = onSelectProject || modal.openProjectModal;
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [projectsList, setProjectsList] = useState(PROJECTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setIsLoading(true);
      try {
        const dynamicProjects = await fetchPublicProjects();
        if (isMounted && Array.isArray(dynamicProjects)) {
          setProjectsList(dynamicProjects);
        }
      } catch (err) {
        console.warn('[PortfolioPage] Error loading dynamic projects:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

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

        {/* Interactive Category Filter Tabs (Unboxed clean segmented control) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-200/50 rounded-lg w-fit mb-12 border border-[#121316]/5">
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#121316] shadow-sm'
                  : 'text-[#666461] hover:text-[#121316]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {filteredProjects.map((project, idx) => (
            <ProjectCard
              key={project._id || project.slug || project.id || `proj-${idx}`}
              project={project}
              onSelect={handleSelectProject}
            />
          ))}
        </div>

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
            onClick={() => handleOpenQuote()}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold text-[#121316] bg-[#FAF8F5] rounded-md hover:bg-neutral-200 transition-colors"
          >
            <span>Discuss Your Project</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
