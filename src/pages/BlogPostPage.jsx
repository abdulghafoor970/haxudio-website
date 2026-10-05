'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SEOHead from '../components/SEOHead';
import { BLOG_POSTS } from '../data/blog';
import { useModal } from '../context/ModalContext';
import { ArrowLeft, ArrowUpRight, Clock, Calendar, User, Tag } from 'lucide-react';

export default function BlogPostPage({ slug: propSlug, onOpenQuote }) {
  const urlParams = useParams();
  const slug = propSlug || urlParams?.slug;
  const modal = useModal();
  const handleOpenQuote = onOpenQuote || modal.openQuoteModal;

  const post = BLOG_POSTS.find((p) => p.slug === slug) || null;

  if (!post) {
    return (
      <>
        <SEOHead
          title="Article Not Found | Haxudio Digital Insights"
          description="The requested article could not be found or has been moved."
          noindex={true}
          robotsContent="noindex, follow"
        />
        <div className="pt-40 pb-32 text-center max-w-lg mx-auto px-6 space-y-4">
          <span className="font-mono text-xs font-bold text-[#C25E34]">404 Not Found</span>
          <h1 className="font-display text-3xl font-bold text-[#121316]">Article Not Found</h1>
          <p className="text-sm text-[#666461]">
            The article you are looking for does not exist or may have been updated.
          </p>
          <div className="pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Blog</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedDate,
        author: {
          '@type': 'Organization',
          name: 'Haxudio Digital Solutions',
          url: 'https://www.haxudio.com/',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Haxudio Digital Solutions',
          url: 'https://www.haxudio.com/',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.haxudio.com/og-image.jpg',
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
            name: 'Blog',
            item: 'https://www.haxudio.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://www.haxudio.com/blog/${post.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <SEOHead
        title={`${post.title} | Haxudio Digital Insights`}
        description={post.excerpt}
        canonical={`https://www.haxudio.com/blog/${post.slug}`}
        jsonLd={blogJsonLd}
      />

      <article className="pt-32 pb-24 max-w-4xl mx-auto px-6 md:px-10">
        {/* Back Link & Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#666461] mb-8">
          <Link href="/" className="hover:text-[#121316]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="hover:text-[#121316]">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#121316] font-medium truncate">{post.title}</span>
        </nav>

        {/* Post Header */}
        <header className="space-y-6 pb-8 border-b border-neutral-200 mb-10">
          <div className="flex items-center gap-3 text-xs text-[#666461]">
            <span className="font-semibold text-[#C25E34] uppercase tracking-wider">
              {post.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedDate}</span>
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121316] leading-[1.12] text-balance">
            {post.title}
          </h1>

          <p className="text-lg text-[#666461] leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 text-xs text-[#121316] pt-2">
            <User className="w-3.5 h-3.5 text-[#C25E34]" />
            <span className="font-medium">Published by {post.author}</span>
            <span aria-hidden="true">·</span>
            <span>Quetta, Balochistan</span>
          </div>
        </header>

        {/* Post Body (Clean Editorial Prose) */}
        <div className="prose prose-neutral max-w-none space-y-6 text-[#121316] text-sm sm:text-base leading-relaxed">
          {post.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('### ')) {
              return (
                <h2
                  key={index}
                  className="font-display text-2xl font-bold text-[#121316] pt-6 pb-2 border-b border-neutral-100"
                >
                  {trimmed.replace('### ', '')}
                </h2>
              );
            }

            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n- ').map((i) => i.replace('- ', ''));
              return (
                <ul key={index} className="space-y-2 pl-4 list-disc text-[#121316]/90">
                  {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={index} className="text-[#121316]/90 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center gap-3 text-xs text-[#666461]">
            <Tag className="w-3.5 h-3.5" />
            <span>Topics:</span>
            <div className="flex items-center gap-2">
              {post.tags.map((t, idx) => (
                <React.Fragment key={t}>
                  <span className="text-[#121316]">{t}</span>
                  {idx < post.tags.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="mt-16 p-8 bg-[#121316] text-[#FAF8F5] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-white">
              Want to Implement This in Your Business?
            </h3>
            <p className="text-xs text-neutral-400">
              Our Quetta team can audit your web infrastructure and formulate a custom digital roadmap.
            </p>
          </div>
          <button
            onClick={() => handleOpenQuote()}
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-3 text-xs font-semibold text-[#121316] bg-[#FAF8F5] rounded-md hover:bg-neutral-200 transition-colors"
          >
            <span>Start a Consultation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Back navigation */}
        <div className="mt-12 pt-6 border-t border-neutral-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#121316] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>
      </article>
    </>
  );
}
