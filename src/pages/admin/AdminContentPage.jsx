import React, { useState, useEffect, useMemo } from 'react';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminNavbar from '../../components/admin/AdminNavbar';
import ImageFieldPicker from '../../components/admin/ImageFieldPicker';
import {
  fetchAdminContent,
  updateAdminContent,
} from '../../services/contentApi';
import {
  FileText,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  X,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const PAGE_SECTIONS_CONFIG = {
  home: [
    {
      id: 'hero',
      name: 'Homepage Hero Banner',
      desc: 'Top above-the-fold headline, supporting copy, badges, and CTA buttons.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow / Sub-label', type: 'text', placeholder: 'Quetta, Balochistan · Digital Solutions Agency' },
        { key: 'heading', label: 'Main Headline', type: 'text', placeholder: 'Digital Solutions That Help Your Business Grow.' },
        { key: 'description', label: 'Supporting Description', type: 'textarea', rows: 3 },
        { key: 'primaryCtaLabel', label: 'Primary CTA Button Label', type: 'text', placeholder: 'Build Your Quote' },
        { key: 'primaryCtaUrl', label: 'Primary CTA Destination URL', type: 'text', placeholder: '/contact' },
        { key: 'secondaryCtaLabel', label: 'Secondary CTA Button Label', type: 'text', placeholder: 'View Capabilities' },
        { key: 'secondaryCtaUrl', label: 'Secondary CTA Destination URL', type: 'text', placeholder: '/services' },
        { key: 'heroImageUrl', label: 'Hero Image Asset URL', type: 'text', placeholder: '/src/assets/images/hero_agency_studio_1790427835770.webp' },
        { key: 'heroImageAlt', label: 'Hero Image Alt Text', type: 'text', placeholder: 'Haxudio Digital Solutions studio' },
      ],
    },
    {
      id: 'guarantee',
      name: 'Agency Guarantee Banner',
      desc: 'Positioning banner with speed and security guarantees.',
      fields: [
        { key: 'eyebrow', label: 'Section Label', type: 'text', placeholder: 'Our Guarantee' },
        { key: 'heading', label: 'Headline', type: 'text', placeholder: 'Modern engineering tailored for Balochistan and expanding across Pakistan.' },
        { key: 'badge1', label: 'Feature Badge 1', type: 'text', placeholder: 'Zero Vulnerable Plugins' },
        { key: 'badge2', label: 'Feature Badge 2', type: 'text', placeholder: 'Sub-Second Page Speeds' },
      ],
    },
    {
      id: 'agencyIntro',
      name: 'Agency Introduction & Quetta Hub',
      desc: 'Editorial narrative describing the Quetta engineering hub.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: "Balochistan's Digital Partner" },
        { key: 'heading', label: 'Headline', type: 'text', placeholder: 'Engineering Commercial Independence for Local Enterprises.' },
        { key: 'description', label: 'Main Description', type: 'textarea', rows: 4 },
        { key: 'ctaLabel', label: 'CTA Button Label', type: 'text', placeholder: 'Contact Quetta Office' },
        { key: 'ctaUrl', label: 'CTA URL', type: 'text', placeholder: '/contact' },
        { key: 'hubImageUrl', label: 'Hub Image URL', type: 'text', placeholder: '/src/assets/images/haxudio_quetta_hub_1790427878986.webp' },
        { key: 'hubImageCaption', label: 'Image Caption', type: 'text', placeholder: 'Haxudio Agency Studio — Quetta, Balochistan, Pakistan' },
      ],
    },
    {
      id: 'whyHaxudio',
      name: 'Why Haxudio / Approach',
      desc: 'Core value propositions and structured pillars.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Why Haxudio' },
        { key: 'heading', label: 'Headline', type: 'text', placeholder: 'Engineered for Results. Rooted in Accountability.' },
        { key: 'description', label: 'Summary Description', type: 'textarea', rows: 3 },
      ],
      hasRepeatablePoints: true,
    },
    {
      id: 'finalCta',
      name: 'Homepage Final Call to Action',
      desc: 'Bottom conversion banner before the footer.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Start Your Project' },
        { key: 'heading', label: 'Headline', type: 'text', placeholder: 'Ready to Elevate Your Digital Footprint?' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'buttonLabel', label: 'Button Label', type: 'text', placeholder: 'Start a Conversation' },
        { key: 'buttonUrl', label: 'Button URL', type: 'text', placeholder: '/contact' },
      ],
    },
  ],
  about: [
    {
      id: 'hero',
      name: 'About Page Hero',
      desc: 'Top headline, regional indicator, and opening mission narrative.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow / Origin', type: 'text', placeholder: 'Rooted in Quetta, Balochistan · Serving All of Pakistan' },
        { key: 'heading', label: 'Main Headline', type: 'text', placeholder: 'Building Digital Products with Pride, Integrity, and Craftsmanship.' },
        { key: 'description', label: 'Opening Narrative', type: 'textarea', rows: 4 },
      ],
    },
    {
      id: 'story',
      name: 'Narrative & Origin Story',
      desc: 'Detailed background on who we are, technology stance, and Quetta roots.',
      fields: [
        { key: 'heading', label: 'Section Heading', type: 'text', placeholder: 'Who We Are' },
        { key: 'paragraph1', label: 'Paragraph 1: Core Identity', type: 'textarea', rows: 3 },
        { key: 'paragraph2', label: 'Paragraph 2: Anti-Bloat Technical Stance', type: 'textarea', rows: 3 },
        { key: 'paragraph3', label: 'Paragraph 3: Regional Partners & Location', type: 'textarea', rows: 3 },
        { key: 'imageUrl', label: 'Studio Photography URL', type: 'text', placeholder: '/src/assets/images/haxudio_quetta_hub_1790427878986.webp' },
        { key: 'imageCaption', label: 'Image Caption', type: 'text', placeholder: 'Haxudio Agency Studio — Quetta, Balochistan, Pakistan' },
      ],
    },
    {
      id: 'mission',
      name: 'Our Mission Statement',
      desc: 'Core operational mission for business longevity.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Our Mission' },
        { key: 'heading', label: 'Mission Title', type: 'text', placeholder: 'To Engineer Enduring Digital Assets' },
        { key: 'description', label: 'Mission Statement', type: 'textarea', rows: 4 },
      ],
    },
    {
      id: 'vision',
      name: 'Our Vision',
      desc: 'Long-term regional aspiration for software excellence.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Our Vision' },
        { key: 'heading', label: 'Vision Title', type: 'text', placeholder: 'Elevating the Digital Standard in Balochistan' },
        { key: 'description', label: 'Vision Statement', type: 'textarea', rows: 4 },
      ],
    },
    {
      id: 'values',
      name: 'Core Principles & Values',
      desc: 'Guiding tenets displayed as numbered cards.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Our Principles' },
        { key: 'heading', label: 'Heading', type: 'text', placeholder: 'The Values That Guide Every Decision.' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
      ],
      hasRepeatableValues: true,
    },
    {
      id: 'finalCta',
      name: 'About Page Final Call to Action',
      desc: 'Closing conversion prompt on the About page.',
      fields: [
        { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Ready to Build Something Remarkable?' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'buttonLabel', label: 'Button Label', type: 'text', placeholder: 'Build Your Quote' },
        { key: 'buttonUrl', label: 'Button URL', type: 'text', placeholder: '/contact' },
      ],
    },
  ],
  contact: [
    {
      id: 'hero',
      name: 'Contact Page Hero & Introduction',
      desc: 'Lead headline and introduction above the inquiry form.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Start a Conversation · Quetta, Balochistan, Pakistan' },
        { key: 'heading', label: 'Main Headline', type: 'text', placeholder: 'Contact Haxudio Digital Solutions.' },
        { key: 'description', label: 'Lead Paragraph', type: 'textarea', rows: 3 },
        { key: 'supportingText', label: 'Response Guarantee & Secondary Context', type: 'textarea', rows: 3 },
      ],
    },
    {
      id: 'supporting',
      name: 'Contact Supporting Details',
      desc: 'Headings for the inquiry form and office details.',
      fields: [
        { key: 'formHeading', label: 'Form Section Heading', type: 'text', placeholder: 'Project Discovery & Quote Request' },
        { key: 'formSubheading', label: 'Form Subtitle', type: 'text', placeholder: 'Fill in the parameters below. We respect your confidentiality.' },
        { key: 'responseTimePromise', label: 'Response Guarantee Callout', type: 'text', placeholder: 'Direct engineer response guaranteed within 24 hours.' },
        { key: 'locationHeading', label: 'Location Card Heading', type: 'text', placeholder: 'Quetta Headquarters' },
        { key: 'hoursHeading', label: 'Hours Card Heading', type: 'text', placeholder: 'Business Operating Hours' },
      ],
    },
  ],
};

export default function AdminContentPage() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [contentData, setContentData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Editor Modal State
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [formPoints, setFormPoints] = useState([]);
  const [formValues, setFormValues] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminContent();
      const map = {};
      if (res && res.data) {
        for (const item of res.data) {
          map[`${item.page.toLowerCase()}:${item.section.toLowerCase()}`] = item;
        }
      }
      setContentData(map);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch website content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  // Open Section Editor
  const handleEditClick = (sectionConf) => {
    const key = `${selectedPage.toLowerCase()}:${sectionConf.id.toLowerCase()}`;
    const existingDoc = contentData[key] || {};
    const existingContent = existingDoc.content || {};

    const initialFields = {};
    for (const f of sectionConf.fields || []) {
      initialFields[f.key] = existingContent[f.key] !== undefined ? existingContent[f.key] : '';
    }

    setEditingSection(sectionConf);
    setFormData(initialFields);
    setFormPoints(Array.isArray(existingContent.points) ? existingContent.points : []);
    setFormValues(Array.isArray(existingContent.items) ? existingContent.items : []);
    setIsActive(existingDoc.isActive !== false);
    setEditorError(null);
  };

  const handleFieldChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // Structured Repeatable Points (Why Haxudio)
  const handleAddPoint = () => {
    setFormPoints((prev) => [...prev, { title: '', description: '' }]);
  };

  const handlePointChange = (idx, field, val) => {
    setFormPoints((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemovePoint = (idx) => {
    setFormPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  // Structured Repeatable Values (About Values)
  const handleAddValue = () => {
    const nextNum = (formValues.length + 1).toString().padStart(2, '0');
    setFormValues((prev) => [...prev, { number: nextNum, title: '', description: '' }]);
  };

  const handleValueChange = (idx, field, val) => {
    setFormValues((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveValue = (idx) => {
    setFormValues((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save Section
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsSaving(true);
    setEditorError(null);

    try {
      const payloadContent = { ...formData };
      if (editingSection.hasRepeatablePoints) {
        payloadContent.points = formPoints.filter((p) => p.title.trim() || p.description.trim());
      }
      if (editingSection.hasRepeatableValues) {
        payloadContent.items = formValues.filter((v) => v.title.trim() || v.description.trim());
      }

      const pageKey = selectedPage.toLowerCase();
      const secKey = editingSection.id.toLowerCase();

      const res = await updateAdminContent(pageKey, secKey, {
        title: editingSection.name,
        content: payloadContent,
        isActive,
      });

      const updatedDoc = res.data;
      setContentData((prev) => ({
        ...prev,
        [`${pageKey}:${secKey}`]: updatedDoc,
      }));

      showNotification(`"${editingSection.name}" updated successfully.`);
      setEditingSection(null);
    } catch (err) {
      setEditorError(err.message || 'Failed to save section content');
    } finally {
      setIsSaving(false);
    }
  };

  const currentSections = PAGE_SECTIONS_CONFIG[selectedPage] || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
        <AdminNavbar activeTab="content" />

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
                <FileText className="w-3.5 h-3.5" />
                <span>Phase 3E: Website Content Management</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
                Website Content CMS
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8782] mt-1 max-w-2xl">
                Edit public website headlines, mission statements, narratives, guarantees, and call-to-actions directly without changing code.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadContent}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181A20] hover:bg-[#252830] border border-[#2A2E3B] text-xs font-mono text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Page Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-[#20232B] pb-3">
            {[
              { id: 'home', label: 'Homepage', count: PAGE_SECTIONS_CONFIG.home.length },
              { id: 'about', label: 'About Page', count: PAGE_SECTIONS_CONFIG.about.length },
              { id: 'contact', label: 'Contact Page', count: PAGE_SECTIONS_CONFIG.contact.length },
            ].map((tab) => {
              const isSelected = selectedPage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPage(tab.id)}
                  className={`px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#C25E34] text-white font-semibold shadow-sm'
                      : 'bg-[#14161C] text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212A] border border-[#252830]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#20232B] text-[#A09D98]'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Section Cards Grid */}
          <div className="space-y-4">
            {currentSections.map((sec) => {
              const doc = contentData[`${selectedPage.toLowerCase()}:${sec.id.toLowerCase()}`];
              const isCustomized = !!doc;
              const isSecActive = doc ? doc.isActive : true;

              return (
                <div
                  key={sec.id}
                  className="bg-[#14161C] border border-[#252830] hover:border-[#383C4A] rounded-xl p-5 sm:p-6 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-display font-bold text-lg text-[#FAF8F5]">
                          {sec.name}
                        </h2>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isCustomized
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                              : 'bg-neutral-800/60 border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {isCustomized ? 'CMS Active' : 'Default Bundled'}
                        </span>
                        {!isSecActive && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300">
                            Hidden / Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8782] max-w-2xl">{sec.desc}</p>
                      {doc?.updatedAt && (
                        <p className="text-[11px] font-mono text-[#55534F] pt-1">
                          Last updated: {new Date(doc.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleEditClick(sec)}
                      className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F222B] hover:bg-[#C25E34] text-xs font-mono text-[#FAF8F5] transition-all cursor-pointer border border-[#2E3240] hover:border-[#C25E34]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ============================================================== */}
        {/* Visual Content Editor Modal                                      */}
        {/* ============================================================== */}
        {editingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
            <div className="bg-[#14161C] border border-[#2D313D] rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#252830] pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#C25E34] uppercase tracking-wider">
                    Editing [{selectedPage.toUpperCase()}] Section
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAF8F5]">
                    {editingSection.name}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingSection(null)}
                  className="p-2 rounded-lg hover:bg-[#1F222B] text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editorError && (
                <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-800 text-xs font-mono text-red-200">
                  {editorError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">
                {/* Active Section Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#101217] border border-[#252830]">
                  <div>
                    <div className="text-xs font-semibold text-[#FAF8F5]">Section Visibility</div>
                    <div className="text-[11px] text-[#8A8782]">When disabled, this section is hidden from the public website.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#252830] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C25E34]" />
                  </label>
                </div>

                {/* Standard Configured Fields */}
                {editingSection.fields?.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    {f.key.toLowerCase().includes('image') ? (
                      <ImageFieldPicker
                        label={f.label}
                        value={formData[f.key] || ''}
                        onChange={(val) => handleFieldChange(f.key, val)}
                        defaultFolder="haxudio/content"
                        showAltInput={false}
                        placeholder={f.placeholder || ''}
                        helperText="Visual content for this section from Cloudinary."
                      />
                    ) : (
                      <>
                        <label className="block text-xs font-mono text-[#A09D98]">
                          {f.label}
                        </label>
                        {f.type === 'textarea' ? (
                          <textarea
                            rows={f.rows || 3}
                            value={formData[f.key] || ''}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={f.placeholder || ''}
                            className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-[#FAF8F5] leading-relaxed resize-y font-sans"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData[f.key] || ''}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={f.placeholder || ''}
                            className="w-full bg-[#101217] border border-[#252830] focus:border-[#C25E34] focus:outline-none rounded-lg px-3.5 py-2 text-xs text-[#FAF8F5] font-sans"
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Repeatable Points Editor (Why Haxudio) */}
                {editingSection.hasRepeatablePoints && (
                  <div className="space-y-3 pt-3 border-t border-[#252830]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#FAF8F5] font-semibold">
                        Value Proposition Points ({formPoints.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddPoint}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F222B] hover:bg-[#2A2E3B] text-[11px] font-mono text-[#FAF8F5] border border-[#2D313D] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Point</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formPoints.map((pt, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#101217] border border-[#252830] space-y-2 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-[#8A8782]">Point #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePoint(idx)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={pt.title || ''}
                            onChange={(e) => handlePointChange(idx, 'title', e.target.value)}
                            placeholder="Point Title (e.g. Custom Code, Zero Bloat)"
                            className="w-full bg-[#161820] border border-[#252830] rounded-md px-3 py-1.5 text-xs text-[#FAF8F5]"
                          />
                          <textarea
                            rows={2}
                            value={pt.description || ''}
                            onChange={(e) => handlePointChange(idx, 'description', e.target.value)}
                            placeholder="Point Description..."
                            className="w-full bg-[#161820] border border-[#252830] rounded-md px-3 py-1.5 text-xs text-[#FAF8F5] resize-y"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repeatable Values Editor (About Values) */}
                {editingSection.hasRepeatableValues && (
                  <div className="space-y-3 pt-3 border-t border-[#252830]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#FAF8F5] font-semibold">
                        Core Principles / Values ({formValues.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddValue}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F222B] hover:bg-[#2A2E3B] text-[11px] font-mono text-[#FAF8F5] border border-[#2D313D] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Principle</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formValues.map((v, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#101217] border border-[#252830] space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-[#8A8782]">Principle #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveValue(idx)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={v.number || ''}
                              onChange={(e) => handleValueChange(idx, 'number', e.target.value)}
                              placeholder="01"
                              className="col-span-2 bg-[#161820] border border-[#252830] rounded-md px-2.5 py-1.5 text-xs text-[#FAF8F5] font-mono text-center"
                            />
                            <input
                              type="text"
                              value={v.title || ''}
                              onChange={(e) => handleValueChange(idx, 'title', e.target.value)}
                              placeholder="Principle Title (e.g. Engineering Rigor Over Hacks)"
                              className="col-span-10 bg-[#161820] border border-[#252830] rounded-md px-3 py-1.5 text-xs text-[#FAF8F5]"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={v.description || ''}
                            onChange={(e) => handleValueChange(idx, 'description', e.target.value)}
                            placeholder="Principle Description..."
                            className="w-full bg-[#161820] border border-[#252830] rounded-md px-3 py-1.5 text-xs text-[#FAF8F5] resize-y"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252830]">
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-[#181A20] hover:bg-[#252830] border border-[#2A2E3B] text-xs font-mono text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono text-white font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Section'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
