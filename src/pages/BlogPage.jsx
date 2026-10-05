'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../data/blog';
import { PAGE_SEO } from '../data/seo';
import { ArrowUpRight, Search } from 'lucide-react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All Topics' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEOHead
        title={PAGE_SEO.blog.title}
        description={PAGE_SEO.blog.description}
        canonical="https://www.haxudio.com/blog"
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="max-w-4xl space-y-5 mb-14">
          <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
            Digital Perspectives & Research
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            Insights on Technology, Search, and Commerce in Pakistan.
          </h1>
          <p className="text-lg text-[#666461] leading-relaxed">
            Practical guidance for entrepreneurs, clinicians, and business owners navigating
            custom software engineering, local Quetta SEO, branding, and digital transformation.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 pb-6 border-b border-neutral-200">
          {/* Segmented Category Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/50 rounded-lg">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-[#121316] shadow-sm'
                    : 'text-[#666461] hover:text-[#121316]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#666461] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#121316]/15 rounded-md text-[#121316] placeholder-neutral-400 focus:outline-none focus:border-[#121316]"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-neutral-200 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-[#121316]">No articles match your search.</p>
            <button
              onClick={() => {
                setSelectedCategory('All Topics');
                setSearchQuery('');
              }}
              className="text-xs text-[#C25E34] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white border border-[#121316]/10 rounded-lg p-6 sm:p-8 flex flex-col justify-between hover:border-[#121316]/30 transition-all hover:shadow-md"
              >
                <div>
                  {/* Unboxed Metadata (dot separator) */}
                  <div className="flex items-center gap-2 text-xs text-[#666461] mb-3">
                    <span className="font-semibold text-[#C25E34]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-[#121316] mb-3 group-hover:text-[#C25E34] transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#666461] leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-[#666461]">{post.publishedDate}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-semibold text-[#121316] group-hover:text-[#C25E34] inline-flex items-center gap-1"
                  >
                    <span>Read Guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
