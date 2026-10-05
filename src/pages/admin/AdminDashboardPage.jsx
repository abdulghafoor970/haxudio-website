'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
  Database,
  Server,
  User,
  Activity,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Lock,
  ArrowRight,
  FolderKanban,
  MessageSquareQuote,
  Users,
  Inbox,
  Mail,
  Calendar,
  Sparkles,
  FileText,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminServices } from '../../services/serviceApi';
import { fetchAdminProjects } from '../../services/projectApi';
import { fetchAdminTestimonials } from '../../services/testimonialApi';
import { fetchAdminTeam } from '../../services/teamApi';
import { fetchAdminInquiries } from '../../services/inquiryApi';
import { fetchMediaList } from '../../services/mediaApi';

export default function AdminDashboardPage() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  const [systemHealth, setSystemHealth] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [cmsStats, setCmsStats] = useState({
    services: 0,
    projects: 0,
    testimonials: 0,
    team: 0,
    inquiries: 0,
    unreadInquiries: 0,
    media: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState([]);

  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setSystemHealth(data);
    } catch {
      setSystemHealth({
        status: 'error',
        message: 'Could not reach backend health check endpoint',
        database: { connected: false, status: 'unreachable' },
      });
    } finally {
      setIsHealthLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const [srv, prj, tst, tm, inq, med] = await Promise.allSettled([
        fetchAdminServices(),
        fetchAdminProjects(),
        fetchAdminTestimonials(),
        fetchAdminTeam(),
        fetchAdminInquiries({ sort: 'newest' }),
        fetchMediaList({ limit: 1 }),
      ]);

      const inqData = inq.status === 'fulfilled' ? inq.value : null;

      setCmsStats({
        services: srv.status === 'fulfilled' ? srv.value.total || 0 : 0,
        projects: prj.status === 'fulfilled' ? prj.value.total || 0 : 0,
        testimonials: tst.status === 'fulfilled' ? tst.value.total || 0 : 0,
        team: tm.status === 'fulfilled' ? tm.value.total || 0 : 0,
        inquiries: inqData ? inqData.total || 0 : 0,
        unreadInquiries: inqData ? inqData.unreadCount || 0 : 0,
        media: med.status === 'fulfilled' ? med.value.total || 0 : 0,
      });

      if (inqData && Array.isArray(inqData.data)) {
        setRecentInquiries(inqData.data.slice(0, 4));
      }
    } catch (err) {
      console.warn('[Dashboard Counts Error]:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchCounts();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans">
      <AdminNavbar activeTab="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181A22] via-[#14161C] to-[#121316] border border-[#252830] p-6 sm:p-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#C25E34]/15 border border-[#C25E34]/30 text-[#C25E34] text-[11px] font-mono uppercase tracking-wider mb-2">
                <Lock className="w-3 h-3" />
                <span>Phase 2: Authentication Active</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
                Welcome back, {admin?.name || 'Administrator'}
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8782] mt-1 max-w-xl">
                You are securely logged into the Haxudio Digital Solutions backend portal. Express session authorization and JWT verification are fully active.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchHealth}
                disabled={isHealthLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F222B] hover:bg-[#2A2E3B] border border-[#2E3240] text-xs font-mono text-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Express API */}
          <div className="bg-[#14161C] border border-[#252830] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A8782]">
              <span className="text-xs font-mono uppercase tracking-wider">REST API</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#FAF8F5]">
                {systemHealth?.status === 'healthy' ? 'Operational' : isHealthLoading ? 'Checking...' : 'Degraded'}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Express v4 Server</span>
              </div>
            </div>
          </div>

          {/* Card 2: MongoDB Atlas */}
          <div className="bg-[#14161C] border border-[#252830] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A8782]">
              <span className="text-xs font-mono uppercase tracking-wider">Database</span>
              <Database className="w-4 h-4 text-[#C25E34]" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#FAF8F5]">
                {systemHealth?.database?.connected ? 'Atlas Connected' : 'Checking...'}
              </div>
              <div className="text-xs text-[#8A8782] flex items-center gap-1.5 mt-1">
                <span className="font-mono text-[11px] text-[#C25E34]">
                  DB: {systemHealth?.database?.name || 'haxudio'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Session Security */}
          <div className="bg-[#14161C] border border-[#252830] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A8782]">
              <span className="text-xs font-mono uppercase tracking-wider">Session</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#FAF8F5]">
                JWT Active
              </div>
              <div className="text-xs text-[#8A8782] flex items-center gap-1.5 mt-1">
                <span className="font-mono text-[11px] text-cyan-400">
                  Role: {admin?.role || 'admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Server Uptime */}
          <div className="bg-[#14161C] border border-[#252830] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A8782]">
              <span className="text-xs font-mono uppercase tracking-wider">Server Uptime</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#FAF8F5]">
                {systemHealth?.uptime || 'Active'}
              </div>
              <div className="text-xs text-[#8A8782] flex items-center gap-1.5 mt-1">
                <span className="font-mono text-[11px]">
                  Env: {systemHealth?.environment || 'development'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Management Summary Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A8782]">
              Content Management System Modules
            </h2>
            <span className="text-[11px] font-mono text-emerald-400">
              Live in MongoDB Atlas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Services CMS */}
            <Link
              href="/admin/services"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Services</span>
                <Layers className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{cmsStats.services}</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Managed Capabilities</span>
              </div>
            </Link>

            {/* Projects CMS */}
            <Link
              href="/admin/projects"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Portfolio</span>
                <FolderKanban className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{cmsStats.projects}</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Case Studies</span>
              </div>
            </Link>

            {/* Testimonials CMS */}
            <Link
              href="/admin/testimonials"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Testimonials</span>
                <MessageSquareQuote className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{cmsStats.testimonials}</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Client Voices</span>
              </div>
            </Link>

            {/* Team CMS */}
            <Link
              href="/admin/team"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Team</span>
                <Users className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{cmsStats.team}</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Leadership Profiles</span>
              </div>
            </Link>

            {/* Inquiries / Leads CMS */}
            <Link
              href="/admin/inquiries"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Inquiries</span>
                <Inbox className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{cmsStats.inquiries}</div>
                  {cmsStats.unreadInquiries > 0 && (
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      ({cmsStats.unreadInquiries} new)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Client Leads</span>
              </div>
            </Link>

            {/* Website Content CMS (Phase 3E) */}
            <Link
              href="/admin/content"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Website Content</span>
                <FileText className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">3 Pages</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Home, About, Contact</span>
              </div>
            </Link>

            {/* Global Settings (Phase 3E) */}
            <Link
              href="/admin/settings"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Global Settings</span>
                <Settings className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">Active</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Contact, Social & SEO</span>
              </div>
            </Link>

            {/* Media Library CMS (Phase 3F) */}
            <Link
              href="/admin/media"
              className="p-5 rounded-xl bg-[#14161C] hover:bg-[#181A22] border border-[#252830] hover:border-[#C25E34]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8782] group-hover:text-[#FAF8F5]">Media Library</span>
                <ImageIcon className="w-4 h-4 text-[#C25E34]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[#FAF8F5]">{cmsStats.media}</div>
                <span className="text-[11px] text-[#8A8782] mt-0.5 block">Cloudinary Assets</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Inquiries Overview Section */}
        <div className="bg-[#14161C] border border-[#252830] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252830] pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#C25E34]" />
              <h2 className="text-sm font-semibold text-[#FAF8F5]">Recent Client Inquiries & Leads</h2>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-mono text-[#C25E34] hover:underline flex items-center gap-1"
            >
              <span>View All Inquiries</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <p className="text-xs font-mono text-[#8A8782] py-4 text-center">
              No customer inquiries recorded yet. Form submissions will appear here.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentInquiries.map((inq) => (
                <Link
                  key={inq._id}
                  href="/admin/inquiries"
                  className="p-3.5 rounded-lg bg-[#0D0E11] border border-[#252830] hover:border-[#374151] flex items-center justify-between gap-3 text-xs transition-colors group block"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {!inq.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Unread Lead" />
                      )}
                      <span className="font-semibold text-[#FAF8F5] truncate group-hover:text-[#C25E34] transition-colors">
                        {inq.name}
                      </span>
                      {inq.company && (
                        <span className="text-[10px] font-mono text-[#8A8782] truncate">({inq.company})</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[#8A8782] flex items-center gap-2">
                      <span className="truncate">{inq.service || 'General'}</span>
                      <span>•</span>
                      <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#2D313D] uppercase text-[#A09D98] bg-[#14161C]">
                      {inq.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Profile Card */}
          <div className="bg-[#14161C] border border-[#252830] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252830] pb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#C25E34]" />
                <h2 className="text-sm font-semibold text-[#FAF8F5]">Admin Identity</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                Active
              </span>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <span className="block text-[#8A8782] text-[10px] uppercase">Name</span>
                <span className="text-[#FAF8F5] font-sans font-medium text-sm">{admin?.name}</span>
              </div>
              <div>
                <span className="block text-[#8A8782] text-[10px] uppercase">Email</span>
                <span className="text-[#FAF8F5]">{admin?.email}</span>
              </div>
              <div>
                <span className="block text-[#8A8782] text-[10px] uppercase">Permission Role</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#1F222B] border border-[#2A2E3B] text-[#C25E34] capitalize">
                  {admin?.role}
                </span>
              </div>
              <div>
                <span className="block text-[#8A8782] text-[10px] uppercase">Authentication Method</span>
                <span className="text-[#A09D98]">Bcrypt Hashing (12 Salt Rounds) + JWT</span>
              </div>
            </div>
          </div>

          {/* Architecture Status */}
          <div className="lg:col-span-2 bg-[#14161C] border border-[#252830] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252830] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C25E34]" />
                <h2 className="text-sm font-semibold text-[#FAF8F5]">System Architecture & Integration</h2>
              </div>
              <span className="text-[11px] font-mono text-[#8A8782]">Haxudio Stack</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#0D0E11] border border-[#252830] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FAF8F5]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Express API Gateway</span>
                </div>
                <p className="text-[11px] text-[#8A8782] leading-relaxed">
                  Route controllers, security rate limiters, Helmet HTTP headers, and CORS configured.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0D0E11] border border-[#252830] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FAF8F5]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>MongoDB Atlas Cluster</span>
                </div>
                <p className="text-[11px] text-[#8A8782] leading-relaxed">
                  Direct connection to Atlas replica set with secure Mongoose schemas and strict validation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0D0E11] border border-[#252830] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FAF8F5]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Secure JWT Authentication</span>
                </div>
                <p className="text-[11px] text-[#8A8782] leading-relaxed">
                  Tokens verified by custom Express middleware on all protected admin endpoints.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0D0E11] border border-[#252830] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FAF8F5]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pure JavaScript Architecture</span>
                </div>
                <p className="text-[11px] text-[#8A8782] leading-relaxed">
                  Preserves pristine JavaScript without Firebase, Firestore, or unwanted external runtimes.
                </p>
              </div>
            </div>

            {/* Phase 3A Services CMS Live Card */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#181A22] to-[#12141A] border border-[#C25E34]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#FAF8F5]">Services Content Management System</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono text-[10px]">
                    Phase 3A Live
                  </span>
                </div>
                <p className="text-[#8A8782] text-xs leading-relaxed max-w-xl">
                  Dynamically create, edit, reorder, and publish Haxudio capabilities with real-time sync to MongoDB Atlas and the public website.
                </p>
              </div>
              <Link
                href="/admin/services"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#C25E34] hover:bg-[#d46a3d] text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
              >
                <span>Manage Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Phase 3B Portfolio CMS Live Card */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#181A22] to-[#12141A] border border-[#C25E34]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#FAF8F5]">Portfolio & Case Studies Management System</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono text-[10px]">
                    Phase 3B Live
                  </span>
                </div>
                <p className="text-[#8A8782] text-xs leading-relaxed max-w-xl">
                  Create, edit, feature, and publish client case studies and verified deliverables with real-time sync to MongoDB Atlas and the public portfolio.
                </p>
              </div>
              <Link
                href="/admin/projects"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1F222B] hover:bg-[#2A2E3B] border border-[#2D313D] text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
              >
                <span>Manage Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-[#252830] bg-[#101217] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#666461]">
          <span>Haxudio Digital Solutions — Administrative Environment</span>
          <span>Security Protocol: TLS 1.3 / JWT / Bcrypt</span>
        </div>
      </footer>
    </div>
  );
}
