'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SEOHead from '../../components/SEOHead';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your administrator email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      // Redirect on successful authentication
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0D0E11] text-[#FAF8F5] px-4 py-12 relative overflow-hidden">
      <SEOHead
        title="Admin Portal Login | Haxudio Digital Solutions"
        noindex={true}
        robotsContent="noindex, nofollow"
      />
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C25E34]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#2E4057]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Return to public site link */}
      <div className="absolute top-8 left-8 z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[#A09D98] hover:text-[#FAF8F5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Haxudio
        </a>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#181A20] border border-[#2A2D35] text-[#C25E34] mb-4 shadow-xl shadow-black/40">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#C25E34] mb-1">
            Internal Operations
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#FAF8F5]">
            Haxudio Admin Portal
          </h1>
          <p className="text-xs text-[#8A8782] mt-1">
            Authorized administrator access and session management
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#14161C] border border-[#252830] rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/60">
          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-wider text-[#A09D98] mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666461]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@haxudio.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D0E11] border border-[#2A2D35] rounded-lg text-sm text-[#FAF8F5] placeholder-[#55534F] focus:outline-none focus:border-[#C25E34] focus:ring-1 focus:ring-[#C25E34] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono uppercase tracking-wider text-[#A09D98] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666461]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#0D0E11] border border-[#2A2D35] rounded-lg text-sm text-[#FAF8F5] placeholder-[#55534F] focus:outline-none focus:border-[#C25E34] focus:ring-1 focus:ring-[#C25E34] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#666461] hover:text-[#FAF8F5] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 mt-2 bg-[#C25E34] hover:bg-[#A94F2B] active:scale-[0.99] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#C25E34]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate & Access Dashboard</span>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-5 border-t border-[#202229] flex items-center justify-between text-[11px] text-[#666461]">
            <span className="font-mono">Protected by JWT & TLS</span>
            <span className="flex items-center gap-1.5 text-emerald-500/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Atlas Online
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#666461] mt-6">
          © {new Date().getFullYear()} Haxudio Digital Solutions. Restricted administrative area.
        </p>
      </div>
    </div>
  );
}
