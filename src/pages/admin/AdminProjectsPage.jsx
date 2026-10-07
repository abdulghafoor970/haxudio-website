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
  ArrowLeft,
  X,
  Loader2,
  Star,
  Globe,
  Check,
  FolderKanban,
  Tag,
  Image,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import ImageFieldPicker from '../../components/admin/ImageFieldPicker';
import MediaSelectorModal from '../../components/admin/MediaSelectorModal';
import {
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  togglePublishAdminProject,
  toggleFeaturedAdminProject,
} from '../../services/projectApi';

const CATEGORY_OPTIONS = [
  { value: 'websites', label: 'Websites & Web Apps' },
  { value: 'branding', label: 'Branding & Identity' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'marketing', label: 'Marketing & SEO' },
  { value: 'graphic-design', label: 'Graphic Design' },
];

export default function AdminProjectsPage() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  // Projects State
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, drafts: 0, featured: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'featured'

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = Add, object = Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorError, setEditorError] = useState(null);

  // Delete Confirmation State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active Editor Tab
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'content' | 'media' | 'technology' | 'links' | 'seo'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'websites',
    client: '',
    clientType: '',
    industry: '',
    location: 'Quetta, Balochistan',
    coverImage: '',
    coverImageAlt: '',
    images: [],
    technologies: [],
    services: [],
    deliverables: [],
    projectUrl: '',
    liveUrl: '',
    completionDate: '2025',
    year: '2025',
    challenge: '',
    solution: '',
    results: '',
    featured: false,
    isPublished: true,
    displayOrder: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
  });

  // Temporary input state for tag managers
  const [newTechInput, setNewTechInput] = useState('');
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [newImageInput, setNewImageInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Load Projects from API
  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminProjects();
      setProjects(res.data || []);
      setCounts({
        total: res.total || 0,
        published: res.published || 0,
        drafts: res.drafts || 0,
        featured: res.featured || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load projects from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
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
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      category: 'websites',
      client: '',
      clientType: 'Commercial Client',
      industry: 'Enterprise Technology',
      location: 'Quetta, Balochistan',
      coverImage: '/src/assets/images/hero_agency_studio_1790427835770.webp',
      coverImageAlt: '',
      images: [],
      technologies: ['React', 'Tailwind CSS', 'Next.js'],
      services: ['Web Development', 'UI/UX Design'],
      deliverables: ['Custom Web Platform', 'Mobile Responsive Architecture', 'Analytics Setup'],
      projectUrl: '',
      liveUrl: '',
      completionDate: new Date().getFullYear().toString(),
      year: new Date().getFullYear().toString(),
      challenge: '',
      solution: '',
      results: '',
      featured: false,
      isPublished: true,
      displayOrder: projects.length,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ['Haxudio', 'Quetta', 'Portfolio'],
    });
    setEditorError(null);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      shortDescription: project.shortDescription || project.summary || '',
      description: project.description || '',
      category: project.category || 'websites',
      client: project.client || project.clientType || '',
      clientType: project.clientType || project.client || '',
      industry: project.industry || '',
      location: project.location || 'Quetta, Balochistan',
      coverImage: project.coverImage || project.image || '',
      coverImageAlt: project.coverImageAlt || '',
      images: Array.isArray(project.images) ? project.images : [],
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      services: Array.isArray(project.services) ? project.services : [],
      deliverables: Array.isArray(project.deliverables) ? project.deliverables : [],
      projectUrl: project.projectUrl || '',
      liveUrl: project.liveUrl || '',
      completionDate: project.completionDate || project.year || '',
      year: project.year || project.completionDate || '',
      challenge: project.challenge || '',
      solution: project.solution || '',
      results: project.results || project.outcome || '',
      featured: typeof project.featured === 'boolean' ? project.featured : false,
      isPublished: typeof project.isPublished === 'boolean' ? project.isPublished : true,
      displayOrder: typeof project.displayOrder === 'number' ? project.displayOrder : 0,
      seoTitle: project.seoTitle || '',
      seoDescription: project.seoDescription || '',
      seoKeywords: Array.isArray(project.seoKeywords) ? project.seoKeywords : [],
    });
    setEditorError(null);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  // Auto-generate slug when title changes (if adding new project)
  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, title: titleVal };
      if (!editingProject) {
        updated.slug = titleVal
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (!prev.seoTitle) {
          updated.seoTitle = `${titleVal} Case Study | Haxudio`;
        }
      }
      return updated;
    });
  };

  // Toggle Published
  const handleTogglePublish = async (project) => {
    try {
      const updated = await togglePublishAdminProject(project._id);
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? { ...p, isPublished: updated.isPublished } : p))
      );
      setCounts((prev) => ({
        ...prev,
        published: updated.isPublished ? prev.published + 1 : prev.published - 1,
        drafts: updated.isPublished ? prev.drafts - 1 : prev.drafts + 1,
      }));
      showNotification(
        `"${project.title}" is now ${updated.isPublished ? 'Published on website' : 'Saved as Draft'}`,
        'success'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to toggle status', 'error');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (project) => {
    try {
      const updated = await toggleFeaturedAdminProject(project._id);
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? { ...p, featured: updated.featured } : p))
      );
      setCounts((prev) => ({
        ...prev,
        featured: updated.featured ? prev.featured + 1 : prev.featured - 1,
      }));
      showNotification(
        `"${project.title}" ${updated.featured ? 'is now marked as Featured on Homepage' : 'unmarked from Featured'}`,
        'success'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to toggle featured status', 'error');
    }
  };

  // Handle Save (Create or Update)
  const handleSubmitEditor = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setEditorError('Project title is required');
      return;
    }
    if (!formData.slug.trim()) {
      setEditorError('Slug is required and must be URL-safe');
      return;
    }

    setIsSubmitting(true);
    setEditorError(null);

    try {
      if (editingProject) {
        // Update
        const updated = await updateAdminProject(editingProject._id, formData);
        setProjects((prev) => prev.map((p) => (p._id === editingProject._id ? updated : p)));
        showNotification(`Project "${updated.title}" updated successfully!`);
      } else {
        // Create
        const created = await createAdminProject(formData);
        setProjects((prev) => [...prev, created]);
        setCounts((prev) => ({
          ...prev,
          total: prev.total + 1,
          published: created.isPublished ? prev.published + 1 : prev.published,
          drafts: !created.isPublished ? prev.drafts + 1 : prev.drafts,
          featured: created.featured ? prev.featured + 1 : prev.featured,
        }));
        showNotification(`Project "${created.title}" created successfully!`);
      }
      setIsEditorOpen(false);
    } catch (err) {
      setEditorError(err.message || 'Error saving project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      await deleteAdminProject(projectToDelete._id);
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      setCounts((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        published: projectToDelete.isPublished ? Math.max(0, prev.published - 1) : prev.published,
        drafts: !projectToDelete.isPublished ? Math.max(0, prev.drafts - 1) : prev.drafts,
        featured: projectToDelete.featured ? Math.max(0, prev.featured - 1) : prev.featured,
      }));
      showNotification(`Project "${projectToDelete.title}" deleted.`);
      setProjectToDelete(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Projects List
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'published') return p.isPublished;
      if (statusFilter === 'draft') return !p.isPublished;
      if (statusFilter === 'featured') return p.featured;
      return true;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
      <AdminNavbar activeTab="projects" />

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
              <span className="text-[#C25E34]">Portfolio CMS (Phase 3B)</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
              Portfolio & Case Studies Management
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8782] mt-1">
              Manage client case studies, deliverables, technologies, and homepage highlights with direct synchronization to MongoDB Atlas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadProjects}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181A22] hover:bg-[#222530] border border-[#252830] text-xs font-mono text-[#A09D98] hover:text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh projects from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C25E34] hover:bg-[#d46a3d] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#8A8782]">Total Projects</span>
              <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{counts.total}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1D2028] border border-[#2D313D] flex items-center justify-center text-[#FAF8F5]">
              <FolderKanban className="w-5 h-5 text-[#C25E34]" />
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

          <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#C25E34]">Featured on Home</span>
              <div className="text-2xl font-bold font-mono text-[#C25E34]">{counts.featured}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#C25E34]/15 border border-[#C25E34]/30 flex items-center justify-center text-[#C25E34]">
              <Star className="w-5 h-5" />
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
              placeholder="Search by title, slug, or client..."
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
          <div className="flex items-center gap-1.5 p-1 bg-[#0D0E11] rounded-lg border border-[#252830] text-xs font-mono w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#222530] text-[#FAF8F5] font-semibold'
                  : 'text-[#8A8782] hover:text-[#FAF8F5]'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'published'
                  ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                  : 'text-[#8A8782] hover:text-emerald-400'
              }`}
            >
              Published ({counts.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'draft'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold'
                  : 'text-[#8A8782] hover:text-amber-400'
              }`}
            >
              Drafts ({counts.drafts})
            </button>
            <button
              onClick={() => setStatusFilter('featured')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'featured'
                  ? 'bg-[#C25E34]/30 text-[#C25E34] font-semibold'
                  : 'text-[#8A8782] hover:text-[#C25E34]'
              }`}
            >
              Featured ({counts.featured})
            </button>
          </div>
        </div>

        {/* Projects Table List */}
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
                onClick={loadProjects}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#252830] text-xs font-mono text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FolderKanban className="w-10 h-10 text-[#44423F] mx-auto" />
              <p className="text-sm font-semibold text-[#FAF8F5]">No projects found</p>
              <p className="text-xs text-[#8A8782] max-w-sm mx-auto">
                {searchTerm
                  ? 'No projects matched your search criteria.'
                  : 'Your portfolio collection is currently empty. Click "Add New Project" to create one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101217] border-b border-[#252830] font-mono text-[#8A8782] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Order</th>
                    <th className="py-3 px-4">Project / Case Study</th>
                    <th className="py-3 px-4 hidden md:table-cell">Category</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Deliverables</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F222B]">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project._id || project.slug}
                      className="hover:bg-[#181A22]/70 transition-colors group"
                    >
                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-[#8A8782]">
                        #{project.displayOrder ?? 0}
                      </td>

                      {/* Title & Client */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#FAF8F5] group-hover:text-[#C25E34] transition-colors">
                              {project.title}
                            </span>
                            {project.isPublished && (
                              <a
                                href={`/portfolio/${project.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#8A8782] hover:text-[#FAF8F5] transition-colors"
                                title="Open live public case study"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8A8782] line-clamp-1">
                            {project.client || project.industry || project.shortDescription}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#A09D98] hidden md:table-cell capitalize">
                        {project.category || 'websites'}
                      </td>

                      {/* Deliverables count */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded bg-[#1B1E26] border border-[#282C38] text-[10px] font-mono text-[#8A8782]">
                          {(project.deliverables?.length || 0)} deliverables
                        </span>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(project)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            project.featured
                              ? 'text-amber-400 hover:text-amber-300 bg-amber-950/30'
                              : 'text-[#44423F] hover:text-[#8A8782]'
                          }`}
                          title={project.featured ? 'Marked as Featured on Home' : 'Click to feature on Home'}
                        >
                          <Star className={`w-4 h-4 ${project.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(project)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                            project.isPublished
                              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                          }`}
                          title="Click to toggle publication status"
                        >
                          {project.isPublished ? (
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
                            onClick={() => handleOpenEditModal(project)}
                            className="p-1.5 rounded-md hover:bg-[#252830] text-[#A09D98] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="p-1.5 rounded-md hover:bg-rose-950/50 text-[#8A8782] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Project"
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
      {/* PROJECT EDITOR MODAL (Add / Edit) */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#252830] flex items-center justify-between bg-[#111318]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                  {editingProject ? `Edit Case Study: ${editingProject.title}` : 'Create New Portfolio Project'}
                </h3>
                <p className="text-xs text-[#8A8782]">
                  {editingProject ? 'Modifying project document in MongoDB Atlas.' : 'Add a client case study to the Haxudio website.'}
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
                { id: 'general', label: '1. General' },
                { id: 'content', label: '2. Content' },
                { id: 'media', label: '3. Media' },
                { id: 'technology', label: '4. Tech & Services' },
                { id: 'links', label: '5. Links & Meta' },
                { id: 'seo', label: '6. SEO' },
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
                        Project Title <span className="text-[#C25E34]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. Zarghoon Medical Complex"
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
                        placeholder="e.g. zarghoon-medical-complex"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <span className="text-[10px] text-[#8A8782] block">
                        Will be live at /portfolio/{formData.slug || 'slug'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Client Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Client Organization
                      </label>
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        placeholder="e.g. Zarghoon Health Group"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g. Healthcare & Clinics"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>
                  </div>

                  {/* Summary / Short Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Summary / Short Description (Shown on portfolio cards)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="One-to-two sentence overview of the deliverables and client context..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>

                  {/* Switches: Display Order, Featured, Published */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Featured on Home
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          formData.featured
                            ? 'bg-[#C25E34]/20 border-[#C25E34]/50 text-[#C25E34]'
                            : 'bg-[#181A20] border-[#2A2E3B] text-[#8A8782]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${formData.featured ? 'fill-[#C25E34]' : ''}`} />
                        <span>{formData.featured ? 'Featured on Home' : 'Standard'}</span>
                      </button>
                    </div>

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
                </div>
              )}

              {/* TAB 2: Content (Description, Challenge, Solution, Results) */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Full Project Description & Scope
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed narrative describing the project goals, audience, and scope..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>

                  {/* Challenge & Solution */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-rose-300">
                        The Challenge / Bottleneck
                      </label>
                      <textarea
                        rows={3}
                        value={formData.challenge}
                        onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                        placeholder="What friction points or business problems was the client facing?"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-emerald-300">
                        The Haxudio Solution
                      </label>
                      <textarea
                        rows={3}
                        value={formData.solution}
                        onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                        placeholder="How did our engineering and design team resolve it?"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Measurable Results */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Measurable Results & Outcomes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.results}
                      onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                      placeholder="e.g. 65% increase in direct mobile bookings with sub-second page loads."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Media (Cover Image, Alt Text, Gallery Images) */}
              {activeTab === 'media' && (
                <div className="space-y-5">
                  {/* Project Cover Visual Picker */}
                  <ImageFieldPicker
                    label="Project Cover Visual & Media"
                    value={formData.coverImage}
                    onChange={(val) => setFormData({ ...formData, coverImage: val })}
                    altValue={formData.coverImageAlt}
                    onAltChange={(val) => setFormData({ ...formData, coverImageAlt: val })}
                    defaultFolder="haxudio/projects"
                    showAltInput={true}
                    helperText="High-resolution visual showcase for cards, heroes, and Open Graph previews."
                  />

                  {/* Additional Gallery Images */}
                  <div className="space-y-2 pt-3 border-t border-[#252830]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Additional Gallery Image URLs
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsGalleryModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F28] hover:bg-[#252A36] border border-[#2B303E] text-[11px] font-mono text-[#FAF8F5] transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3 text-[#C25E34]" />
                        <span>Select from Media Library</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageInput}
                        onChange={(e) => setNewImageInput(e.target.value)}
                        placeholder="Paste image URL and click Add..."
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newImageInput.trim()) {
                            setFormData({
                              ...formData,
                              images: [...formData.images, newImageInput.trim()],
                            });
                            setNewImageInput('');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-[#252830] hover:bg-[#303440] text-xs font-mono text-[#FAF8F5] cursor-pointer"
                      >
                        Add Image
                      </button>
                    </div>

                    <MediaSelectorModal
                      isOpen={isGalleryModalOpen}
                      onClose={() => setIsGalleryModalOpen(false)}
                      onSelect={(media) => {
                        const imgUrl = media.secureUrl || media.url;
                        if (imgUrl && !formData.images.includes(imgUrl)) {
                          setFormData({
                            ...formData,
                            images: [...formData.images, imgUrl],
                          });
                        }
                      }}
                      defaultFolder="haxudio/projects"
                      title="Add Gallery Image to Project"
                    />

                    <div className="space-y-1.5 pt-1">
                      {(formData.images || []).map((img, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-[#0D0E11] border border-[#252830] text-xs font-mono"
                        >
                          <span className="truncate max-w-md text-[#FAF8F5]">{img}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                images: formData.images.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-[#8A8782] hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Technology & Deliverables */}
              {activeTab === 'technology' && (
                <div className="space-y-5">
                  {/* Verified Deliverables */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Deliverables List
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDeliverableInput}
                        onChange={(e) => setNewDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newDeliverableInput.trim()) {
                              setFormData({
                                ...formData,
                                deliverables: [...formData.deliverables, newDeliverableInput.trim()],
                              });
                              setNewDeliverableInput('');
                            }
                          }
                        }}
                        placeholder="e.g. Responsive Patient Portal with Doctor Schedules..."
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newDeliverableInput.trim()) {
                            setFormData({
                              ...formData,
                              deliverables: [...formData.deliverables, newDeliverableInput.trim()],
                            });
                            setNewDeliverableInput('');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-[#252830] hover:bg-[#303440] text-xs font-mono text-[#FAF8F5]"
                      >
                        Add Item
                      </button>
                    </div>

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
                              setFormData({
                                ...formData,
                                deliverables: formData.deliverables.filter((_, i) => i !== idx),
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

                  {/* Technologies Used */}
                  <div className="space-y-2 pt-3 border-t border-[#252830]">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Technologies Used
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTechInput}
                        onChange={(e) => setNewTechInput(e.target.value)}
                        placeholder="e.g. Next.js, Figma, Tailwind CSS..."
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTechInput.trim()) {
                            setFormData({
                              ...formData,
                              technologies: [...formData.technologies, newTechInput.trim()],
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
                      {(formData.technologies || []).map((tech, idx) => (
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
                                technologies: formData.technologies.filter((_, i) => i !== idx),
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

                  {/* Related Services */}
                  <div className="space-y-2 pt-3 border-t border-[#252830]">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Related Services
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        placeholder="e.g. Web Development, UI/UX Design..."
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newServiceInput.trim()) {
                            setFormData({
                              ...formData,
                              services: [...formData.services, newServiceInput.trim()],
                            });
                            setNewServiceInput('');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-[#252830] hover:bg-[#303440] text-xs font-mono text-[#FAF8F5]"
                      >
                        Add Service
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(formData.services || []).map((srv, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C25E34]/15 border border-[#C25E34]/30 text-xs text-[#C25E34]"
                        >
                          <span>{srv}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                services: formData.services.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-[#C25E34] hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Links & Metadata */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Live Project / Website URL
                      </label>
                      <input
                        type="text"
                        value={formData.liveUrl}
                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value, projectUrl: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">
                        Project Year / Completion Date
                      </label>
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value, completionDate: e.target.value })}
                        placeholder="2025"
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">
                      Client Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Quetta, Balochistan"
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: SEO */}
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
                      placeholder="e.g. Zarghoon Medical Complex Case Study | Haxudio"
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
                      placeholder="Google search snippet description for this case study..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                    />
                  </div>

                  {/* Live Search Preview Box */}
                  <div className="p-4 rounded-lg bg-[#0D0E11] border border-[#252830] space-y-1">
                    <span className="text-[10px] font-mono text-[#8A8782] uppercase">
                      Google Search Snippet Preview
                    </span>
                    <div className="text-xs text-sky-400 font-medium truncate">
                      {formData.seoTitle || `${formData.title} | Case Study | Haxudio Digital Solutions`}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 truncate">
                      https://www.haxudio.com/portfolio/{formData.slug || 'project-slug'}
                    </div>
                    <p className="text-xs text-[#8A8782] line-clamp-2">
                      {formData.seoDescription || formData.shortDescription || 'Case study developed by Haxudio Digital Solutions.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#252830] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8A8782]">
                  {editingProject ? 'Updating MongoDB Atlas record' : 'Creating new document in MongoDB Atlas'}
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
                    <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
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
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#14161C] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                Delete Project Case Study?
              </h3>
              <p className="text-xs text-[#8A8782] mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="text-[#FAF8F5] font-semibold">"{projectToDelete.title}"</span>?
                This action will remove the document from MongoDB Atlas and it will immediately disappear from the public website.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
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
