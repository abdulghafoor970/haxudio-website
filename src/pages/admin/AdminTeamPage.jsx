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
  ArrowLeft,
  X,
  Loader2,
  Users,
  Check,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import ImageFieldPicker from '../../components/admin/ImageFieldPicker';
import {
  fetchAdminTeam,
  createAdminTeamMember,
  updateAdminTeamMember,
  deleteAdminTeamMember,
  togglePublishAdminTeamMember,
} from '../../services/teamApi';

export default function AdminTeamPage() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  // Team State
  const [team, setTeam] = useState([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, drafts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // null = Add, object = Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorError, setEditorError] = useState(null);

  // Delete Confirmation State
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    discipline: '',
    bio: '',
    photo: '',
    photoAlt: '',
    badge: '',
    highlight: '',
    location: 'Quetta, Balochistan',
    email: '',
    linkedin: '',
    x: '',
    instagram: '',
    facebook: '',
    github: '',
    portfolioUrl: '',
    isPublished: true,
    displayOrder: 0,
  });

  // Load Team from API
  const loadTeam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminTeam();
      setTeam(res.data || []);
      setCounts({
        total: res.total || 0,
        published: res.published || 0,
        drafts: res.drafts || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load team from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
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
    setEditingMember(null);
    setFormData({
      name: '',
      position: 'Associate Technical Lead',
      discipline: 'Frontend Engineering & Systems',
      bio: 'Engineers responsive interfaces, accessibility compliance, and fast web experiences for commercial enterprises.',
      photo: '/src/assets/images/cofounder_tech_lead_1790429560393.jpg',
      photoAlt: '',
      badge: 'Core Leadership',
      highlight: 'React · Tailwind CSS · Systems',
      location: 'Quetta, Balochistan',
      email: 'team@haxudio.com',
      linkedin: 'https://www.linkedin.com/company/haxudio',
      x: 'https://x.com/haxudio',
      instagram: 'https://www.instagram.com/haxudio',
      facebook: 'https://www.facebook.com/haxudio',
      github: 'https://github.com/haxudio',
      portfolioUrl: '',
      isPublished: true,
      displayOrder: team.length,
    });
    setEditorError(null);
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    const soc = member.socials || {};
    setFormData({
      name: member.name || '',
      position: member.position || member.role || '',
      discipline: member.discipline || '',
      bio: member.bio || '',
      photo: member.photo || member.image || '',
      photoAlt: member.photoAlt || '',
      badge: member.badge || '',
      highlight: member.highlight || '',
      location: member.location || 'Quetta, Balochistan',
      email: member.email || '',
      linkedin: member.linkedin || soc.linkedin || '',
      x: member.x || soc.x || '',
      instagram: member.instagram || soc.instagram || '',
      facebook: member.facebook || soc.facebook || '',
      github: member.github || soc.github || '',
      portfolioUrl: member.portfolioUrl || soc.portfolioUrl || '',
      isPublished: typeof member.isPublished === 'boolean' ? member.isPublished : true,
      displayOrder: typeof member.displayOrder === 'number' ? member.displayOrder : 0,
    });
    setEditorError(null);
    setIsEditorOpen(true);
  };

  // Toggle Published
  const handleTogglePublish = async (member) => {
    try {
      const updated = await togglePublishAdminTeamMember(member._id);
      setTeam((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, isPublished: updated.isPublished } : m))
      );
      setCounts((prev) => ({
        ...prev,
        published: updated.isPublished ? prev.published + 1 : prev.published - 1,
        drafts: updated.isPublished ? prev.drafts - 1 : prev.drafts + 1,
      }));
      showNotification(
        `"${member.name}" is now ${updated.isPublished ? 'Published on website' : 'Saved as Draft'}`,
        'success'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to toggle status', 'error');
    }
  };

  // Handle Save (Create or Update)
  const handleSubmitEditor = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setEditorError('Team member name is required');
      return;
    }
    if (!formData.position.trim()) {
      setEditorError('Position/role is required');
      return;
    }

    setIsSubmitting(true);
    setEditorError(null);

    try {
      if (editingMember) {
        // Update
        const updated = await updateAdminTeamMember(editingMember._id, formData);
        setTeam((prev) => prev.map((m) => (m._id === editingMember._id ? updated : m)));
        showNotification(`Team member "${updated.name}" updated successfully!`);
      } else {
        // Create
        const created = await createAdminTeamMember(formData);
        setTeam((prev) => [...prev, created]);
        setCounts((prev) => ({
          ...prev,
          total: prev.total + 1,
          published: created.isPublished ? prev.published + 1 : prev.published,
          drafts: !created.isPublished ? prev.drafts + 1 : prev.drafts,
        }));
        showNotification(`Team member "${created.name}" created successfully!`);
      }
      setIsEditorOpen(false);
    } catch (err) {
      setEditorError(err.message || 'Error saving team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);

    try {
      await deleteAdminTeamMember(memberToDelete._id);
      setTeam((prev) => prev.filter((m) => m._id !== memberToDelete._id));
      setCounts((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        published: memberToDelete.isPublished ? Math.max(0, prev.published - 1) : prev.published,
        drafts: !memberToDelete.isPublished ? Math.max(0, prev.drafts - 1) : prev.drafts,
      }));
      showNotification(`Team member "${memberToDelete.name}" deleted.`);
      setMemberToDelete(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete team member', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Team List
  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.position && m.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.discipline && m.discipline.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.bio && m.bio.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'published') return m.isPublished;
      if (statusFilter === 'draft') return !m.isPublished;
      return true;
    });
  }, [team, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
      <AdminNavbar activeTab="team" />

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
              <span className="text-[#C25E34]">Team Members CMS (Phase 3C)</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
              Leadership & Team Members
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8782] mt-1">
              Manage leadership profiles, positions, bios, photos, and social profiles synced in real-time with MongoDB Atlas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadTeam}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181A22] hover:bg-[#222530] border border-[#252830] text-xs font-mono text-[#A09D98] hover:text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh team members from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C25E34] hover:bg-[#d46a3d] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#8A8782]">Total Members</span>
              <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{counts.total}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1D2028] border border-[#2D313D] flex items-center justify-center text-[#FAF8F5]">
              <Users className="w-5 h-5 text-[#C25E34]" />
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
              placeholder="Search by name, role, or discipline..."
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
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#222530] text-[#FAF8F5] font-semibold'
                  : 'text-[#8A8782] hover:text-[#FAF8F5]'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'published'
                  ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                  : 'text-[#8A8782] hover:text-emerald-400'
              }`}
            >
              Published ({counts.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'draft'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold'
                  : 'text-[#8A8782] hover:text-amber-400'
              }`}
            >
              Drafts ({counts.drafts})
            </button>
          </div>
        </div>

        {/* Team Table List */}
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
                onClick={loadTeam}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#252830] text-xs font-mono text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : filteredTeam.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="w-10 h-10 text-[#44423F] mx-auto" />
              <p className="text-sm font-semibold text-[#FAF8F5]">No team members found</p>
              <p className="text-xs text-[#8A8782] max-w-sm mx-auto">
                {searchTerm
                  ? 'No members matched your search query.'
                  : 'No team members saved. Click "Add Team Member" to create one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101217] border-b border-[#252830] font-mono text-[#8A8782] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Order</th>
                    <th className="py-3 px-4">Member / Role</th>
                    <th className="py-3 px-4 hidden md:table-cell">Discipline & Bio</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Location</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F222B]">
                  {filteredTeam.map((member) => (
                    <tr
                      key={member._id}
                      className="hover:bg-[#181A22]/70 transition-colors group"
                    >
                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-[#8A8782]">
                        #{member.displayOrder ?? 0}
                      </td>

                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-900 border border-[#2D313D] shrink-0">
                            <img
                              src={member.photo || member.image || '/src/assets/images/cofounder_tech_lead_1790429560393.jpg'}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-sm text-[#FAF8F5] group-hover:text-[#C25E34] transition-colors">
                              {member.name}
                            </span>
                            <div className="text-[11px] text-[#8A8782] line-clamp-1">
                              {member.position || member.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Discipline & Bio */}
                      <td className="py-3.5 px-4 hidden md:table-cell max-w-sm">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] text-amber-400">
                            {member.discipline || 'Leadership'}
                          </span>
                          <p className="text-xs text-[#8A8782] line-clamp-1">
                            {member.bio}
                          </p>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-[11px] text-[#A09D98] font-mono">
                        {member.location || 'Quetta, Balochistan'}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(member)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                            member.isPublished
                              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                          }`}
                          title="Click to toggle publication status"
                        >
                          {member.isPublished ? (
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
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 rounded-md hover:bg-[#252830] text-[#A09D98] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                            title="Edit Team Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="p-1.5 rounded-md hover:bg-rose-950/50 text-[#8A8782] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Team Member"
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
      {/* TEAM MEMBER EDITOR MODAL (Add / Edit) */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#252830] flex items-center justify-between bg-[#111318]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                  {editingMember ? `Edit Team Member: ${editingMember.name}` : 'Add Leadership / Team Member'}
                </h3>
                <p className="text-xs text-[#8A8782]">
                  {editingMember ? 'Modifying team member profile in MongoDB Atlas.' : 'Create team profile for the public website.'}
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

            {/* Modal Body */}
            <form onSubmit={handleSubmitEditor} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Full Name <span className="text-[#C25E34]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Abdul Ghafoor"
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                {/* Role / Position */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Role / Position <span className="text-[#C25E34]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Co-Founder & Technical Lead"
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Discipline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Discipline / Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    placeholder="e.g. Full-Stack Architecture & Systems"
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Location
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

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#FAF8F5]">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summary of experience, technical focus, and regional commitment..."
                  className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34] leading-relaxed"
                />
              </div>

              {/* Photo & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageFieldPicker
                  label="Team Member Portrait"
                  value={formData.photo}
                  onChange={(val) => setFormData({ ...formData, photo: val })}
                  defaultFolder="haxudio/team"
                  showAltInput={false}
                  placeholder="/src/assets/... or https://..."
                  helperText="Select or upload executive headshot from Cloudinary."
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Tech & Architecture"
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Social Profiles */}
              <div className="pt-2 border-t border-[#252830] space-y-3">
                <span className="text-xs font-mono uppercase text-[#8A8782] block">
                  Social Network Profiles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                  <input
                    type="text"
                    placeholder="X / Twitter URL"
                    value={formData.x}
                    onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                    className="px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                  <input
                    type="text"
                    placeholder="Facebook URL"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                  <input
                    type="text"
                    placeholder="Portfolio URL"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Controls: Order & Published */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#252830]">
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

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#252830] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8A8782]">
                  {editingMember ? 'Updating MongoDB Atlas document' : 'Creating new document in MongoDB Atlas'}
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
                    <span>{editingMember ? 'Save Changes' : 'Create Member'}</span>
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
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#14161C] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                Delete Team Member?
              </h3>
              <p className="text-xs text-[#8A8782] mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="text-[#FAF8F5] font-semibold">"{memberToDelete.name}"</span>?
                This action will remove the document from MongoDB Atlas.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMemberToDelete(null)}
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
