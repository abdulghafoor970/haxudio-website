'use client';

import { useEffect } from 'react';

const DEFAULT_OG_IMAGE = 'https://www.haxudio.com/og-image.jpg';
const DEFAULT_SITE_NAME = 'Haxudio Digital Solutions';

/**
 * Safely sets or creates a <meta> element in document.head
 */
function setMetaTag(attrName, attrValue, content) {
  if (typeof document === 'undefined') return null;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element && content) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  if (element) {
    if (content) {
      element.setAttribute('content', content);
    } else {
      element.removeAttribute('content');
    }
  }
  return element;
}

/**
 * Updates document head for SEO, Open Graph, Twitter Cards, and Structured Data dynamically per route
 */
export default function SEOHead({
  title,
  description,
  canonical,
  image,
  type = 'website',
  siteName = DEFAULT_SITE_NAME,
  noindex = false,
  robotsContent = 'noindex, follow',
  jsonLd,
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Title
    if (title) {
      document.title = title;
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }

    // 2. Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // 3. Robots Indexability
    if (noindex) {
      setMetaTag('name', 'robots', robotsContent || 'noindex, follow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // 4. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
      setMetaTag('property', 'og:url', canonical);
    } else if (noindex && linkCanonical) {
      // Clear misleading canonical on unindexed or 404 pages
      linkCanonical.removeAttribute('href');
    }

    // 5. OpenGraph & Twitter Social Cards
    const rawImage = image || DEFAULT_OG_IMAGE;
    const absoluteImageUrl = rawImage.startsWith('http')
      ? rawImage
      : `https://www.haxudio.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:image', absoluteImageUrl);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:image', absoluteImageUrl);

    // 6. Dynamic JSON-LD Structured Data
    let scriptTag = document.getElementById('dynamic-route-schema');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.id = 'dynamic-route-schema';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag && scriptTag.parentNode) {
      scriptTag.parentNode.removeChild(scriptTag);
    }

    return () => {
      // Clean up dynamic schema tag on route unmount
      const existingScript = document.getElementById('dynamic-route-schema');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [title, description, canonical, image, type, siteName, noindex, robotsContent, jsonLd]);

  return null;
}
