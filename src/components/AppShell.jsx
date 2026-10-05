'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../context/AuthContext';
import { ModalProvider, useModal } from '../context/ModalContext';
import { SettingsProvider } from '../context/SettingsContext';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import QuoteBuilderModal from './QuoteBuilderModal';
import ProjectModal from './ProjectModal';
import WhatsAppWidget from './WhatsAppWidget';
import ScrollProgress from './animations/ScrollProgress';
import { motion } from 'motion/react';

function AppShellContent({ children }) {
  const pathname = usePathname();
  const isAdminRoute = typeof pathname === 'string' && pathname.startsWith('/admin');

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
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer & Global WhatsApp Widget (Hidden on Admin Routes) */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppWidget />}

      {/* Global Interactive Modals */}
      <QuoteBuilderModal
        isOpen={isQuoteModalOpen}
        onClose={closeQuoteModal}
        preselectedService={quotePreselectedService}
      />

      <ProjectModal
        project={selectedProjectForModal}
        isOpen={!!selectedProjectForModal}
        onClose={closeProjectModal}
        onStartSimilar={startSimilarProject}
      />
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
