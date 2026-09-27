import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import { RouteProgress } from './components/ui/primitives';

// Home ships in the main bundle; every other route loads on demand.
// Public pages are also preloaded once the browser is idle, so moving
// around the site rarely has to wait for a download.
const pages = {
  ScribblingPage: () => import('./pages/ScribblingPage'),
  ScribblingDetailPage: () => import('./pages/ScribblingDetailPage'),
  CoursesPage: () => import('./pages/CoursesPage'),
  CourseDetailPage: () => import('./pages/CourseDetailPage'),
  CurationsPage: () => import('./pages/CurationsPage'),
  PublicationsPage: () => import('./pages/PublicationsPage'),
  ResearchPage: () => import('./pages/ResearchPage'),
  SpeechesPage: () => import('./pages/SpeechesPage'),
  NotesPage: () => import('./pages/NotesPage'),
  NoteDetailPage: () => import('./pages/NoteDetailPage'),
  PostsPage: () => import('./pages/PostsPage'),
  PostDetailPage: () => import('./pages/PostDetailPage'),
  ProjectsPage: () => import('./pages/ProjectsPage'),
  CaseStudyPage: () => import('./pages/CaseStudyPage'),
  GalleryPage: () => import('./pages/GalleryPage'),
  HobbiesPage: () => import('./pages/HobbiesPage'),
  DemoPage: () => import('./pages/DemoPage'),
  NotFoundPage: () => import('./pages/NotFoundPage'),
};
const ScribblingPage = lazy(pages.ScribblingPage);
const ScribblingDetailPage = lazy(pages.ScribblingDetailPage);
const CoursesPage = lazy(pages.CoursesPage);
const CourseDetailPage = lazy(pages.CourseDetailPage);
const CurationsPage = lazy(pages.CurationsPage);
const PublicationsPage = lazy(pages.PublicationsPage);
const ResearchPage = lazy(pages.ResearchPage);
const SpeechesPage = lazy(pages.SpeechesPage);
const NotesPage = lazy(pages.NotesPage);
const NoteDetailPage = lazy(pages.NoteDetailPage);
const PostsPage = lazy(pages.PostsPage);
const PostDetailPage = lazy(pages.PostDetailPage);
const ProjectsPage = lazy(pages.ProjectsPage);
const CaseStudyPage = lazy(pages.CaseStudyPage);
const GalleryPage = lazy(pages.GalleryPage);
const HobbiesPage = lazy(pages.HobbiesPage);
const DemoPage = lazy(pages.DemoPage);
const NotFoundPage = lazy(pages.NotFoundPage);

// Tool pages carry heavy dependencies (chess engine, Firebase, editors) and
// are left to load only when visited.
const Admin = lazy(() => import('./pages/Admin'));
const ChessPage = lazy(() => import('./pages/ChessPage'));
const ChessBotPage = lazy(() => import('./pages/ChessBotPage'));
const ChessJournalPage = lazy(() => import('./pages/ChessJournalPage'));
const ChessJournalEntryDetailPage = lazy(() => import('./pages/ChessJournalEntryDetailPage'));
const VaspPage = lazy(() => import('./pages/VaspPage'));

function usePreloadPages() {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const id = idle(() => Object.values(pages).forEach((load) => load().catch(() => {})));
    return () => cancel(id);
  }, []);
}

function App() {
  usePreloadPages();

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<RouteProgress />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/scribbling" element={<ScribblingPage />} />
          <Route path="/scribbling/:slug" element={<ScribblingDetailPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/curations/:tag" element={<CurationsPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/speeches" element={<SpeechesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:slug" element={<NoteDetailPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/case/:slug" element={<CaseStudyPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/hobbies" element={<HobbiesPage />} />
          <Route path="/hobbies/chess" element={<ChessPage />} />
          <Route path="/hobbies/chess/bot" element={<ChessBotPage />} />
          <Route path="/hobbies/chess/journal" element={<ChessJournalPage />} />
          <Route path="/hobbies/chess/journal/:slug" element={<ChessJournalEntryDetailPage />} />
          <Route path="/vasp" element={<VaspPage />} />
          <Route path="/demo/:name" element={<DemoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
