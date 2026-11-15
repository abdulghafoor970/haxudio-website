'use client';

import React, { lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../context/AuthContext';
import { ModalProvider, useModal } from '../context/ModalContext';
import { SettingsProvider } from '../context/SettingsContext';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import WhatsAppWidget from './WhatsAppWidget';
import ScrollProgress from './animations/ScrollProgress';
import { motion, useReducedMotion } from 'motion/react';

// Lazy-load interactive modals so they are not part of initial mobile paint
const QuoteBuilderModal = lazy(() => import('./QuoteBuilderModal'));
const ProjectModal = lazy(() => import('./ProjectModal'));

function AppShellContent({ children }) {
  const pathname = usePathname();
  const isAdminRoute = typeof pathname === 'string' && pathname.startsWith('/admin');
  const shouldReduceMotion = useReducedMotion();

  const {
    isQuoteModalOpen,
    quotePreselectedService,
    openQuoteModal,
    closeQuoteModal,
    selectedProjectForModal,
    closeProjectModal,
    startSimilarProject,
  } = useModal();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isAdminRoute ? 'bg-[#0D0E11] text-[#FAF8F5]' : 'bg-[#FAF8F5] text-[#121316]'
      }`}
    >
      <ScrollToTop />
      {!isAdminRoute && <ScrollProgress />}

      {/* Primary Top Bar Navigation (Hidden on Admin Routes) */}
      {!isAdminRoute && <Navbar onOpenQuote={() => openQuoteModal('web-development')} />}

      {/* Main Routed Content */}
      <main className="flex-grow">
        <motion.div
          key={pathname}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer & Global WhatsApp Widget (Hidden on Admin Routes) */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppWidget />}

      {/* Global Interactive Modals - Loaded on demand */}
      {isQuoteModalOpen && (
        <Suspense fallback={null}>
          <QuoteBuilderModal
            isOpen={isQuoteModalOpen}
            onClose={closeQuoteModal}
            preselectedService={quotePreselectedService}
          />
        </Suspense>
      )}

      {selectedProjectForModal && (
        <Suspense fallback={null}>
          <ProjectModal
            project={selectedProjectForModal}
            isOpen={!!selectedProjectForModal}
            onClose={closeProjectModal}
            onStartSimilar={startSimilarProject}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <ModalProvider>
        <SettingsProvider>
          <AppShellContent>{children}</AppShellContent>
        </SettingsProvider>
      </ModalProvider>
    </AuthProvider>
  );
}
