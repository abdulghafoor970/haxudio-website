import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import HaxudioLogo from '../HaxudioLogo';

export default function AdminNavbar({ activeTab = 'dashboard' }) {
  const { admin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', href: '/admin/dashboard' },
    { id: 'services', label: 'Services CMS', href: '/admin/services' },
    { id: 'projects', label: 'Portfolio CMS', href: '/admin/projects' },
    { id: 'testimonials', label: 'Testimonials', href: '/admin/testimonials' },
    { id: 'team', label: 'Team CMS', href: '/admin/team' },
    { id: 'inquiries', label: 'Inquiries', href: '/admin/inquiries' },
    { id: 'content', label: 'Content', href: '/admin/content' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' },
    { id: 'media', label: 'Media Library', href: '/admin/media' },
  ];

  return (
    <header className="border-b border-[#252830] bg-[#14161C]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <HaxudioLogo className="w-7 h-7 shrink-0 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-display font-extrabold tracking-tight text-lg text-[#FAF8F5]">
              HAX<span className="text-[#C25E34]">UDIO</span>
            </span>
          </Link>
          <span className="text-[#44423F]">/</span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F222B] border border-[#2D313D] text-[11px] font-mono text-[#A09D98]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C25E34]" />
            <span>Admin Console</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#FAF8F5] bg-[#1E212B] border border-[#2D313D] font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1A1D24]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#A09D98] hover:text-[#FAF8F5] transition-colors font-mono"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="h-4 w-px bg-[#252830] hidden sm:block" />

          {/* Current user badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1E212A] border border-[#2A2E3B] flex items-center justify-center text-[#C25E34] font-bold text-xs">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold leading-tight text-[#FAF8F5]">
                {admin?.name || 'Administrator'}
              </div>
              <div className="text-[10px] font-mono text-[#8A8782] capitalize">
                {admin?.role || 'admin'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181A20] hover:bg-[#252830] text-[#A09D98] hover:text-red-300 border border-[#2A2E3B] text-xs font-mono transition-all cursor-pointer"
            title="End session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-4 py-2 border-t border-[#20232B] overflow-x-auto flex items-center gap-1.5 bg-[#101217]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md whitespace-nowrap ${
                isActive
                  ? 'text-[#FAF8F5] bg-[#1E212B] border border-[#2D313D] font-semibold'
                  : 'text-[#8A8782] hover:text-[#FAF8F5]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
