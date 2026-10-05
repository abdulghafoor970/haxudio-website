'use client';

import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quotePreselectedService, setQuotePreselectedService] = useState('web-development');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);

  const openQuoteModal = (serviceId) => {
    if (typeof serviceId === 'string') {
      setQuotePreselectedService(serviceId);
    } else {
      setQuotePreselectedService('web-development');
    }
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
  };

  const openProjectModal = (project) => {
    setSelectedProjectForModal(project);
  };

  const closeProjectModal = () => {
    setSelectedProjectForModal(null);
  };

  const startSimilarProject = (project) => {
    if (project && project.services && project.services.length > 0) {
      const matchSlug = project.services[0].toLowerCase().replace(/\s+/g, '-');
      setQuotePreselectedService(matchSlug);
    }
    setIsQuoteModalOpen(true);
  };

  return (
    <ModalContext.Provider
      value={{
        isQuoteModalOpen,
        quotePreselectedService,
        openQuoteModal,
        closeQuoteModal,
        selectedProjectForModal,
        openProjectModal,
        closeProjectModal,
        startSimilarProject,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      isQuoteModalOpen: false,
      quotePreselectedService: 'web-development',
      openQuoteModal: () => {},
      closeQuoteModal: () => {},
      selectedProjectForModal: null,
      openProjectModal: () => {},
      closeProjectModal: () => {},
      startSimilarProject: () => {},
    };
  }
  return context;
}
