import { useState } from 'react';
import ProfileEditor from './ProfileEditor';
import ResearchEditor from './ResearchEditor';
import TeachingEditor from './TeachingEditor';
import EducationEditor from './EducationEditor';
import SkillsEditor from './SkillsEditor';
import ActivitiesEditor from './ActivitiesEditor';
import AwardsEditor from './AwardsEditor';
import PersonalProjectsEditor from './PersonalProjectsEditor';
import ProgrammingEditor from './ProgrammingEditor';
import WebDevelopmentEditor from './WebDevelopmentEditor';
import ScribblingEditor from './ScribblingEditor';
import CurationsEditor from './CurationsEditor';
import GalleryEditor from './GalleryEditor';
import PostsEditor from './PostsEditor';
import HobbiesEditor from './HobbiesEditor';
import CoursesEditor from './CoursesEditor';
import PublicationsEditor from './PublicationsEditor';
import SpeechesEditor from './SpeechesEditor';
import NotesEditor from './NotesEditor';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'research', label: 'Research' },
    { id: 'publications', label: 'Publications' },
    { id: 'speeches', label: 'Speeches' },
    { id: 'notes', label: 'Notes' },
    { id: 'teaching', label: 'Teaching' },
    { id: 'courses', label: 'Courses' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'activities', label: 'Activities' },
    { id: 'awards', label: 'Awards' },
    { id: 'personal-projects', label: 'Personal Projects' },
    { id: 'programming', label: 'Programming' },
    { id: 'web-development', label: 'Web Development' },
    { id: 'scribbling', label: 'Scribbling' },
    { id: 'curations', label: 'Curations' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'posts', label: 'Posts' },
    { id: 'hobbies', label: 'Hobbies' },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <span className="user-email">{user.displayName || user.email}</span>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
          <a href="/" className="btn btn-link">View Site</a>
        </div>
      </header>
      
      <div className="admin-content">
        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-editor">
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'research' && <ResearchEditor />}
          {activeTab === 'publications' && <PublicationsEditor />}
          {activeTab === 'speeches' && <SpeechesEditor />}
          {activeTab === 'notes' && <NotesEditor />}
          {activeTab === 'teaching' && <TeachingEditor />}
          {activeTab === 'courses' && <CoursesEditor />}
          {activeTab === 'education' && <EducationEditor />}
          {activeTab === 'skills' && <SkillsEditor />}
          {activeTab === 'activities' && <ActivitiesEditor />}
          {activeTab === 'awards' && <AwardsEditor />}
          {activeTab === 'personal-projects' && <PersonalProjectsEditor />}
          {activeTab === 'programming' && <ProgrammingEditor />}
          {activeTab === 'web-development' && <WebDevelopmentEditor />}
          {activeTab === 'scribbling' && <ScribblingEditor />}
          {activeTab === 'curations' && <CurationsEditor />}
          {activeTab === 'gallery' && <GalleryEditor />}
          {activeTab === 'posts' && <PostsEditor />}
          {activeTab === 'hobbies' && <HobbiesEditor />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

