import React, { lazy, Suspense } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import AppShell from './components/AppShell';
import SEOHead from './components/SEOHead';

// Eagerly loaded for optimal homepage LCP and instant initial paint
import HomePage from './pages/HomePage';

// Lazy-loaded public pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LocalQuettaPage = lazy(() => import('./pages/LocalQuettaPage'));
const ProcessPage = lazy(() => import('./pages/ProcessPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

// Lazy-loaded admin pages (isolated from initial public bundle)
import ProtectedRoute from './components/admin/ProtectedRoute';
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'));
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="w-8 h-8 rounded-full border-2 border-[#121316]/10 border-t-[#C25E34] animate-spin" />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}

function LazyRoute({ component: Component, ...props }) {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

function AdminRoute({ component: Component }) {
  return (
    <ProtectedRoute>
      <SEOHead
        title="Admin Portal | Haxudio Digital Solutions"
        noindex={true}
        robotsContent="noindex, nofollow"
      />
      <Suspense fallback={<PageLoadingFallback />}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about">{() => <LazyRoute component={AboutPage} />}</Route>
        <Route path="/services">{() => <LazyRoute component={ServicesPage} />}</Route>
        <Route path="/services/:slug">{(params) => <LazyRoute component={ServiceDetailPage} slug={params.slug} />}</Route>
        <Route path="/portfolio">{() => <LazyRoute component={PortfolioPage} />}</Route>
        <Route path="/portfolio/:slug">{(params) => <LazyRoute component={ProjectDetailPage} slug={params.slug} />}</Route>
        <Route path="/projects"><Redirect to="/portfolio" /></Route>
        <Route path="/projects/:slug">{(params) => <Redirect to={`/portfolio/${params.slug}`} />}</Route>
        <Route path="/contact">{() => <LazyRoute component={ContactPage} />}</Route>
        <Route path="/locations/quetta">{() => <LazyRoute component={LocalQuettaPage} />}</Route>
        <Route path="/quetta">{() => <LazyRoute component={LocalQuettaPage} />}</Route>
        <Route path="/process">{() => <LazyRoute component={ProcessPage} />}</Route>
        <Route path="/blog">{() => <LazyRoute component={BlogPage} />}</Route>
        <Route path="/blog/:slug">{(params) => <LazyRoute component={BlogPostPage} slug={params.slug} />}</Route>

        {/* Admin Portal Routes */}
        <Route path="/admin/login">{() => <LazyRoute component={AdminLoginPage} />}</Route>
        <Route path="/admin">{() => <AdminRoute component={AdminDashboardPage} />}</Route>
        <Route path="/admin/dashboard">{() => <AdminRoute component={AdminDashboardPage} />}</Route>
        <Route path="/admin/services">{() => <AdminRoute component={AdminServicesPage} />}</Route>
        <Route path="/admin/projects">{() => <AdminRoute component={AdminProjectsPage} />}</Route>
        <Route path="/admin/testimonials">{() => <AdminRoute component={AdminTestimonialsPage} />}</Route>
        <Route path="/admin/team">{() => <AdminRoute component={AdminTeamPage} />}</Route>
        <Route path="/admin/inquiries">{() => <AdminRoute component={AdminInquiriesPage} />}</Route>
        <Route path="/admin/content">{() => <AdminRoute component={AdminContentPage} />}</Route>
        <Route path="/admin/settings">{() => <AdminRoute component={AdminSettingsPage} />}</Route>
        <Route path="/admin/media">{() => <AdminRoute component={AdminMediaPage} />}</Route>

        {/* 404 Fallback */}
        <Route>
          <SEOHead
            title="Page Not Found | Haxudio Digital Solutions"
            description="The page you are looking for does not exist or has been moved."
            noindex={true}
            robotsContent="noindex, follow"
          />
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C25E34] font-semibold mb-2">
              Error 404
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#121316] mb-3">404 - Page Not Found</h1>
            <p className="text-base text-[#666461] mb-6 max-w-md">The page you are looking for does not exist or has been moved.</p>
            <a href="/" className="btn-interactive-primary px-6 py-3 rounded-md text-xs font-semibold">
              Return Home
            </a>
          </div>
        </Route>
      </Switch>
    </AppShell>
  );
}
