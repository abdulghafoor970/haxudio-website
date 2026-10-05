'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, BRAND } from '../data/navigation';
import { HAXUDIO_SOCIALS } from '../data/socials';
import { SocialIcons } from './CoFoundersSlider';
import MagneticButton from './animations/MagneticButton';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { useModal } from '../context/ModalContext';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ onOpenQuote }) {
  const location = usePathname();
  const { openQuoteModal } = useModal();
  const handleQuoteClick = onOpenQuote || openQuoteModal;
  const scrollPosition = useScrollPosition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isScrolled = scrollPosition > 30;

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent background scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#121316]/10 py-3.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <Link
            href="/"
            className="font-display font-bold text-xl md:text-2xl text-[#121316] tracking-tight hover:opacity-85 transition-opacity"
            aria-label="Haxudio Digital Solutions Homepage"
          >
            Haxudio
          </Link>

          {/* Zone 2: 4–6 clean text navigation links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#121316]/80"
          >
            {NAV_LINKS.map((item) => {
              const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative py-1 transition-colors hover:text-[#121316] ${
                    isActive ? 'text-[#121316] font-semibold' : 'text-[#666461]'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#121316]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1–2 primary actions + Social links */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center border-r border-[#121316]/10 pr-2">
              <SocialIcons socials={{
                linkedin: HAXUDIO_SOCIALS.linkedin,
                x: HAXUDIO_SOCIALS.x,
                instagram: HAXUDIO_SOCIALS.instagram,
                facebook: HAXUDIO_SOCIALS.facebook,
              }} className="w-3.5 h-3.5" />
            </div>

            <MagneticButton strength={0.18} maxOffset={4}>
              <button
                onClick={handleQuoteClick}
                className="btn-interactive-primary group hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md shadow-sm whitespace-nowrap active:scale-[0.98]"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </MagneticButton>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#121316] hover:bg-[#121316]/5 rounded-md transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-[#121316]/50 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-[#FAF8F5] p-6 shadow-2xl flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#121316]/10">
                <span className="font-display font-bold text-xl text-[#121316]">
                  Haxudio
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#121316] hover:bg-[#121316]/5 rounded-md"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-4 mt-6">
                {NAV_LINKS.map((item) => {
                  const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium py-1 transition-colors ${
                        isActive ? 'text-[#121316] font-bold' : 'text-[#666461] hover:text-[#121316]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  href="/locations/quetta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#C25E34] py-1 hover:underline"
                >
                  Quetta & Balochistan Hub →
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#121316]/10 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuoteClick();
                }}
                className="w-full py-3 px-4 text-center text-sm font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] transition-colors"
              >
                Start a Project
              </button>
              <div className="text-xs text-[#666461] space-y-1">
                <p className="font-medium text-[#121316]">{BRAND.name}</p>
                <p>{BRAND.foundedLocation}</p>
                <p>{BRAND.email}</p>
              </div>

              <div className="pt-2">
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#121316] mb-1.5">
                  Follow Haxudio
                </span>
                <SocialIcons socials={{
                  linkedin: HAXUDIO_SOCIALS.linkedin,
                  x: HAXUDIO_SOCIALS.x,
                  instagram: HAXUDIO_SOCIALS.instagram,
                  facebook: HAXUDIO_SOCIALS.facebook,
                }} className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
