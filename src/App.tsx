import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { SelectedWorksSection } from './components/SelectedWorksSection';
import { TechStackSection } from './components/TechStackSection';
import { JournalSection } from './components/JournalSection';
import { NowBuildingStrip } from './components/NowBuildingStrip';
import { ExplorationsSection } from './components/ExplorationsSection';
import { StatsSection } from './components/StatsSection';
import { ContactFooter } from './components/ContactFooter';
import { Analytics } from './components/Analytics';
import { AnalyticsConsent } from './components/AnalyticsConsent';
import { Project, JournalEntry } from './types';
import { journalEntriesData } from './data/portfolioData';
import NotFoundView from './components/NotFoundView';

// Every dialog only ever opens on an interaction, so none of them belongs in
// the first paint. They are split out and pulled in on idle (see the prefetch
// effect), which keeps the initial bundle to the sections a visitor can see.
const ProjectModal = lazy(() =>
  import('./components/ProjectModal').then((m) => ({ default: m.ProjectModal }))
);
const JournalModal = lazy(() =>
  import('./components/JournalModal').then((m) => ({ default: m.JournalModal }))
);
const ContactModal = lazy(() =>
  import('./components/ContactModal').then((m) => ({ default: m.ContactModal }))
);
const SearchModal = lazy(() =>
  import('./components/SearchModal').then((m) => ({ default: m.SearchModal }))
);
const ShortcutsModal = lazy(() =>
  import('./components/ShortcutsModal').then((m) => ({ default: m.ShortcutsModal }))
);

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

  // Stable so the loading screen's counter effect cannot be restarted by a
  // re-render passing a fresh callback identity mid-count.
  const finishLoading = useCallback(() => setIsLoading(false), []);

  // The overlay covers the page, so the page behind it must not scroll while
  // the intro is up.
  useEffect(() => {
    if (!isLoading) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLoading]);

  // Warm the lazy dialogs once the page is interactive, so the first open is
  // instant without any of that code weighing down the first paint.
  useEffect(() => {
    if (isLoading || unknownRoute) return;
    const warm = () => {
      void import('./components/SearchModal');
      void import('./components/JournalModal');
      void import('./components/ProjectModal');
      void import('./components/ContactModal');
      void import('./components/ShortcutsModal');
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(warm, { timeout: 3000 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timeout = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(timeout);
  }, [isLoading, unknownRoute]);

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

  // Active section tracking on scroll. The offsets are measured once (and on
  // resize) rather than read back from the DOM on every event, and the handler
  // is coalesced into a frame so a fast scroll cannot queue a layout read per
  // pixel. Both were the difference between a smooth and a janky scroll on a
  // page this long.
  useEffect(() => {
    if (isLoading) return;

    const sectionIds = ['hero', 'about', 'skills', 'work', 'stack', 'journal', 'explorations', 'contact'];

    let bounds: { id: string; top: number; bottom: number }[] = [];
    const measure = () => {
      bounds = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el))
        .map((el) => ({ id: el.id, top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight }));
    };
    measure();

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY + 200;
        for (const section of bounds) {
          if (y >= section.top && y < section.bottom) {
            setActiveSection(section.id);
            break;
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
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

      {/* 1. Loading Screen. The page renders underneath it, so fonts, the hero
          video and the first images are already in flight while the intro
          plays, instead of starting only once it finishes. */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onComplete={finishLoading} />}
      </AnimatePresence>

      {!unknownRoute && (
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

          {/* Modals. Each is lazy and only mounted while it has something to
              show, so a closed dialog costs nothing after its chunk is warmed. */}
          {selectedProject && (
            <Suspense fallback={null}>
              <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
              />
            </Suspense>
          )}

          {selectedJournal && (
            <Suspense fallback={null}>
              <JournalModal
                entry={selectedJournal}
                onClose={closeJournal}
                onSelectEntry={openJournal}
              />
            </Suspense>
          )}

          {contactModalOpen && (
            <Suspense fallback={null}>
              <ContactModal
                isOpen
                onClose={() => setContactModalOpen(false)}
              />
            </Suspense>
          )}

          {searchModalOpen && (
            <Suspense fallback={null}>
              <SearchModal
                isOpen
                onClose={() => setSearchModalOpen(false)}
                onShowShortcuts={() => setShortcutsModalOpen(true)}
              />
            </Suspense>
          )}

          {shortcutsModalOpen && (
            <Suspense fallback={null}>
              <ShortcutsModal
                isOpen
                onClose={() => setShortcutsModalOpen(false)}
              />
            </Suspense>
          )}
        </>
      )}

      {unknownRoute && <NotFoundView />}
    </div>
  );
}
