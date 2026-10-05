'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../data/navigation';
import { HAXUDIO_SOCIALS } from '../data/socials';

export default function LocationMapCard({ className = '' }) {
  const [mapType, setMapType] = useState('road'); // 'road' | 'satellite'

  const googleProfileUrl = HAXUDIO_SOCIALS.googleBusinessProfile || 'https://share.google/zFaaZlrDoY9v7zIEZ';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=A1+City+Hazara+Town+Brewery+Road+Quetta`;

  // OpenStreetMap centered on Brewery Road, Hazara Town, Quetta
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=66.9520%2C30.1550%2C66.9920%2C30.1850&layer=mapnik&marker=30.1710%2C66.9715`;

  return (
    <div className={`bg-white border border-[#121316]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Map Header Card */}
      <div className="p-6 sm:p-7 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Google Business Profile</span>
            </span>
            <span className="text-xs text-[#666461]">Quetta Headquarters</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#121316]">
            Find Our Quetta Location
          </h3>
          <p className="text-xs sm:text-sm text-[#666461] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C25E34] shrink-0" />
            <span className="font-medium text-[#121316]">
              A1 City, Hazara Town, Brewery Road, Quetta, Pakistan
            </span>
          </p>
        </div>

        {/* Google Maps Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-interactive-primary group inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md shadow-xs whitespace-nowrap"
          >
            {/* Google "G" Icon */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
            </svg>
            <span>Google Business Profile</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-interactive-secondary group inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-md whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5 text-[#C25E34]" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>

      {/* Map Interactive Canvas / Visual Frame */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-neutral-200 overflow-hidden">
        {/* Interactive OpenStreetMap Embed centered on Brewery Road, Hazara Town */}
        <iframe
          title="Haxudio Digital Solutions Quetta Location Map"
          src={mapEmbedUrl}
          className="w-full h-full border-0 filter saturate-[1.1] contrast-[1.05]"
          loading="lazy"
          tabIndex="-1"
        />

        {/* Floating Location Overlay Badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-lg border border-[#121316]/10 max-w-[280px] pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C25E34] animate-ping" />
            <span className="text-xs font-bold text-[#121316]">Haxudio Digital Solutions</span>
          </div>
          <p className="text-[11px] text-[#666461] leading-snug">
            A1 City, Hazara Town, Brewery Road, Quetta
          </p>
          <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-[#666461]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C25E34]" />
              <span>09:00 AM – 06:00 PM</span>
            </span>
            <span className="text-emerald-700 font-medium">Open Mon–Sat</span>
          </div>
        </div>

        {/* Map Legend & Direct Link Pill in Bottom-Right */}
        <div className="absolute bottom-3 right-3 z-10">
          <a
            href={googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#121316] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md hover:bg-[#252830] transition-colors"
          >
            <span>View Pin on Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="p-4 sm:p-5 bg-neutral-50/80 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[#666461]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[#121316] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>In-Person Consultations by Appointment</span>
          </span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span>Brewery Road Commercial Corridor</span>
        </div>
        <a
          href={HAXUDIO_SOCIALS.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#25D366] font-semibold hover:underline flex items-center gap-1"
        >
          <span>WhatsApp Location & Directions: {HAXUDIO_SOCIALS.whatsapp.number}</span>
        </a>
      </div>
    </div>
  );
}
