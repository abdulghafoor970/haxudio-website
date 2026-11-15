'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BRAND, NAV_LINKS, SERVICE_LINKS } from '../data/navigation';
import { HAXUDIO_SOCIALS, SOCIAL_LINKS } from '../data/socials';
import { subscribeNewsletter } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ArrowUpRight, CheckCircle2, MessageCircle } from 'lucide-react';
import HaxudioLogo from './HaxudioLogo';

export default function Footer() {
  const { settings } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ state: 'idle', message: '' });

  const businessName = settings?.business?.businessName || BRAND.name;
  const businessDescription =
    settings?.business?.description ||
    'A modern digital solutions agency based in Quetta, Balochistan. We engineer high-performance web systems, brand identities, SEO architecture, and growth strategies for ambitious businesses across Pakistan.';
  const address = settings?.contact?.address || BRAND.address;
  const mapUrl = settings?.contact?.mapUrl || HAXUDIO_SOCIALS.googleBusinessProfile;
  const workingHours = settings?.business?.workingHours || BRAND.workingHours;
  const whatsappNumber = settings?.contact?.whatsapp || HAXUDIO_SOCIALS.whatsapp.number;
  const whatsappUrl = settings?.contact?.whatsappUrl || HAXUDIO_SOCIALS.whatsapp.url;
  const primaryEmail = settings?.contact?.primaryEmail || BRAND.email;

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus({ state: 'loading', message: '' });
    try {
      const res = await subscribeNewsletter(newsletterEmail);
      setNewsletterStatus({ state: 'success', message: res.message });
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus({ state: 'error', message: err.message || 'Subscription failed.' });
    }
  };

  return (
    <footer className="bg-[#121316] text-[#FAF8F5] pt-20 pb-12 mt-24 border-t border-[#121316]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Main 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Column 1: Brand & Agency Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 sm:gap-3 group hover:opacity-90 transition-opacity"
              aria-label="Haxudio Digital Solutions Homepage"
            >
              <HaxudioLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <span className="font-display font-bold text-2xl tracking-tight text-[#FAF8F5]">
                {businessName}
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              {businessDescription}
            </p>
            <div className="pt-2 text-xs text-neutral-400 space-y-1">
              <p className="text-neutral-200 font-medium">Headquarters</p>
              <p>{address}</p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#C25E34] hover:underline font-semibold mt-1"
              >
                <span>Google Business Profile & Map</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <p className="text-neutral-400 pt-0.5">{workingHours}</p>
            </div>

            {/* Official Social Links & WhatsApp */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                Connect With Haxudio
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-medium pt-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: {whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/locations/quetta"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-[#D97706]"
                >
                  <span>Quetta Hub</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Services (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              {SERVICE_LINKS.slice(0, 7).map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  className="text-xs text-neutral-400 hover:text-white underline pt-1 inline-block"
                >
                  View All Capabilities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Inquiries (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Digital Insights
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Quarterly perspectives on web architecture, local Pakistani commerce, and search strategies.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
              <div className="flex">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter work email"
                  aria-label="Enter work email for Digital Insights newsletter"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/15 rounded-l-md text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus.state === 'loading'}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] text-[#121316] rounded-r-md hover:bg-neutral-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {newsletterStatus.state === 'loading' ? 'Joining...' : 'Subscribe'}
                </button>
              </div>

              {newsletterStatus.state === 'success' && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Subscribed successfully.</span>
                </p>
              )}
              {newsletterStatus.state === 'error' && (
                <p className="text-xs text-rose-400 pt-1">{newsletterStatus.message}</p>
              )}
            </form>

            <div className="pt-3 text-xs text-neutral-400">
              <span className="block text-neutral-500">Direct Inquiries:</span>
              <a
                href={`mailto:${primaryEmail}`}
                className="text-neutral-300 hover:text-white font-medium hover:underline"
              >
                {primaryEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar: Copyright, subtle clickable ★ admin link left of Quetta location */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              aria-label="Admin Portal"
              className="text-white/15 hover:text-white/45 transition-colors text-[10px] leading-none p-1 select-none"
            >
              ★
            </Link>
            <span>Quetta, Balochistan, Pakistan</span>
            <span aria-hidden="true">·</span>
            <span>Serving Clients Nationwide</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.haxudio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              haxudio.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
