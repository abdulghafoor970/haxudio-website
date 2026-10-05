'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CO_FOUNDERS } from '../data/team';
import { HAXUDIO_SOCIALS } from '../data/socials';
import { fetchPublicTeam } from '../services/teamApi';
import { MapPin, Sparkles, Quote } from 'lucide-react';

// Social Media SVGs
export function SocialIcons({ socials = {}, className = 'w-4 h-4' }) {
  const soc = socials || {};
  return (
    <div className="flex items-center gap-2">
      {/* LinkedIn */}
      {soc.linkedin && (
        <a
          href={soc.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full text-neutral-500 hover:text-[#0A66C2] hover:bg-neutral-100 transition-colors"
          title="Connect on LinkedIn"
          aria-label="LinkedIn Profile"
        >
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        </a>
      )}

      {/* X (formerly Twitter) */}
      {soc.x && (
        <a
          href={soc.x}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full text-neutral-500 hover:text-[#121316] hover:bg-neutral-100 transition-colors"
          title="Follow on X"
          aria-label="X Profile"
        >
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      )}

      {/* Instagram */}
      {soc.instagram && (
        <a
          href={soc.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full text-neutral-500 hover:text-[#E4405F] hover:bg-neutral-100 transition-colors"
          title="Follow on Instagram"
          aria-label="Instagram Profile"
        >
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      )}

      {/* Facebook */}
      {soc.facebook && (
        <a
          href={soc.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full text-neutral-500 hover:text-[#1877F2] hover:bg-neutral-100 transition-colors"
          title="Connect on Facebook"
          aria-label="Facebook Profile"
        >
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function CoFoundersSlider() {
  const [teamMembers, setTeamMembers] = useState(CO_FOUNDERS);
  const [orderOffset, setOrderOffset] = useState(0);
  const timerRef = useRef(null);

  // Load dynamic team from backend API with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadTeam() {
      try {
        const dynamicTeam = await fetchPublicTeam();
        if (isMounted && Array.isArray(dynamicTeam) && dynamicTeam.length > 0) {
          setTeamMembers(dynamicTeam);
        }
      } catch (err) {
        console.warn('[CoFoundersSlider] Error loading dynamic team:', err);
      }
    }
    loadTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  // AUTOMATIC SLIDING: Continuous unpaused auto-shift every 3 seconds (3000ms)
  useEffect(() => {
    if (!teamMembers || teamMembers.length === 0) return;
    timerRef.current = setInterval(() => {
      setOrderOffset((prev) => (prev + 1) % teamMembers.length);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [teamMembers]);

  if (!teamMembers || teamMembers.length === 0) return null;

  // Dynamically rotated sequence of members
  const orderedMembers = teamMembers.map((_, i) => {
    const rotatedIdx = (i + orderOffset) % teamMembers.length;
    return { ...teamMembers[rotatedIdx], originalIndex: rotatedIdx };
  });

  const featuredMember = orderedMembers[0];
  const featuredPhoto = featuredMember.photo || featuredMember.image || '/src/assets/images/cofounder_tech_lead_1790429560393.jpg';
  const featuredRole = featuredMember.position || featuredMember.role || 'Executive';
  const featuredSocials = featuredMember.socials || {
    linkedin: featuredMember.linkedin,
    x: featuredMember.x,
    instagram: featuredMember.instagram,
    facebook: featuredMember.facebook,
  };

  return (
    <div className="mt-16 pt-16 border-t border-[#121316]/10">
      {/* Header for Co-Founders Showcase */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C25E34] uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Leadership & Co-Founders</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#121316] tracking-tight">
            Meet the Minds Behind Haxudio
          </h3>
          <p className="text-xs sm:text-sm text-[#666461] mt-1">
            Co-Founders driving engineering, design systems, operations, and search growth in Quetta.
          </p>
        </div>

        {/* Agency Social Network Quick Links (Instagram, X, LinkedIn, Facebook) */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto bg-white border border-[#121316]/10 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="text-[11px] font-semibold text-[#121316] mr-1">Follow Haxudio:</span>
          <SocialIcons socials={{
            linkedin: HAXUDIO_SOCIALS.linkedin,
            x: HAXUDIO_SOCIALS.x,
            instagram: HAXUDIO_SOCIALS.instagram,
            facebook: HAXUDIO_SOCIALS.facebook,
          }} />
        </div>
      </div>

      {/* Continuous 3-Second Progress Bar */}
      <div className="w-full bg-neutral-200/60 h-0.5 mb-6 overflow-hidden rounded-full">
        <div
          key={orderOffset}
          className="h-full bg-[#C25E34]"
          style={{
            animation: 'progressSlide 3s linear infinite',
          }}
        />
      </div>

      {/* 1. Main Spotlight Card of Featured Leader in the Active Sequence */}
      <div className="relative overflow-hidden bg-white border border-[#121316]/10 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-500 hover:shadow-md mb-8">
        <div
          key={featuredMember._id || featuredMember.id || 'featured'}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center animate-slide-left-to-right"
        >
          {/* Round Box with Founder Portrait (Circular Frame with layered gradient ring) */}
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              {/* Outer decorative halo ring */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-[#C25E34] via-amber-200 to-[#121316]/40 shadow-inner">
                {/* Circular image container */}
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-100">
                  <img
                    src={featuredPhoto}
                    alt={`${featuredMember.name} - ${featuredRole}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Location Badge */}
              <span className="absolute bottom-1 right-2 bg-[#121316] text-[#FAF8F5] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white shadow-sm">
                Quetta, PK
              </span>
            </div>

            <p className="mt-4 font-display text-lg sm:text-xl font-bold text-[#121316]">
              {featuredMember.name}
            </p>
            <p className="text-xs font-semibold text-[#C25E34]">
              {featuredRole}
            </p>

            {/* Individual Social Links (Instagram, X, LinkedIn, Facebook) */}
            <div className="mt-2.5">
              <SocialIcons socials={featuredSocials} />
            </div>
          </div>

          {/* Details & Quote Content */}
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#666461]">
              <span className="font-semibold text-[#121316]">{featuredMember.discipline || 'Founding Leadership'}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#C25E34]" />
                <span>{featuredMember.location || 'Quetta, Balochistan'}</span>
              </span>
            </div>

            <div className="relative">
              <Quote className="w-8 h-8 text-[#C25E34]/20 absolute -top-3 -left-3 pointer-events-none" />
              <p className="text-sm sm:text-base text-[#121316] leading-relaxed relative z-10 pl-2">
                "{featuredMember.bio}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Round Boxes Sequence Row (Smoothly shifts left to right) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {orderedMembers.map((member, positionIdx) => {
          const isLead = positionIdx === 0;
          const memberPhoto = member.photo || member.image || '/src/assets/images/cofounder_tech_lead_1790429560393.jpg';
          const memberRole = member.position || member.role || 'Team';
          const memberSocials = member.socials || {
            linkedin: member.linkedin,
            x: member.x,
            instagram: member.instagram,
            facebook: member.facebook,
          };

          return (
            <div
              key={`${member._id || member.id || 'mem'}-${positionIdx}`}
              className={`relative group text-left p-3.5 rounded-xl border transition-all duration-500 flex flex-col items-center text-center card-hover-fx ${
                isLead
                  ? 'bg-[#121316] text-white border-[#121316] shadow-md scale-[1.02]'
                  : 'bg-white text-[#121316] border-neutral-200/90'
              }`}
            >
              {/* Round Box (Circular Avatar with animated ring) */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 transition-transform duration-300 group-hover:scale-105 mb-2 ${
                  isLead
                    ? 'bg-gradient-to-tr from-[#C25E34] to-amber-300'
                    : 'bg-neutral-200'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm bg-neutral-100">
                  <img
                    src={memberPhoto}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <p className={`font-display text-xs sm:text-sm font-bold truncate max-w-full ${isLead ? 'text-white' : 'text-[#121316]'}`}>
                {member.name}
              </p>
              <p className={`text-[10px] sm:text-[11px] truncate max-w-full font-medium ${isLead ? 'text-amber-300' : 'text-[#C25E34]'}`}>
                {memberRole.replace('Co-Founder & ', '')}
              </p>

              {/* Social icons row */}
              <div className="mt-2 scale-90">
                <SocialIcons socials={memberSocials} className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
