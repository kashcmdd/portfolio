import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { SelectedWorksSection } from './components/SelectedWorksSection';
import { ProjectModal } from './components/ProjectModal';
import { TechStackSection } from './components/TechStackSection';
import { JournalSection } from './components/JournalSection';
import { JournalModal } from './components/JournalModal';
import { NowBuildingStrip } from './components/NowBuildingStrip';
import { ExplorationsSection } from './components/ExplorationsSection';
import { StatsSection } from './components/StatsSection';
import { ContactFooter } from './components/ContactFooter';
import { ContactModal } from './components/ContactModal';
import { SearchModal } from './components/SearchModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Analytics } from './components/Analytics';
import { AnalyticsConsent } from './components/AnalyticsConsent';
import { Project, JournalEntry } from './types';
import { journalEntriesData } from './data/portfolioData';
import NotFoundView from './components/NotFoundView';

const entryIdFromHash = (): string | null => {
  const match = window.location.hash.match(/^#journal\/([a-z0-9-]+)$/);
  return match ? match[1] : null;
};

const entryForId = (id: string | null): JournalEntry | null =>
  (id && journalEntriesData.find((entry) => entry.id === id)) || null;

// Static hosts serve 404.html for unknown paths, but plenty of hosts are
// configured to fall back to index.html instead, which would boot this app at
// the homepage and quietly pretend the bad URL was fine. The generated routes
// are whitelisted so those still resolve normally, and only a genuinely
// unknown path renders the not-found view.
const STATIC_ROUTE_PREFIXES = ['journal/', 'projects/', 'resume/'];

const isUnknownRoute = (): boolean => {
  const base = import.meta.env.BASE_URL;
  const { pathname } = window.location;
  if (pathname === base || pathname === base.slice(0, -1) || pathname === '/') return false;
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  if (!relative) return false;
  if (relative === 'index.html') return false;
  return !STATIC_ROUTE_PREFIXES.some((prefix) => relative.startsWith(prefix));
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [unknownRoute] = useState(isUnknownRoute);

  // True only while a journal hash was pushed by this app, so that closing the
  // modal can go back instead of leaving a stale entry in the history stack.
  const pushedJournalHash = useRef(false);

  // Deep link on first load: #journal/<id> opens the post once the app is up.
  useEffect(() => {
    if (isLoading) return;
    const entry = entryForId(entryIdFromHash());
    if (entry && !selectedJournal) {
      setSelectedJournal(entry);
      requestAnimationFrame(() => {
        document.getElementById('journal')?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [isLoading]);

  // Back, forward and manual URL edits all arrive as hashchange.
  useEffect(() => {
    const onHashChange = () => {
      pushedJournalHash.current = false;
      setSelectedJournal(entryForId(entryIdFromHash()));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openJournal = (entry: JournalEntry) => {
    setSelectedJournal(entry);
    history.pushState(null, '', `#journal/${entry.id}`);
    pushedJournalHash.current = true;
  };

  const closeJournal = () => {
    if (pushedJournalHash.current) {
      pushedJournalHash.current = false;
      history.back(); // hashchange clears the entry
      return;
    }
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setSelectedJournal(null);
  };

  // Active section tracking on scroll
  useEffect(() => {
    if (isLoading) return;

    const sectionIds = ['hero', 'about', 'skills', 'work', 'stack', 'journal', 'explorations', 'contact'];

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

  // Keyboard shortcuts for search: Cmd/Ctrl+K, and "/" the way a code editor
  // or a docs site does it. "/" is only a shortcut while the visitor is not
  // typing, otherwise it would swallow the character in every input on the page.
  // "?" (Shift+/) opens the shortcut cheatsheet, so the shortcuts are findable
  // without one. It is guarded the same way, since "?" is also ordinary text.
  useEffect(() => {
    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable === true
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchModalOpen(true);
        return;
      }
      if (event.key === '/' && !isTyping(event.target) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setSearchModalOpen(true);
        return;
      }
      if (event.key === '?' && !isTyping(event.target)) {
        event.preventDefault();
        setShortcutsModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // The static 404.html sets its own title; this keeps the two in agreement.
  useEffect(() => {
    if (!unknownRoute) return;
    document.title = '404 — Page not found';
  }, [unknownRoute]);

  return (
    <div className="bg-[#0a0a0a] text-white font-body selection:bg-[#89AACC]/30 selection:text-white relative min-h-screen">
      {/* Analytics */}
      <Analytics />

      {/* Analytics Consent Banner */}
      <AnalyticsConsent />

      {/* 1. Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && !unknownRoute && (
        <>
          {/* First tab stop on the page. A keyboard user would otherwise have to
              Tab through the whole navigation to reach the content, which on a
              page this long is most of a minute of key presses. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-[#89AACC] focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-black"
          >
            Skip to content
          </a>

          {/* 2. Floating Navbar */}
          <Navbar
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenSearchModal={() => setSearchModalOpen(true)}
            onOpenShortcuts={() => setShortcutsModalOpen(true)}
          />

          {/* 3. Main Sections */}
          <main id="main" tabIndex={-1}>
            {/* Hero Section */}
            <HeroSection
              onNavigateToWork={() => handleNavigate('work')}
              onOpenContactModal={() => setContactModalOpen(true)}
            />

            <NowBuildingStrip />

            {/* About Developer Section */}
            <AboutSection />

            {/* Skills Section */}
            <SkillsSection />

            {/* Selected Works (Bento Grid) */}
            <SelectedWorksSection
              onSelectProject={(project) => setSelectedProject(project)}
            />

            {/* Tech Stack & Skills */}
            <TechStackSection />

            {/* Journal & Thoughts */}
            <JournalSection
              onSelectJournal={openJournal}
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
          />

          <JournalModal
          entry={selectedJournal}
          onClose={closeJournal}
          onSelectEntry={openJournal}
          />

          <ContactModal
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />

          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onShowShortcuts={() => setShortcutsModalOpen(true)}
          />

          <ShortcutsModal
            isOpen={shortcutsModalOpen}
            onClose={() => setShortcutsModalOpen(false)}
          />
        </>
      )}

      {!isLoading && unknownRoute && <NotFoundView />}
    </div>
  );
}
