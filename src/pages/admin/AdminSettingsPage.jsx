import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminNavbar from '../../components/admin/AdminNavbar';
import ImageFieldPicker from '../../components/admin/ImageFieldPicker';
import { fetchAdminSettings, updateAdminSettings } from '../../services/settingsApi';
import {
  Settings,
  Building,
  Mail,
  Share2,
  Image,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Phone,
  MapPin,
  ExternalLink,
  Lock,
} from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General Business', icon: Building },
  { id: 'contact', label: 'Contact & Location', icon: Mail },
  { id: 'social', label: 'Social Channels', icon: Share2 },
  { id: 'branding', label: 'Branding & Assets', icon: Image },
  { id: 'seo', label: 'SEO Defaults', icon: Search },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form State
  const [business, setBusiness] = useState({
    businessName: '',
    shortName: '',
    tagline: '',
    description: '',
    foundedLocation: '',
    workingHours: '',
  });

  const [contact, setContact] = useState({
    primaryEmail: '',
    secondaryEmail: '',
    phone: '',
    whatsapp: '',
    whatsappUrl: '',
    locationDisplay: '',
    address: '',
    streetAddress: '',
    city: '',
    region: '',
    country: '',
    mapUrl: '',
  });

  const [social, setSocial] = useState({
    instagram: '',
    facebook: '',
    linkedin: '',
    x: '',
    youtube: '',
    github: '',
    googleBusinessProfile: '',
  });

  const [branding, setBranding] = useState({
    logo: '',
    logoAlt: '',
    favicon: '',
    defaultOgImage: '',
  });

  const [globalCta, setGlobalCta] = useState({
    ctaLabel: '',
    ctaUrl: '',
  });

  const [seoDefaults, setSeoDefaults] = useState({
    defaultTitle: '',
    titleSuffix: '',
    defaultDescription: '',
    defaultKeywordsText: '',
    defaultOgImage: '',
    canonicalBase: '',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAdminSettings();
      setSettings(data);

      if (data) {
        setBusiness({
          businessName: data.business?.businessName || '',
          shortName: data.business?.shortName || '',
          tagline: data.business?.tagline || '',
          description: data.business?.description || '',
          foundedLocation: data.business?.foundedLocation || '',
          workingHours: data.business?.workingHours || '',
        });

        setContact({
          primaryEmail: data.contact?.primaryEmail || '',
          secondaryEmail: data.contact?.secondaryEmail || '',
          phone: data.contact?.phone || '',
          whatsapp: data.contact?.whatsapp || '',
          whatsappUrl: data.contact?.whatsappUrl || '',
          locationDisplay: data.contact?.locationDisplay || '',
          address: data.contact?.address || '',
          streetAddress: data.contact?.streetAddress || '',
          city: data.contact?.city || '',
          region: data.contact?.region || '',
          country: data.contact?.country || '',
          mapUrl: data.contact?.mapUrl || '',
        });

        setSocial({
          instagram: data.social?.instagram || '',
          facebook: data.social?.facebook || '',
          linkedin: data.social?.linkedin || '',
          x: data.social?.x || '',
          youtube: data.social?.youtube || '',
          github: data.social?.github || '',
          googleBusinessProfile: data.social?.googleBusinessProfile || '',
        });

        setBranding({
          logo: data.branding?.logo || '',
          logoAlt: data.branding?.logoAlt || '',
          favicon: data.branding?.favicon || '',
          defaultOgImage: data.branding?.defaultOgImage || '',
        });

        setGlobalCta({
          ctaLabel: data.globalCta?.ctaLabel || 'Get a Proposal',
          ctaUrl: data.globalCta?.ctaUrl || '/contact',
        });

        const kw = data.seoDefaults?.defaultKeywords;
        const kwText = Array.isArray(kw) ? kw.join(', ') : '';
        setSeoDefaults({
          defaultTitle: data.seoDefaults?.defaultTitle || '',
          titleSuffix: data.seoDefaults?.titleSuffix || '',
          defaultDescription: data.seoDefaults?.defaultDescription || '',
          defaultKeywordsText: kwText,
          defaultOgImage: data.seoDefaults?.defaultOgImage || '',
          canonicalBase: data.seoDefaults?.canonicalBase || '',
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const keywordsArray = seoDefaults.defaultKeywordsText
        ? seoDefaults.defaultKeywordsText.split(',').map((k) => k.trim()).filter(Boolean)
        : [];

      const payload = {
        business,
        contact,
        social,
        branding,
        globalCta,
        seoDefaults: {
          defaultTitle: seoDefaults.defaultTitle,
          titleSuffix: seoDefaults.titleSuffix,
          defaultDescription: seoDefaults.defaultDescription,
          defaultKeywords: keywordsArray,
          defaultOgImage: seoDefaults.defaultOgImage,
          canonicalBase: seoDefaults.canonicalBase,
        },
      };

      const updated = await updateAdminSettings(payload);
      setSettings(updated);
      showNotification('Global website settings saved successfully.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save global settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
        <AdminNavbar activeTab="settings" />

        {/* Global Notification Toast */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border text-xs font-mono shadow-2xl transition-all ${
              notification.type === 'error'
                ? 'bg-red-950/90 border-red-800 text-red-200'
                : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252830] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C25E34] uppercase tracking-wider mb-1">
                <Settings className="w-3.5 h-3.5" />
                <span>Phase 3E: Global Website Settings</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
                Global Website Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8782] mt-1 max-w-2xl">
                Manage universal business contact credentials, office address, social handles, branding logos, and default search engine metadata.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadSettings}
                disabled={isLoading || isSaving}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181A20] hover:bg-[#252830] border border-[#2A2E3B] text-xs font-mono text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono text-white font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-xs font-mono text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Settings Tabs & Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Vertical Tab Selector */}
            <div className="lg:col-span-3 space-y-1 bg-[#14161C] border border-[#252830] p-2 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#C25E34] text-white font-semibold shadow-xs'
                        : 'text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212A]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Tab Content Form */}
            <div className="lg:col-span-9 bg-[#14161C] border border-[#252830] rounded-xl p-6 sm:p-8">
              <form onSubmit={handleSave} className="space-y-6">
                {/* 1. GENERAL TAB */}
                {activeTab === 'general' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#252830] pb-3">
                      <h2 className="font-display text-lg font-bold text-[#FAF8F5]">General Business Identity</h2>
                      <p className="text-xs text-[#8A8782]">Core agency naming, editorial tagline, and established presence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Full Registered Business Name</label>
                        <input
                          type="text"
                          value={business.businessName}
                          onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Short Brand Name</label>
                        <input
                          type="text"
                          value={business.shortName}
                          onChange={(e) => setBusiness({ ...business, shortName: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#A09D98]">Official Tagline</label>
                      <input
                        type="text"
                        value={business.tagline}
                        onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                        className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#A09D98]">Company Overview / Description</label>
                      <textarea
                        rows={3}
                        value={business.description}
                        onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                        className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] resize-y"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Founded Location</label>
                        <input
                          type="text"
                          value={business.foundedLocation}
                          onChange={(e) => setBusiness({ ...business, foundedLocation: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Business Operating Hours</label>
                        <input
                          type="text"
                          value={business.workingHours}
                          onChange={(e) => setBusiness({ ...business, workingHours: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    {/* Global CTA */}
                    <div className="pt-4 border-t border-[#252830] space-y-4">
                      <h3 className="font-display text-sm font-bold text-[#FAF8F5]">Global Primary Call to Action</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono text-[#A09D98]">CTA Button Label</label>
                          <input
                            type="text"
                            value={globalCta.ctaLabel}
                            onChange={(e) => setGlobalCta({ ...globalCta, ctaLabel: e.target.value })}
                            className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono text-[#A09D98]">CTA Destination Link</label>
                          <input
                            type="text"
                            value={globalCta.ctaUrl}
                            onChange={(e) => setGlobalCta({ ...globalCta, ctaUrl: e.target.value })}
                            className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONTACT & LOCATION TAB */}
                {activeTab === 'contact' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#252830] pb-3">
                      <h2 className="font-display text-lg font-bold text-[#FAF8F5]">Contact & Headquarters Location</h2>
                      <p className="text-xs text-[#8A8782]">Direct communication channels and verified physical location details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Primary Email (hello@...)</label>
                        <input
                          type="email"
                          value={contact.primaryEmail}
                          onChange={(e) => setContact({ ...contact, primaryEmail: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Secondary / Direct Email</label>
                        <input
                          type="email"
                          value={contact.secondaryEmail}
                          onChange={(e) => setContact({ ...contact, secondaryEmail: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Phone Number</label>
                        <input
                          type="text"
                          value={contact.phone}
                          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">WhatsApp Direct Number</label>
                        <input
                          type="text"
                          value={contact.whatsapp}
                          onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#A09D98]">WhatsApp Direct Click-to-Chat URL</label>
                      <input
                        type="text"
                        value={contact.whatsappUrl}
                        onChange={(e) => setContact({ ...contact, whatsappUrl: e.target.value })}
                        className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#A09D98]">Full Physical Office Address</label>
                      <input
                        type="text"
                        value={contact.address}
                        onChange={(e) => setContact({ ...contact, address: e.target.value })}
                        className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">City</label>
                        <input
                          type="text"
                          value={contact.city}
                          onChange={(e) => setContact({ ...contact, city: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Region / Province</label>
                        <input
                          type="text"
                          value={contact.region}
                          onChange={(e) => setContact({ ...contact, region: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Country</label>
                        <input
                          type="text"
                          value={contact.country}
                          onChange={(e) => setContact({ ...contact, country: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#A09D98]">Google Maps / Place URL</label>
                      <input
                        type="text"
                        value={contact.mapUrl}
                        onChange={(e) => setContact({ ...contact, mapUrl: e.target.value })}
                        className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 3. SOCIAL CHANNELS TAB */}
                {activeTab === 'social' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#252830] pb-3">
                      <h2 className="font-display text-lg font-bold text-[#FAF8F5]">Official Social Channels</h2>
                      <p className="text-xs text-[#8A8782]">Social media profile URLs rendered in the footer and contact sections.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">LinkedIn Company Page</label>
                        <input
                          type="text"
                          value={social.linkedin}
                          onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Instagram Profile URL</label>
                        <input
                          type="text"
                          value={social.instagram}
                          onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Facebook Page URL</label>
                        <input
                          type="text"
                          value={social.facebook}
                          onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">X (formerly Twitter) URL</label>
                        <input
                          type="text"
                          value={social.x}
                          onChange={(e) => setSocial({ ...social, x: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Google Business Profile URL</label>
                        <input
                          type="text"
                          value={social.googleBusinessProfile}
                          onChange={(e) => setSocial({ ...social, googleBusinessProfile: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono text-[#A09D98]">YouTube Channel URL (optional)</label>
                          <input
                            type="text"
                            value={social.youtube}
                            onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                            className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono text-[#A09D98]">GitHub Organization URL (optional)</label>
                          <input
                            type="text"
                            value={social.github}
                            onChange={(e) => setSocial({ ...social, github: e.target.value })}
                            className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BRANDING TAB */}
                {activeTab === 'branding' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#252830] pb-3">
                      <h2 className="font-display text-lg font-bold text-[#FAF8F5]">Branding & Graphical Assets</h2>
                      <p className="text-xs text-[#8A8782]">Visual assets for website navbar, favicon, and social media share cards.</p>
                    </div>

                    <div className="space-y-5">
                      <ImageFieldPicker
                        label="Logo Asset (Optional - defaults to SVG text mark)"
                        value={branding.logo}
                        onChange={(val) => setBranding({ ...branding, logo: val })}
                        altValue={branding.logoAlt}
                        onAltChange={(val) => setBranding({ ...branding, logoAlt: val })}
                        defaultFolder="haxudio/branding"
                        showAltInput={true}
                        placeholder="/src/assets/... or https://..."
                        helperText="Navbar and brand visual asset."
                      />

                      <ImageFieldPicker
                        label="Favicon Asset (Icon)"
                        value={branding.favicon}
                        onChange={(val) => setBranding({ ...branding, favicon: val })}
                        defaultFolder="haxudio/branding"
                        showAltInput={false}
                        placeholder="/favicon.ico or asset URL"
                        helperText="Browser tab icon asset."
                      />

                      <ImageFieldPicker
                        label="Default Social Share Card (OG Image)"
                        value={branding.defaultOgImage}
                        onChange={(val) => setBranding({ ...branding, defaultOgImage: val })}
                        defaultFolder="haxudio/seo"
                        showAltInput={false}
                        placeholder="https://... or /src/assets/images/..."
                        helperText="Default 1200x630 social preview card for Open Graph sharing."
                      />
                    </div>
                  </div>
                )}

                {/* 5. SEO TAB */}
                {activeTab === 'seo' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#252830] pb-3">
                      <h2 className="font-display text-lg font-bold text-[#FAF8F5]">Default Search Engine Optimization (SEO)</h2>
                      <p className="text-xs text-[#8A8782]">Global metadata used when specific pages do not declare their own overrides.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Default Site Title</label>
                        <input
                          type="text"
                          value={seoDefaults.defaultTitle}
                          onChange={(e) => setSeoDefaults({ ...seoDefaults, defaultTitle: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Title Brand Suffix</label>
                        <input
                          type="text"
                          value={seoDefaults.titleSuffix}
                          onChange={(e) => setSeoDefaults({ ...seoDefaults, titleSuffix: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Default Meta Description</label>
                        <textarea
                          rows={3}
                          value={seoDefaults.defaultDescription}
                          onChange={(e) => setSeoDefaults({ ...seoDefaults, defaultDescription: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] resize-y"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Default SEO Keywords (comma separated)</label>
                        <input
                          type="text"
                          value={seoDefaults.defaultKeywordsText}
                          onChange={(e) => setSeoDefaults({ ...seoDefaults, defaultKeywordsText: e.target.value })}
                          placeholder="Digital agency Quetta, Web development Pakistan, SEO Balochistan"
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#A09D98]">Canonical Base URL</label>
                        <input
                          type="text"
                          value={seoDefaults.canonicalBase}
                          onChange={(e) => setSeoDefaults({ ...seoDefaults, canonicalBase: e.target.value })}
                          className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Footer Save Button */}
                <div className="pt-6 border-t border-[#252830] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#8A8782]">
                    * Changes take effect across public navigation, footer, and contact sections immediately upon saving.
                  </span>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono text-white font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
