import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import ImageReveal from './animations/ImageReveal';
import { getOptimizedImageUrl } from '../utils/cloudinary';

export default function ProjectCard({ project, onSelect }) {
  const rawImageUrl = project.coverImage || project.image || '/src/assets/images/hero_agency_studio_1790427835770.jpg';
  const imageUrl = getOptimizedImageUrl(rawImageUrl, { width: 768 });
  const summaryText = project.shortDescription || project.summary || project.description || '';
  const servicesList = Array.isArray(project.services) ? project.services : [];
  const yearText = project.year || project.completionDate || new Date().getFullYear();

  return (
    <article
      onClick={() => onSelect(project)}
      className="group cursor-pointer bg-white border border-[#121316]/10 rounded-xl overflow-hidden flex flex-col justify-between card-hover-fx h-full"
    >
      {/* Image Carrier with ImageReveal + hover scale */}
      <ImageReveal
        src={imageUrl}
        alt={project.coverImageAlt || `${project.title} - ${project.industry || 'Case Study'}`}
        containerClassName="aspect-[16/10] bg-neutral-100 border-b border-[#121316]/10"
        className="transition-transform duration-700 ease-out group-hover:scale-108"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span>View Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </ImageReveal>

      {/* Content */}
      <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
        <div>
          {/* Metadata (Unboxed text with · separator) */}
          <div className="flex items-center gap-2 text-xs text-[#666461] mb-2">
            <span className="transition-colors group-hover:text-[#121316]">{project.industry || project.client || 'Client Project'}</span>
            <span aria-hidden="true">·</span>
            <span className="transition-colors group-hover:text-[#121316]">{project.location || 'Quetta, Balochistan'}</span>
          </div>

          <h3 className="font-display text-xl font-bold text-[#121316] mb-2 group-hover:text-[#C25E34] transition-colors">
            {project.title}
          </h3>

          <p className="text-sm text-[#666461] leading-relaxed mb-4 line-clamp-2 group-hover:text-[#121316]/80 transition-colors">
            {summaryText}
          </p>
        </div>

        <div>
          {/* Services unboxed list */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#666461]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {servicesList.slice(0, 2).map((s, idx) => (
                <React.Fragment key={s}>
                  <span className="transition-colors group-hover:text-[#121316]">{s}</span>
                  {idx === 0 && servicesList.length > 1 && <span aria-hidden="true">/</span>}
                </React.Fragment>
              ))}
            </div>
            <span className="font-mono text-neutral-400 group-hover:text-[#121316] transition-colors">{yearText}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
