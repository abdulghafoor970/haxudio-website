'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowUpDown,
  Sparkles,
  ArrowLeft,
  X,
  Loader2,
  Sliders,
  Globe,
  Tag,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import ImageFieldPicker from '../../components/admin/ImageFieldPicker';
import {
  fetchAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  togglePublishAdminService,
} from '../../services/serviceApi';

const AVAILABLE_ICONS = [
  'Sparkles',
  'Code2',
  'Palette',
  'Megaphone',
  'Search',
  'Layers',
  'Smartphone',
  'Video',
  'Cpu',
  'TrendingUp',
  'Globe',
];

export default function AdminServicesPage() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  // Services State
  const [services, setServices] = useState([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, drafts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null = Add, object = Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorError, setEditorError] = useState(null);

  // Delete Confirmation State
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active Editor Tab
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'content' | 'features' | 'seo'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    eyebrow: 'Digital Capability',
    tagline: '',
    shortDescription: '',
    description: '',
    heroDescription: '',
    icon: 'Sparkles',
    image: '',
    imageAlt: '',
    problem: '',
    solution: '',
    features: [],
    deliverables: [],
    benefits: [],
    techStack: [],
    localFocus: 'Quetta & Pakistan',
    ctaText: 'Get a Proposal',
    ctaLink: '/contact',
    isPublished: true,
    displayOrder: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
  });

  // Feature tag input temporary state
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newTechInput, setNewTechInput] = useState('');

  // Fetch Services from API
  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminServices();
      setServices(res.data || []);
      setCounts({
        total: res.total || 0,
        published: res.published || 0,
        drafts: res.drafts || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load services from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      slug: '',
      eyebrow: '0' + (services.length + 1) + '. Capability',
      tagline: '',
      shortDescription: '',
      description: '',
      heroDescription: '',
      icon: 'Sparkles',
      image: '',
      imageAlt: '',
      problem: '',
      solution: '',
      features: ['Modern UI Architecture', 'Speed Optimization', 'Cross-Device Responsiveness'],
      deliverables: ['Custom Codebase', 'Documentation', 'Deployment Support'],
      benefits: ['Sub-second load times', 'Scalable architecture', 'Search engine ready'],
      techStack: ['JavaScript', 'React', 'Tailwind CSS'],
      localFocus: 'Serving Quetta & Pakistani commercial enterprises',
      ctaText: 'Get a Proposal',
      ctaLink: '/contact',
      isPublished: true,
      displayOrder: services.length,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ['Haxudio', 'Quetta', 'Digital Agency'],
    });
    setEditorError(null);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      slug: service.slug || '',
      eyebrow: service.eyebrow || 'Digital Capability',
      tagline: service.tagline || '',
      shortDescription: service.shortDescription || '',
      description: service.description || '',
      heroDescription: service.heroDescription || '',
      icon: service.icon || 'Sparkles',
      image: service.image || '',
      imageAlt: service.imageAlt || '',
      problem: service.problem || '',
      solution: service.solution || '',
      features: service.features || service.deliverables || [],
      deliverables: service.deliverables || service.features || [],
      benefits: service.benefits || [],
      techStack: service.techStack || [],
      localFocus: service.localFocus || 'Quetta & Pakistan',
      ctaText: service.ctaText || 'Get a Proposal',
      ctaLink: service.ctaLink || '/contact',
      isPublished: typeof service.isPublished === 'boolean' ? service.isPublished : true,
      displayOrder: typeof service.displayOrder === 'number' ? service.displayOrder : 0,
      seoTitle: service.seoTitle || '',
      seoDescription: service.seoDescription || '',
      seoKeywords: service.seoKeywords || [],
    });
    setEditorError(null);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  // Auto-generate slug when title changes (if adding new service)
  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, title: titleVal };
      if (!editingService) {
        updated.slug = titleVal
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (!prev.seoTitle) {
          updated.seoTitle = `${titleVal} | Haxudio Digital Solutions`;
        }
      }
      return updated;
    });
  };

  // Toggle Published
  const handleTogglePublish = async (service) => {
    try {
      const updated = await togglePublishAdminService(service._id);
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, isPublished: updated.isPublished } : s))
      );
      setCounts((prev) => ({
        ...prev,
        published: updated.isPublished ? prev.published + 1 : prev.published - 1,
        drafts: updated.isPublished ? prev.drafts - 1 : prev.drafts + 1,
      }));
      showNotification(
        `"${service.title}" is now ${updated.isPublished ? 'Published on website' : 'Saved as Draft'}`,
        'success'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to toggle status', 'error');
    }
  };

  // Handle Save (Create or Update)
  const handleSubmitEditor = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setEditorError('Service title is required');
      return;
    }
    if (!formData.slug.trim()) {
      setEditorError('Slug is required and must be URL-safe');
      return;
    }

    setIsSubmitting(true);
    setEditorError(null);

    try {
      if (editingService) {
        // Update
        const updated = await updateAdminService(editingService._id, formData);
        setServices((prev) => prev.map((s) => (s._id === editingService._id ? updated : s)));
        showNotification(`Service "${updated.title}" updated successfully!`);
      } else {
        // Create
        const created = await createAdminService(formData);
        setServices((prev) => [...prev, created]);
        setCounts((prev) => ({
          ...prev,
          total: prev.total + 1,
          published: created.isPublished ? prev.published + 1 : prev.published,
          drafts: !created.isPublished ? prev.drafts + 1 : prev.drafts,
        }));
        showNotification(`Service "${created.title}" created successfully!`);
      }
      setIsEditorOpen(false);
    } catch (err) {
      setEditorError(err.message || 'Error saving service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);

    try {
      await deleteAdminService(serviceToDelete._id);
      setServices((prev) => prev.filter((s) => s._id !== serviceToDelete._id));
      setCounts((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        published: serviceToDelete.isPublished ? Math.max(0, prev.published - 1) : prev.published,
        drafts: !serviceToDelete.isPublished ? Math.max(0, prev.drafts - 1) : prev.drafts,
      }));
      showNotification(`Service "${serviceToDelete.title}" deleted.`);
      setServiceToDelete(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete service', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.shortDescription && s.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'published') return s.isPublished;
      if (statusFilter === 'draft') return !s.isPublished;
      return true;
    });
  }, [services, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
      <AdminNavbar activeTab="services" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Floating Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-all animate-in fade-in slide-in-from-top-2 ${
              notification.type === 'error'
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-current opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A8782] mb-1">
              <Link href="/admin/dashboard" className="hover:text-[#FAF8F5] inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#C25E34]">Services CMS (Phase 3A)</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
              Services Management
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8782] mt-1">
              Add, update, reorder, or publish services dynamically. Content updates instantly sync to MongoDB Atlas and the public website.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadServices}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181A22] hover:bg-[#222530] border border-[#252830] text-xs font-mono text-[#A09D98] hover:text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh services from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C25E34] hover:bg-[#d46a3d] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#8A8782]">Total Services</span>
              <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{counts.total}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1D2028] border border-[#2D313D] flex items-center justify-center text-[#FAF8F5]">
              <Layers className="w-5 h-5 text-[#C25E34]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-emerald-400">Published (Public)</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{counts.published}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-amber-400">Drafts (Hidden)</span>
              <div className="text-2xl font-bold font-mono text-amber-400">{counts.drafts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <EyeOff className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A8782] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] placeholder-[#666461] focus:outline-none focus:border-[#C25E34]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8782] hover:text-[#FAF8F5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0D0E11] rounded-lg border border-[#252830] text-xs font-mono w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#222530] text-[#FAF8F5] font-semibold'
                  : 'text-[#8A8782] hover:text-[#FAF8F5]'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'published'
                  ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                  : 'text-[#8A8782] hover:text-emerald-400'
              }`}
            >
              Published ({counts.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'draft'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold'
                  : 'text-[#8A8782] hover:text-amber-400'
              }`}
            >
              Drafts ({counts.drafts})
            </button>
          </div>
        </div>

        {/* Services Table List */}
        <div className="rounded-xl bg-[#14161C] border border-[#252830] overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 text-[#C25E34] animate-spin" />
              <p className="text-xs font-mono text-[#8A8782]">Connecting to MongoDB Atlas...</p>
            </div>
          ) : error ? (
            <div className="py-16 px-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm font-semibold text-rose-300">{error}</p>
              <button
                onClick={loadServices}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#252830] text-xs font-mono text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Layers className="w-10 h-10 text-[#44423F] mx-auto" />
              <p className="text-sm font-semibold text-[#FAF8F5]">No services found</p>
              <p className="text-xs text-[#8A8782] max-w-sm mx-auto">
                {searchTerm
                  ? 'No services matched your search criteria.'
                  : 'Your services collection is currently empty. Click "Add New Service" to create one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101217] border-b border-[#252830] font-mono text-[#8A8782] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Order</th>
                    <th className="py-3 px-4">Service Details</th>
                    <th className="py-3 px-4 hidden md:table-cell">Slug</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Features</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F222B]">
                  {filteredServices.map((service) => (
                    <tr
                      key={service._id || service.slug}
                      className="hover:bg-[#181A22]/70 transition-colors group"
                    >
                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-[#8A8782]">
                        #{service.displayOrder ?? 0}
                      </td>

                      {/* Title & Eyebrow */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#FAF8F5] group-hover:text-[#C25E34] transition-colors">
                              {service.title}
                            </span>
                            {service.isPublished && (
                              <a
                                href={`/services/${service.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#8A8782] hover:text-[#FAF8F5] transition-colors"
                                title="View on live site"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8A8782] line-clamp-1">
                            {service.shortDescription || service.eyebrow}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#A09D98] hidden md:table-cell">
                        /services/<span className="text-[#FAF8F5]">{service.slug}</span>
                      </td>

                      {/* Features count */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded bg-[#1B1E26] border border-[#282C38] text-[10px] font-mono text-[#8A8782]">
                          {(service.features?.length || service.deliverables?.length || 0)} items
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(service)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                            service.isPublished
                              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                          }`}
                          title="Click to toggle published status"
                        >
                          {service.isPublished ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(service)}
                            className="p-1.5 rounded-md hover:bg-[#252830] text-[#A09D98] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setServiceToDelete(service)}
                            className="p-1.5 rounded-md hover:bg-rose-950/50 text-[#8A8782] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* SERVICE EDITOR MODAL (Add / Edit) */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#252830] flex items-center justify-between bg-[#111318]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                  {editingService ? `Edit Service: ${editingService.title}` : 'Create New Digital Service'}
                </h3>
                <p className="text-xs text-[#8A8782]">
                  {editingService ? 'Modifying service document in MongoDB Atlas.' : 'Add a new capability to the Haxudio website.'}
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-md text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {editorError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editorError}</span>
              </div>
            )}

            {/* Editor Tabs Navigation */}
            <div className="px-6 pt-3 border-b border-[#252830] flex items-center gap-2 bg-[#12141A] text-xs font-mono overflow-x-auto">
              {[
                { id: 'general', label: '1. General & Details' },
                { id: 'content', label: '2. Problem & Solution' },
                { id: 'features', label: '3. Features & Deliverables' },
                { id: 'seo', label: '4. SEO & Metadata' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#C25E34] text-[#FAF8F5]'
                      : 'border-transparent text-[#8A8782] hover:text-[#FAF8F5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body / Tab Content */}
            <form onSubmit={handleSubmitEditor} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: General Info */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Service Title <span className="text-[#C25E34]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. Mobile App Development"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        URL Slug <span className="text-[#C25E34]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. mobile-app-development"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <span className="text-[10px] text-[#8A8782] block">
                        Will be live at /services/{formData.slug || 'slug'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Eyebrow */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Category / Eyebrow
                      </label>
                      <input
                        type="text"
                        value={formData.eyebrow}
                        onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                        placeholder="e.g. 01. Engineering"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>

                    {/* Display Order */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Display Order #
                      </label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>

                    {/* Published Toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Publication Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          formData.isPublished
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                            : 'bg-[#181A20] border-[#2A2E3B] text-[#8A8782]'
                        }`}
                      >
                        {formData.isPublished ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Published (Visible)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Draft (Hidden)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Summary / Short Description (Displayed on cards)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Concise overview of what this service delivers..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>

                  {/* Service Cover Image Asset Picker */}
                  <ImageFieldPicker
                    label="Service Cover Image & Media"
                    value={formData.image}
                    onChange={(val) => setFormData({ ...formData, image: val })}
                    altValue={formData.imageAlt}
                    onAltChange={(val) => setFormData({ ...formData, imageAlt: val })}
                    defaultFolder="haxudio/services"
                    showAltInput={true}
                    helperText="Select an asset from the Cloudinary media library or upload a new visual."
                  />
                </div>
              )}

              {/* TAB 2: Content & Copy */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {/* Hero Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Hero Detailed Narrative
                    </label>
                    <textarea
                      rows={3}
                      value={formData.heroDescription}
                      onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                      placeholder="Comprehensive overview displayed at the top of the service detail page..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>

                  {/* Problem & Solution Dual Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-rose-300">
                        The Client Problem / Pain Point
                      </label>
                      <textarea
                        rows={3}
                        value={formData.problem}
                        onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                        placeholder="What challenges or bottlenecks do clients experience before hiring Haxudio?"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-emerald-300">
                        The Haxudio Engineering Solution
                      </label>
                      <textarea
                        rows={3}
                        value={formData.solution}
                        onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                        placeholder="How does our team solve this problem systematically?"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Local Quetta Focus & CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Regional / Local Relevance
                      </label>
                      <input
                        type="text"
                        value={formData.localFocus}
                        onChange={(e) => setFormData({ ...formData, localFocus: e.target.value })}
                        placeholder="e.g. Quetta healthcare, restaurants & commercial firms"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Call to Action Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        placeholder="Get a Proposal"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Features & Deliverables */}
              {activeTab === 'features' && (
                <div className="space-y-5">
                  {/* Key Deliverables Tag Manager */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Key Deliverables / Features (Shown on cards and detail page)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newFeatureInput.trim()) {
                              setFormData({
                                ...formData,
                                deliverables: [...formData.deliverables, newFeatureInput.trim()],
                                features: [...formData.features, newFeatureInput.trim()],
                              });
                              setNewFeatureInput('');
                            }
                          }
                        }}
                        placeholder="Type a deliverable item and press Add..."
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFeatureInput.trim()) {
                            setFormData({
                              ...formData,
                              deliverables: [...formData.deliverables, newFeatureInput.trim()],
                              features: [...formData.features, newFeatureInput.trim()],
                            });
                            setNewFeatureInput('');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-[#252830] hover:bg-[#303440] text-xs font-mono text-[#FAF8F5]"
                      >
                        Add Item
                      </button>
                    </div>

                    {/* Tag list */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(formData.deliverables || []).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1B1E26] border border-[#2A2E3B] text-xs text-[#FAF8F5]"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.deliverables.filter((_, i) => i !== idx);
                              setFormData({ ...formData, deliverables: updated, features: updated });
                            }}
                            className="text-[#8A8782] hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Tag Manager */}
                  <div className="space-y-2 pt-3 border-t border-[#252830]">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Technologies & Tools Applied
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTechInput}
                        onChange={(e) => setNewTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTechInput.trim()) {
                              setFormData({
                                ...formData,
                                techStack: [...formData.techStack, newTechInput.trim()],
                              });
                              setNewTechInput('');
                            }
                          }
                        }}
                        placeholder="e.g. Next.js, Figma, MongoDB..."
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTechInput.trim()) {
                            setFormData({
                              ...formData,
                              techStack: [...formData.techStack, newTechInput.trim()],
                            });
                            setNewTechInput('');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-[#252830] hover:bg-[#303440] text-xs font-mono text-[#FAF8F5]"
                      >
                        Add Tech
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(formData.techStack || []).map((tech, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1B1E26] border border-[#2A2E3B] text-xs font-mono text-[#FAF8F5]"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                techStack: formData.techStack.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-[#8A8782] hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SEO & Metadata */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      SEO Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="e.g. Web Development Company in Quetta | Haxudio Digital Solutions"
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="Google search snippet description..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>

                  {/* Live Search Preview Box */}
                  <div className="p-4 rounded-lg bg-[#0D0E11] border border-[#252830] space-y-1">
                    <span className="text-[10px] font-mono text-[#8A8782] uppercase">
                      Google Search Snippet Preview
                    </span>
                    <div className="text-xs text-sky-400 font-medium truncate">
                      {formData.seoTitle || `${formData.title} | Haxudio Digital Solutions`}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 truncate">
                      https://www.haxudio.com/services/{formData.slug || 'service-slug'}
                    </div>
                    <p className="text-xs text-[#8A8782] line-clamp-2">
                      {formData.seoDescription || formData.shortDescription || 'Digital solutions built by Haxudio.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#252830] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8A8782]">
                  {editingService ? 'Updating MongoDB Atlas record' : 'Creating new document in MongoDB Atlas'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#181A20] hover:bg-[#252830] text-xs font-mono text-[#8A8782] hover:text-[#FAF8F5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C25E34] hover:bg-[#d46a3d] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#14161C] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                Delete Service?
              </h3>
              <p className="text-xs text-[#8A8782] mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="text-[#FAF8F5] font-semibold">"{serviceToDelete.title}"</span>?
                This action will remove the document from MongoDB Atlas and it will immediately disappear from the public website.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 rounded-lg bg-[#181A20] hover:bg-[#252830] text-xs font-mono text-[#8A8782] hover:text-[#FAF8F5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
