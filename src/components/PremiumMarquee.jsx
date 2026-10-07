'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform, useReducedMotion, useInView } from 'motion/react';

const STRIP_1_ITEMS = [
  'WEB DEVELOPMENT',
  'DIGITAL MARKETING',
  'LOCAL & TECHNICAL SEO',
  'BRANDING & IDENTITY',
  'CUSTOM WEB SYSTEMS',
  'UI/UX ARCHITECTURE',
];

const STRIP_2_ITEMS = [
  'UI/UX DESIGN',
  'GRAPHIC DESIGN & PREPRESS',
  'AI & BUSINESS AUTOMATION',
  'COMMERCIAL VIDEO EDITING',
  'SOCIAL MEDIA MARKETING',
  'NEXT.JS WEB APPS',
];

function MarqueeTrack({
  items,
  direction = 'left', // 'left' | 'right'
  baseSpeed = 26, // seconds per full cycle
  variant = 'light', // 'light' | 'dark'
  className = '',
  scrollVelocity = null,
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: '200px 0px 200px 0px' });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Multiply speed factor based on scroll velocity if available
  const velocityFactor = useTransform(scrollVelocity || { get: () => 0 }, [-2000, 0, 2000], [2.2, 1, 2.2]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    if (!scrollVelocity || shouldReduceMotion) return;
    const unsubscribe = velocityFactor.on('change', (latest) => {
      // Smoothly apply scroll speed factor
      setSpeedMultiplier(Math.max(0.8, Math.min(2.5, latest)));
    });
    return () => unsubscribe();
  }, [scrollVelocity, velocityFactor, shouldReduceMotion]);

  // Calculate actual animation duration
  const activeDuration = isHovered
    ? baseSpeed * 2.8 // Gently slows down by ~3x on hover instead of jarring dead stop
    : baseSpeed / speedMultiplier;

  // Duplicate items 4 times to ensure zero gap across ultra-wide monitors (1920px+)
  const repeatedItems = [...items, ...items, ...items, ...items];

  const trackVariants = {
    animate: {
      x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: activeDuration,
          ease: 'linear',
        },
      },
    },
  };

  const isDark = variant === 'dark';

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full overflow-hidden select-none py-3.5 sm:py-5 border-y transition-colors duration-300 ${
        isDark
          ? 'bg-[#121316] text-[#FAF8F5] border-white/10'
          : 'bg-white text-[#121316] border-[#121316]/10'
      } ${className}`}
    >
      {/* Subtle edge fade gradient mask for an editorial magazine edge */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-16 sm:w-28 z-10 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-r from-[#121316] to-transparent'
            : 'bg-gradient-to-r from-white to-transparent'
        }`}
      />
      <div
        className={`absolute top-0 bottom-0 right-0 w-16 sm:w-28 z-10 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-l from-[#121316] to-transparent'
            : 'bg-gradient-to-l from-white to-transparent'
        }`}
      />

      {shouldReduceMotion ? (
        // Accessible static display for users preferring reduced motion
        <div className="flex flex-wrap items-center justify-center gap-6 px-4 text-center">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="font-display font-extrabold text-base tracking-tight uppercase">
                {item}
              </span>
              {idx < items.length - 1 && <span className="text-[#C25E34]">✦</span>}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <motion.div
          variants={trackVariants}
          animate={isInView ? "animate" : false}
          className="flex whitespace-nowrap will-change-transform"
        >
          {repeatedItems.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-6 sm:gap-10 shrink-0 px-4 sm:px-6"
            >
              <span
                className={`font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-[-0.03em] transition-colors duration-300 ${
                  isDark
                    ? 'hover:text-[#C25E34] text-[#FAF8F5]'
                    : 'hover:text-[#C25E34] text-[#121316]'
                }`}
              >
                {item}
              </span>

              {/* Minimal brand accent star separator */}
              <span
                className="text-[#C25E34] text-base sm:text-xl lg:text-2xl transition-transform duration-300 group-hover:rotate-45"
                aria-hidden="true"
              >
                ✦
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function DesktopMarquee({
  showDualStrip = true,
  variant = 'light',
  className = '',
}) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  return (
    <section
      aria-label="Core Services & Disciplines Marquee"
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* Strip 1: Moving Right to Left */}
      <MarqueeTrack
        items={STRIP_1_ITEMS}
        direction="left"
        baseSpeed={24}
        variant={variant}
        scrollVelocity={smoothVelocity}
      />

      {/* Strip 2: Moving Left to Right (if enabled for rhythm & dual direction) */}
      {showDualStrip && (
        <MarqueeTrack
          items={STRIP_2_ITEMS}
          direction="right"
          baseSpeed={28}
          variant={variant === 'dark' ? 'light' : 'dark'}
          scrollVelocity={smoothVelocity}
        />
      )}
    </section>
  );
}

export default function PremiumMarquee(props) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only run marquee engine on desktop viewports (>= 768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mediaQuery.matches);

    const handleMediaChange = (e) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // On mobile (< 768px): Return null immediately.
  // This completely eliminates motion observers, velocity calculations, duplicated DOM,
  // and rAF animation cycles on mobile devices with zero layout residue or blank space.
  if (!isDesktop) {
    return null;
  }

  return (
    <div className="hidden md:block">
      <DesktopMarquee {...props} />
    </div>
  );
}
