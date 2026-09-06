import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { SelectedWorksSection } from './components/SelectedWorksSection';
import { ProjectModal } from './components/ProjectModal';
import { TechStackSection } from './components/TechStackSection';
import { JournalSection } from './components/JournalSection';
import { JournalModal } from './components/JournalModal';
import { ExplorationsSection } from './components/ExplorationsSection';
import { StatsSection } from './components/StatsSection';
import { ContactFooter } from './components/ContactFooter';
import { ContactModal } from './components/ContactModal';
import { Project, JournalEntry } from './types';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Active section tracking on scroll
  useEffect(() => {
    if (isLoading) return;

    const sectionIds = ['hero', 'about', 'capabilities', 'work', 'journal', 'stack', 'explorations', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white font-body selection:bg-[#89AACC]/30 selection:text-white relative min-h-screen">
      {/* 1. Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* 2. Floating Navbar */}
          <Navbar
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onOpenContactModal={() => setContactModalOpen(true)}
          />

          {/* 3. Main Sections */}
          <main>
            {/* Hero Section */}
            <HeroSection
              onNavigateToWork={() => handleNavigate('work')}
              onOpenContactModal={() => setContactModalOpen(true)}
            />

            {/* About Developer Section */}
            <AboutSection />

            {/* Capabilities Section */}
            <CapabilitiesSection
              onSelectCapability={() => setContactModalOpen(true)}
            />

            {/* Selected Works (Bento Grid) */}
            <SelectedWorksSection
              onSelectProject={(project) => setSelectedProject(project)}
            />

            {/* Tech Stack & Skills */}
            <TechStackSection />

            {/* Journal & Thoughts */}
            <JournalSection
              onSelectJournal={(entry) => setSelectedJournal(entry)}
            />

            {/* Explorations Gallery */}
            <ExplorationsSection />

            {/* Key Metrics / Stats */}
            <StatsSection />
          </main>

          {/* 4. Footer & Contact */}
          <ContactFooter
            onOpenContactModal={() => setContactModalOpen(true)}
            onNavigateTop={() => handleNavigate('hero')}
          />

          {/* Modals */}
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onOpenContactModal={() => setContactModalOpen(true)}
          />

          <JournalModal
            entry={selectedJournal}
            onClose={() => setSelectedJournal(null)}
          />

          <ContactModal
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
