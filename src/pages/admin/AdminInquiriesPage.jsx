'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Tag,
  Filter,
  ArrowUpDown,
  Send,
  Eye,
  EyeOff,
  Check,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import {
  fetchAdminInquiries,
  fetchAdminInquiryById,
  updateInquiryStatus,
  updateInquiryRead,
  updateInquiryNotes,
  deleteInquiry,
} from '../../services/inquiryApi';

const STATUS_CONFIG = {
  new: { label: 'New Lead', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  contacted: { label: 'Contacted', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  'in-progress': { label: 'In Progress', bg: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  qualified: { label: 'Qualified', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  converted: { label: 'Converted', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' },
  closed: { label: 'Closed', bg: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30' },
  spam: { label: 'Spam', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

export default function AdminInquiriesPage() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  // Inquiries List State
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unreadCount: 0,
    countsByStatus: {
      new: 0,
      contacted: 0,
      'in-progress': 0,
      qualified: 0,
      converted: 0,
      closed: 0,
      spam: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [limit] = useState(20);

  // Selected Detail Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Inquiries from API
  const loadInquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminInquiries({
        status: statusFilter,
        isRead: readFilter === 'all' ? undefined : readFilter === 'read',
        search: searchTerm,
        sort: sortOrder,
        page: currentPage,
        limit,
      });

      setInquiries(res.data || []);
      setCurrentPage(res.currentPage || 1);
      setTotalPages(res.totalPages || 1);
      setTotalFiltered(res.filteredCount !== undefined ? res.filteredCount : (res.total || 0));
      setStats({
        total: res.total || 0,
        unreadCount: res.unreadCount || 0,
        countsByStatus: res.countsByStatus || {},
      });
    } catch (err) {
      setError(err.message || 'Failed to load inquiries from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, readFilter, sortOrder]);

  useEffect(() => {
    loadInquiries();
  }, [statusFilter, readFilter, sortOrder, currentPage]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Detail Modal
  const handleOpenDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setNotesInput(inquiry.adminNotes || '');
    setIsDetailOpen(true);

    // Auto mark as read if currently unread
    if (!inquiry.isRead) {
      handleToggleRead(inquiry, true);
    }
  };

  // Toggle Read Status
  const handleToggleRead = async (inquiry, explicitState = null) => {
    const targetState = explicitState !== null ? explicitState : !inquiry.isRead;
    try {
      await updateInquiryRead(inquiry._id, targetState);
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === inquiry._id ? { ...item, isRead: targetState } : item
        )
      );
      if (selectedInquiry && selectedInquiry._id === inquiry._id) {
        setSelectedInquiry((prev) => ({ ...prev, isRead: targetState }));
      }
      setStats((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount + (targetState ? -1 : 1)),
      }));
    } catch (err) {
      showNotification(err.message || 'Failed to update read state', 'error');
    }
  };

  // Update Status
  const handleStatusChange = async (inquiryId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === inquiryId ? { ...item, status: newStatus } : item
        )
      );
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      showNotification(`Status updated to "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
    } catch (err) {
      showNotification(err.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    try {
      await updateInquiryNotes(selectedInquiry._id, notesInput);
      setSelectedInquiry((prev) => ({ ...prev, adminNotes: notesInput }));
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === selectedInquiry._id ? { ...item, adminNotes: notesInput } : item
        )
      );
      showNotification('Private admin notes updated in MongoDB Atlas');
    } catch (err) {
      showNotification(err.message || 'Failed to save notes', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Inquiry
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteInquiry(itemToDelete._id);
      setInquiries((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      if (selectedInquiry && selectedInquiry._id === itemToDelete._id) {
        setIsDetailOpen(false);
        setSelectedInquiry(null);
      }
      showNotification('Inquiry permanently removed');
      setItemToDelete(null);
      loadInquiries();
    } catch (err) {
      showNotification(err.message || 'Failed to delete inquiry', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format phone for direct WhatsApp link
  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 9) return null;
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
      <AdminNavbar activeTab="inquiries" />

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
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Title & Quick Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A8782] mb-1">
              <span>LEADS MANAGEMENT CONSOLE</span>
              <span>•</span>
              <span className="text-emerald-400">REST API / MONGODB ATLAS</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
              Client Inquiries & Quotes
            </h1>
            <p className="text-sm text-[#8A8782] mt-0.5">
              Review, track, and respond to prospective clients contacting Haxudio Digital Solutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadInquiries}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#14161C] border border-[#252830] hover:bg-[#1E212B] text-xs font-mono text-[#A09D98] hover:text-[#FAF8F5] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#14161C] border border-[#252830]">
            <div className="flex items-center justify-between text-[#8A8782] mb-2">
              <span className="text-xs font-mono">TOTAL LEADS</span>
              <Inbox className="w-4 h-4 text-[#8A8782]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{stats.total}</div>
            <div className="text-[11px] text-[#666461] mt-1 font-mono">All incoming inquiries</div>
          </div>

          <div className="p-5 rounded-xl bg-[#14161C] border border-[#252830]">
            <div className="flex items-center justify-between text-[#8A8782] mb-2">
              <span className="text-xs font-mono">NEW / UNREAD</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {stats.unreadCount}
            </div>
            <div className="text-[11px] text-emerald-400/70 mt-1 font-mono">Awaiting initial review</div>
          </div>

          <div className="p-5 rounded-xl bg-[#14161C] border border-[#252830]">
            <div className="flex items-center justify-between text-[#8A8782] mb-2">
              <span className="text-xs font-mono">IN PROGRESS</span>
              <Tag className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-violet-300">
              {(stats.countsByStatus?.['in-progress'] || 0) + (stats.countsByStatus?.qualified || 0)}
            </div>
            <div className="text-[11px] text-[#666461] mt-1 font-mono">Active consultations</div>
          </div>

          <div className="p-5 rounded-xl bg-[#14161C] border border-[#252830]">
            <div className="flex items-center justify-between text-[#8A8782] mb-2">
              <span className="text-xs font-mono">CONVERTED</span>
              <Sparkles className="w-4 h-4 text-[#C25E34]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#C25E34]">
              {stats.countsByStatus?.converted || 0}
            </div>
            <div className="text-[11px] text-[#666461] mt-1 font-mono">Signed project clients</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-xl bg-[#14161C] border border-[#252830] space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8A8782] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadInquiries();
                }}
                placeholder="Search leads by client name, email, phone, company, or message keywords..."
                className="w-full pl-10 pr-4 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] placeholder-[#666461] focus:outline-none focus:border-[#C25E34]"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8782] hover:text-[#FAF8F5]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Read/Unread Filter */}
            <div className="flex items-center gap-1 bg-[#0D0E11] p-1 rounded-lg border border-[#252830]">
              <button
                onClick={() => setReadFilter('all')}
                className={`px-2.5 py-1 text-xs font-mono rounded ${
                  readFilter === 'all'
                    ? 'bg-[#1E212B] text-[#FAF8F5] font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1 ${
                  readFilter === 'unread'
                    ? 'bg-[#1E212B] text-emerald-400 font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5]'
                }`}
              >
                <span>Unread</span>
                {stats.unreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
              <button
                onClick={() => setReadFilter('read')}
                className={`px-2.5 py-1 text-xs font-mono rounded ${
                  readFilter === 'read'
                    ? 'bg-[#1E212B] text-[#FAF8F5] font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5]'
                }`}
              >
                Read
              </button>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#A09D98] hover:text-[#FAF8F5] transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="text-[#666461] mr-1 hidden sm:inline">Status:</span>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'new', label: 'New' },
              { id: 'contacted', label: 'Contacted' },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'qualified', label: 'Qualified' },
              { id: 'converted', label: 'Converted' },
              { id: 'closed', label: 'Closed' },
              { id: 'spam', label: 'Spam' },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              const count =
                tab.id === 'all'
                  ? stats.total
                  : stats.countsByStatus?.[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md border text-xs whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#1E212B] border-[#C25E34] text-[#FAF8F5] font-semibold'
                      : 'border-[#252830] text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#14161C]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1.5 opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inquiries Content Table / Cards */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3 bg-[#14161C] border border-[#252830] rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#C25E34] mx-auto" />
            <p className="text-xs font-mono text-[#8A8782]">Connecting to MongoDB Atlas...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-[#14161C] border border-rose-900/40 rounded-xl space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300 font-mono">{error}</p>
            <button
              onClick={loadInquiries}
              className="px-4 py-1.5 text-xs font-mono bg-[#1E212B] text-[#FAF8F5] rounded border border-[#2D313D] hover:bg-[#252830]"
            >
              Retry
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center bg-[#14161C] border border-[#252830] rounded-xl space-y-4">
            <Inbox className="w-10 h-10 text-[#44423F] mx-auto" />
            <div>
              <h3 className="text-base font-semibold text-[#FAF8F5]">No inquiries found</h3>
              <p className="text-xs text-[#8A8782] font-mono mt-1">
                {searchTerm || statusFilter !== 'all' || readFilter !== 'all'
                  ? 'Try clearing your active filters or search query.'
                  : 'Inquiries submitted through public contact forms will appear here automatically.'}
              </p>
            </div>
            {(searchTerm || statusFilter !== 'all' || readFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setReadFilter('all');
                }}
                className="px-3.5 py-1.5 text-xs font-mono rounded bg-[#1E212B] text-[#FAF8F5] border border-[#2D313D] hover:bg-[#252830]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {inquiries.map((inq) => {
              const statusCfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new;
              const formattedDate = new Date(inq.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = new Date(inq.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={inq._id}
                  className={`p-5 rounded-xl border transition-all ${
                    !inq.isRead
                      ? 'bg-[#151922] border-[#374151]'
                      : 'bg-[#14161C] border-[#252830]'
                  } hover:border-[#3E4455]`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Lead Identity & Unread Pill */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!inq.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Unread Lead" />
                        )}
                        <h3 className="font-semibold text-sm text-[#FAF8F5] truncate">
                          {inq.name}
                        </h3>
                        {inq.company && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#A09D98] font-mono">
                            <Building className="w-3 h-3 text-[#666461]" />
                            <span>{inq.company}</span>
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusCfg.bg}`}
                        >
                          {statusCfg.label}
                        </span>
                        {inq.source && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F222B] text-[#8A8782] border border-[#2D313D]">
                            {inq.source}
                          </span>
                        )}
                      </div>

                      {/* Contact Channels */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8A8782]">
                        <a
                          href={`mailto:${inq.email}`}
                          className="inline-flex items-center gap-1 hover:text-[#FAF8F5] transition-colors truncate"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#666461]" />
                          <span>{inq.email}</span>
                        </a>

                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1 hover:text-[#FAF8F5] transition-colors"
                            title="Call Phone"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#666461]" />
                            <span>{inq.phone}</span>
                          </a>
                        )}

                        <span className="inline-flex items-center gap-1 text-[#666461]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </span>
                      </div>

                      {/* Message Preview */}
                      <p className="text-xs text-[#C5C2BD] line-clamp-2 mt-2 leading-relaxed">
                        {inq.message}
                      </p>

                      {/* Service & Budget tags */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {inq.service && (
                          <span className="text-[11px] font-mono text-[#A09D98] bg-[#0D0E11] px-2 py-0.5 rounded border border-[#252830]">
                            Service: <span className="text-[#FAF8F5]">{inq.service}</span>
                          </span>
                        )}
                        {inq.budget && (
                          <span className="text-[11px] font-mono text-[#A09D98] bg-[#0D0E11] px-2 py-0.5 rounded border border-[#252830]">
                            Budget: <span className="text-[#FAF8F5]">{inq.budget}</span>
                          </span>
                        )}
                        {inq.adminNotes && (
                          <span className="text-[11px] font-mono text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Has Internal Note</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0">
                      {/* Mark Read/Unread Toggle */}
                      <button
                        onClick={() => handleToggleRead(inq)}
                        title={inq.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        className="p-2 rounded-lg bg-[#0D0E11] border border-[#252830] text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212B] transition-colors"
                      >
                        {inq.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>

                      {/* Status Dropdown */}
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-mono bg-[#0D0E11] border border-[#252830] rounded-lg text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in-progress">In Progress</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                        <option value="spam">Spam</option>
                      </select>

                      {/* View Details */}
                      <button
                        onClick={() => handleOpenDetail(inq)}
                        className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#1E212B] hover:bg-[#252830] text-[#FAF8F5] border border-[#2D313D] transition-colors"
                      >
                        View Lead
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setItemToDelete(inq)}
                        title="Delete Inquiry"
                        className="p-2 rounded-lg bg-[#0D0E11] border border-[#252830] text-[#8A8782] hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#252830]">
              <p className="text-xs font-mono text-[#8A8782]">
                Showing <span className="text-[#FAF8F5]">{(currentPage - 1) * limit + 1}</span> to{' '}
                <span className="text-[#FAF8F5]">{Math.min(currentPage * limit, totalFiltered)}</span> of{' '}
                <span className="text-[#FAF8F5]">{totalFiltered}</span> inquiries
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-3 py-1.5 rounded-lg bg-[#181A22] border border-[#252830] text-xs font-mono text-[#FAF8F5] hover:border-[#C25E34] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-xs font-mono text-[#A09D98] px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="px-3 py-1.5 rounded-lg bg-[#181A22] border border-[#252830] text-xs font-mono text-[#FAF8F5] hover:border-[#C25E34] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </main>

      {/* DETAIL MODAL DRAWER */}
      {isDetailOpen && selectedInquiry && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#14161C] border border-[#252830] rounded-2xl shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#252830] flex items-center justify-between bg-[#111317]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C25E34] font-semibold">
                    Client Lead Record
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F222B] text-[#8A8782] border border-[#2D313D]">
                    ID: {selectedInquiry._id}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-[#FAF8F5]">
                  {selectedInquiry.name}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 text-[#8A8782] hover:text-[#FAF8F5] rounded-lg hover:bg-[#1E212B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Quick Status Bar */}
              <div className="p-4 rounded-xl bg-[#0D0E11] border border-[#252830] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#8A8782]">Status:</span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 text-xs font-mono bg-[#14161C] border border-[#2D313D] rounded-lg text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedInquiry)}
                    className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[#2D313D] bg-[#14161C] hover:bg-[#1E212B] text-[#FAF8F5] flex items-center gap-1.5"
                  >
                    {selectedInquiry.isRead ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-[#8A8782]" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666461] block mb-1">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-xs font-mono text-[#FAF8F5] hover:text-[#C25E34] transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C25E34]" />
                    <span className="truncate">{selectedInquiry.email}</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666461] block mb-1">
                    Phone / WhatsApp
                  </span>
                  {selectedInquiry.phone ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="text-xs font-mono text-[#FAF8F5] hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{selectedInquiry.phone}</span>
                      </a>
                      {getWhatsAppLink(selectedInquiry.phone) && (
                        <a
                          href={getWhatsAppLink(selectedInquiry.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-emerald-400 hover:underline"
                        >
                          Chat WhatsApp
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-[#666461]">Not provided</span>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666461] block mb-1">
                    Company / Organization
                  </span>
                  <span className="text-xs font-mono text-[#FAF8F5]">
                    {selectedInquiry.company || 'Individual / Not specified'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666461] block mb-1">
                    Service Required
                  </span>
                  <span className="text-xs font-mono text-[#FAF8F5]">
                    {selectedInquiry.service || 'General Inquiry'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666461] block mb-1">
                    Budget Tier
                  </span>
                  <span className="text-xs font-mono text-[#FAF8F5]">
                    {selectedInquiry.budget || 'Flexible / Retainer'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666461] block mb-1">
                    Submission Timestamp
                  </span>
                  <span className="text-xs font-mono text-[#FAF8F5]">
                    {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Full Client Message */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#8A8782] block">
                  Project Goals & Specifications
                </label>
                <div className="p-4 rounded-xl bg-[#0D0E11] border border-[#252830] text-sm text-[#FAF8F5] leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Private Admin Notes Section */}
              <div className="space-y-2 pt-2 border-t border-[#252830]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Private Admin Notes (Internal Only)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#666461]">
                    Never returned by public APIs
                  </span>
                </div>
                <textarea
                  rows="4"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record call logs, project scope notes, client budget negotiations, follow-up dates..."
                  className="w-full p-3.5 bg-[#0D0E11] border border-[#252830] rounded-xl text-xs font-mono text-[#FAF8F5] placeholder-[#666461] focus:outline-none focus:border-amber-400/60"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-[#666461]">
                    Characters: {notesInput.length}/5000
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-4 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#252830] bg-[#111317] flex items-center justify-between">
              <button
                onClick={() => {
                  setItemToDelete(selectedInquiry);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-1.5 text-xs font-mono rounded-lg bg-[#1E212B] hover:bg-[#252830] text-[#FAF8F5] border border-[#2D313D]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-[#14161C] border border-[#252830] rounded-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#FAF8F5]">Permanently Delete Lead?</h3>
            </div>
            <p className="text-xs text-[#A09D98] font-mono leading-relaxed">
              Are you sure you want to delete the inquiry from{' '}
              <strong className="text-[#FAF8F5]">{itemToDelete.name}</strong> ({itemToDelete.email})?
              This action permanently deletes the document from MongoDB Atlas.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono rounded-lg bg-[#1E212B] text-[#FAF8F5] border border-[#2D313D] hover:bg-[#252830]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
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
