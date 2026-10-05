import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchPublicSettings } from '../services/settingsApi';
import { BRAND } from '../data/navigation';
import { HAXUDIO_SOCIALS } from '../data/socials';
import { DEFAULT_SEO } from '../data/seo';

// Default static fallback structure
const INITIAL_FALLBACK_SETTINGS = {
  business: {
    businessName: BRAND.name || 'Haxudio Digital Solutions',
    shortName: BRAND.shortName || 'Haxudio',
    tagline: BRAND.tagline || 'Digital solutions built to move your business forward.',
    description: 'A modern digital solutions agency based in Quetta, Balochistan. We engineer high-performance web systems, brand identities, SEO architecture, and growth strategies for ambitious businesses across Pakistan.',
    foundedLocation: BRAND.foundedLocation || 'Quetta, Balochistan, Pakistan',
    workingHours: BRAND.workingHours || 'Mon – Sat: 09:00 AM – 06:00 PM PKT',
  },
  contact: {
    primaryEmail: BRAND.email || 'hello@haxudio.com',
    secondaryEmail: HAXUDIO_SOCIALS.email || 'contact@haxudio.com',
    phone: BRAND.phone || '+92 318 3690179',
    whatsapp: HAXUDIO_SOCIALS.whatsapp?.number || '+92318 3690179',
    whatsappUrl: HAXUDIO_SOCIALS.whatsapp?.url || 'https://wa.me/923183690179?text=Hello%20Haxudio%20Digital%20Solutions%2C%20I%20would%20like%20to%20inquire%20about%20a%20project.',
    locationDisplay: HAXUDIO_SOCIALS.location || 'Quetta, Balochistan, Pakistan',
    address: BRAND.address || 'A1 City, Hazara Town, Brewery Road, Quetta, Balochistan, Pakistan',
    streetAddress: BRAND.streetAddress || 'A1 City, Hazara Town, Brewery Road',
    city: BRAND.city || 'Quetta',
    region: BRAND.region || 'Balochistan',
    country: BRAND.country || 'Pakistan',
    mapUrl: BRAND.googleBusinessProfile || 'https://share.google/zFaaZlrDoY9v7zIEZ',
  },
  social: {
    instagram: HAXUDIO_SOCIALS.instagram || 'https://www.instagram.com/haxudio/',
    facebook: HAXUDIO_SOCIALS.facebook || 'https://www.facebook.com/haxudio/',
    linkedin: HAXUDIO_SOCIALS.linkedin || 'https://www.linkedin.com/company/haxudio/',
    x: HAXUDIO_SOCIALS.x || 'https://x.com/haxudio',
    youtube: '',
    github: '',
    googleBusinessProfile: HAXUDIO_SOCIALS.googleBusinessProfile || 'https://share.google/zFaaZlrDoY9v7zIEZ',
  },
  branding: {
    logo: '',
    logoAlt: BRAND.name || 'Haxudio Digital Solutions',
    favicon: '',
    defaultOgImage: 'https://www.haxudio.com/og-image.jpg',
  },
  globalCta: {
    ctaLabel: 'Get a Proposal',
    ctaUrl: '/contact',
  },
  seoDefaults: {
    defaultTitle: DEFAULT_SEO.title || 'Haxudio Digital Solutions | Digital Agency in Quetta, Pakistan',
    titleSuffix: ' | Haxudio Digital Solutions',
    defaultDescription: DEFAULT_SEO.description || '',
    defaultKeywords: ['Digital agency Quetta', 'Web development Pakistan', 'SEO Balochistan'],
    defaultOgImage: 'https://www.haxudio.com/og-image.jpg',
    canonicalBase: DEFAULT_SEO.canonical || 'https://www.haxudio.com/',
  },
};

const SettingsContext = createContext({
  settings: INITIAL_FALLBACK_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(INITIAL_FALLBACK_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchPublicSettings();
      if (data) {
        setSettings((prev) => ({
          business: { ...prev.business, ...(data.business || {}) },
          contact: { ...prev.contact, ...(data.contact || {}) },
          social: { ...prev.social, ...(data.social || {}) },
          branding: { ...prev.branding, ...(data.branding || {}) },
          globalCta: { ...prev.globalCta, ...(data.globalCta || {}) },
          seoDefaults: { ...prev.seoDefaults, ...(data.seoDefaults || {}) },
        }));
      }
    } catch (err) {
      console.warn('[SettingsProvider Error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const contextValue = useMemo(() => ({
    settings,
    isLoading,
    refreshSettings: loadSettings,
  }), [settings, isLoading, loadSettings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
