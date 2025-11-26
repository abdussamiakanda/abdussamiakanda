import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ScribblingPage from './pages/ScribblingPage';
import ScribblingDetailPage from './pages/ScribblingDetailPage';
import CoursesPage from './pages/CoursesPage';
import PublicationsPage from './pages/PublicationsPage';
import SpeechesPage from './pages/SpeechesPage';
import NotesPage from './pages/NotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import GalleryPage from './pages/GalleryPage';
import HobbiesPage from './pages/HobbiesPage';
import ChessPage from './pages/ChessPage';
import ChessBotPage from './pages/ChessBotPage';
import ChessJournalPage from './pages/ChessJournalPage';
import ChessJournalEntryDetailPage from './pages/ChessJournalEntryDetailPage';
import VaspPage from './pages/VaspPage';
import DemoPage from './pages/DemoPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/scribbling" element={<ScribblingPage />} />
        <Route path="/scribbling/:slug" element={<ScribblingDetailPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/speeches" element={<SpeechesPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:slug" element={<NoteDetailPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
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
    </Router>
  );
}

export default App;
