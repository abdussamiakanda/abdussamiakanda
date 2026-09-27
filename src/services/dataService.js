import profileJson from '../data/profile.json';
import educationJson from '../data/education.json';
import researchJson from '../data/research.json';
import researchMetadataJson from '../data/researchMetadata.json';
import publicationsJson from '../data/publications.json';
import speechesJson from '../data/speeches.json';
import notesJson from '../data/notes.json';
import teachingJson from '../data/teaching.json';
import teachingMetadataJson from '../data/teachingMetadata.json';
import coursesJson from '../data/courses.json';
import skillsJson from '../data/skills.json';
import activitiesJson from '../data/activities.json';
import awardsJson from '../data/awards.json';
import personalProjectsJson from '../data/personalProjects.json';
import programmingJson from '../data/programming.json';
import webDevJson from '../data/webDev.json';
import scribblingJson from '../data/scribbling.json';
import curationsJson from '../data/curations.json';
import galleryJson from '../data/gallery.json';
import postsJson from '../data/posts.json';
import hobbiesJson from '../data/hobbies.json';
import chessJournalJson from '../data/chessJournal.json';

// LocalStorage key constants
const KEYS = {
  PROFILE: 'website_profile',
  EDUCATION: 'website_education',
  RESEARCH: 'website_research',
  RESEARCH_METADATA: 'website_research_metadata',
  PUBLICATIONS: 'website_publications',
  SPEECHES: 'website_speeches',
  NOTES: 'website_notes',
  TEACHING: 'website_teaching',
  TEACHING_METADATA: 'website_teaching_metadata',
  COURSES: 'website_courses',
  SKILLS: 'website_skills',
  ACTIVITIES: 'website_activities',
  AWARDS: 'website_awards',
  PERSONAL_PROJECTS: 'website_personal_projects',
  PROGRAMMING: 'website_programming',
  WEB_DEV: 'website_web_dev',
  SCRIBBLING: 'website_scribbling',
  CURATIONS: 'website_curations',
  GALLERY: 'website_gallery',
  POSTS: 'website_posts',
  HOBBIES: 'website_hobbies',
  CHESS_JOURNAL: 'website_chess_journal'
};

// Date / Timestamp Helpers
const dateStringToTimestamp = (dateString) => {
  if (!dateString || dateString === '') {
    return null;
  }
  try {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  } catch (error) {
    console.error('Error converting date to timestamp:', error);
    return null;
  }
};

const timestampToDateString = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp instanceof Date 
      ? timestamp 
      : new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Generic LocalStorage Helpers
const getLocalObject = (key, fallback) => {
  const val = localStorage.getItem(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}:`, e);
    }
  }
  return fallback;
};

const setLocalObject = (key, obj) => {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.error(`Error setting localStorage key ${key}:`, e);
  }
};

const getLocalArray = (key, fallback) => {
  const val = localStorage.getItem(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}:`, e);
    }
  }
  return fallback;
};

const setLocalArray = (key, arr) => {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.error(`Error setting localStorage key ${key}:`, e);
  }
};

const addToArray = (key, fallback, item, dateField = null) => {
  const arr = [...getLocalArray(key, fallback)];
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const dataToSave = { ...item, id, createdAt: Math.floor(Date.now() / 1000) };
  
  if (dateField && dataToSave[dateField]) {
    dataToSave[dateField] = dateStringToTimestamp(dataToSave[dateField]) || dataToSave[dateField];
  }
  
  // Remove undefined / empty values
  Object.keys(dataToSave).forEach(k => {
    if (dataToSave[k] === undefined) delete dataToSave[k];
    if (dataToSave[k] === '') dataToSave[k] = null;
  });

  arr.push(dataToSave);
  setLocalArray(key, arr);
  return id;
};

const updateInArray = (key, fallback, id, updatedData, dateField = null) => {
  const dataToUpdate = { ...updatedData };
  if (dateField && dataToUpdate[dateField]) {
    dataToUpdate[dateField] = dateStringToTimestamp(dataToUpdate[dateField]) || dataToUpdate[dateField];
  }

  Object.keys(dataToUpdate).forEach(k => {
    if (dataToUpdate[k] === undefined) delete dataToUpdate[k];
    if (dataToUpdate[k] === '') dataToUpdate[k] = null;
  });

  const arr = getLocalArray(key, fallback).map(item => {
    if (item.id === id) {
      return { ...item, ...dataToUpdate };
    }
    return item;
  });
  setLocalArray(key, arr);
};

const deleteFromArray = (key, fallback, id) => {
  const arr = getLocalArray(key, fallback).filter(item => item.id !== id);
  setLocalArray(key, arr);
};

const updateOrderInArray = (key, fallback, id, order) => {
  const arr = getLocalArray(key, fallback).map(item => {
    if (item.id === id) {
      return { ...item, order };
    }
    return item;
  });
  setLocalArray(key, arr);
};

// PROFILE
export const getProfile = async () => {
  return getLocalObject(KEYS.PROFILE, profileJson);
};

export const updateProfile = async (data) => {
  setLocalObject(KEYS.PROFILE, data);
};

// RESEARCH EXPERIENCE
export const getResearch = async () => {
  const items = getLocalArray(KEYS.RESEARCH, researchJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    const aCreated = a.createdAt || 0;
    const bCreated = b.createdAt || 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    
    return (b.startDate || 0) - (a.startDate || 0);
  });
  return sorted;
};

export const addResearch = async (data) => {
  return addToArray(KEYS.RESEARCH, researchJson, data);
};

export const updateResearch = async (id, data) => {
  updateInArray(KEYS.RESEARCH, researchJson, id, data);
};

export const deleteResearch = async (id) => {
  deleteFromArray(KEYS.RESEARCH, researchJson, id);
};

export const updateResearchOrder = async (id, order) => {
  updateOrderInArray(KEYS.RESEARCH, researchJson, id, order);
};

// RESEARCH METADATA
export const getResearchMetadata = async () => {
  return getLocalObject(KEYS.RESEARCH_METADATA, researchMetadataJson);
};

export const updateResearchMetadata = async (data) => {
  const dataToSave = {
    profileLinks: Array.isArray(data.profileLinks) ? data.profileLinks.filter(link => link.label && link.url) : []
  };
  setLocalObject(KEYS.RESEARCH_METADATA, dataToSave);
};

// PUBLICATIONS
export const getPublications = async () => {
  const items = getLocalArray(KEYS.PUBLICATIONS, publicationsJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addPublication = async (data) => {
  return addToArray(KEYS.PUBLICATIONS, publicationsJson, data);
};

export const updatePublication = async (id, data) => {
  updateInArray(KEYS.PUBLICATIONS, publicationsJson, id, data);
};

export const deletePublication = async (id) => {
  deleteFromArray(KEYS.PUBLICATIONS, publicationsJson, id);
};

export const updatePublicationOrder = async (id, order) => {
  updateOrderInArray(KEYS.PUBLICATIONS, publicationsJson, id, order);
};

// SPEECHES
export const getSpeeches = async () => {
  const items = getLocalArray(KEYS.SPEECHES, speechesJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addSpeech = async (data) => {
  return addToArray(KEYS.SPEECHES, speechesJson, data, 'date');
};

export const updateSpeech = async (id, data) => {
  updateInArray(KEYS.SPEECHES, speechesJson, id, data, 'date');
};

export const deleteSpeech = async (id) => {
  deleteFromArray(KEYS.SPEECHES, speechesJson, id);
};

export const updateSpeechOrder = async (id, order) => {
  updateOrderInArray(KEYS.SPEECHES, speechesJson, id, order);
};

// NOTES
export const getNotes = async () => {
  const items = getLocalArray(KEYS.NOTES, notesJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aDate = a.date || 0;
    const bDate = b.date || 0;
    if (aDate !== bDate) return bDate - aDate;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addNote = async (data) => {
  return addToArray(KEYS.NOTES, notesJson, data, 'date');
};

export const updateNote = async (id, data) => {
  updateInArray(KEYS.NOTES, notesJson, id, data, 'date');
};

export const deleteNote = async (id) => {
  deleteFromArray(KEYS.NOTES, notesJson, id);
};

export const updateNoteOrder = async (id, order) => {
  updateOrderInArray(KEYS.NOTES, notesJson, id, order);
};

export const getNoteBySlug = async (slug) => {
  const items = await getNotes();
  return items.find(n => generateSlug(n.title) === slug) || null;
};

export const getNote = async (id) => {
  const items = await getNotes();
  return items.find(n => n.id === id) || null;
};

// TEACHING EXPERIENCE
export const getTeaching = async () => {
  const items = getLocalArray(KEYS.TEACHING, teachingJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    const aCreated = a.createdAt || 0;
    const bCreated = b.createdAt || 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    
    return (b.startDate || 0) - (a.startDate || 0);
  });
  return sorted;
};

export const addTeaching = async (data) => {
  return addToArray(KEYS.TEACHING, teachingJson, data);
};

export const updateTeaching = async (id, data) => {
  updateInArray(KEYS.TEACHING, teachingJson, id, data);
};

export const deleteTeaching = async (id) => {
  deleteFromArray(KEYS.TEACHING, teachingJson, id);
};

export const updateTeachingOrder = async (id, order) => {
  updateOrderInArray(KEYS.TEACHING, teachingJson, id, order);
};

// TEACHING METADATA
export const getTeachingMetadata = async () => {
  return getLocalObject(KEYS.TEACHING_METADATA, teachingMetadataJson);
};

export const updateTeachingMetadata = async (data) => {
  const dataToSave = {
    description: data.description || '',
    generalSubjects: Array.isArray(data.generalSubjects) ? data.generalSubjects.filter(s => s.trim() !== '') : []
  };
  setLocalObject(KEYS.TEACHING_METADATA, dataToSave);
};

// COURSES
export const getCourses = async () => {
  const items = getLocalArray(KEYS.COURSES, coursesJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addCourse = async (data) => {
  return addToArray(KEYS.COURSES, coursesJson, data);
};

export const updateCourse = async (id, data) => {
  updateInArray(KEYS.COURSES, coursesJson, id, data);
};

export const deleteCourse = async (id) => {
  deleteFromArray(KEYS.COURSES, coursesJson, id);
};

export const updateCourseOrder = async (id, order) => {
  updateOrderInArray(KEYS.COURSES, coursesJson, id, order);
};

// EDUCATION
export const getEducation = async () => {
  const items = getLocalArray(KEYS.EDUCATION, educationJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    const aCreated = a.createdAt || 0;
    const bCreated = b.createdAt || 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    
    return (b.startDate || 0) - (a.startDate || 0);
  });
  return sorted;
};

export const addEducation = async (data) => {
  return addToArray(KEYS.EDUCATION, educationJson, data);
};

export const updateEducation = async (id, data) => {
  updateInArray(KEYS.EDUCATION, educationJson, id, data);
};

export const deleteEducation = async (id) => {
  deleteFromArray(KEYS.EDUCATION, educationJson, id);
};

export const updateEducationOrder = async (id, order) => {
  updateOrderInArray(KEYS.EDUCATION, educationJson, id, order);
};

// SKILLS
export const getSkills = async () => {
  const items = getLocalArray(KEYS.SKILLS, skillsJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addSkill = async (data) => {
  return addToArray(KEYS.SKILLS, skillsJson, data);
};

export const updateSkill = async (id, data) => {
  updateInArray(KEYS.SKILLS, skillsJson, id, data);
};

export const deleteSkill = async (id) => {
  deleteFromArray(KEYS.SKILLS, skillsJson, id);
};

export const updateSkillOrder = async (id, order) => {
  updateOrderInArray(KEYS.SKILLS, skillsJson, id, order);
};

// CO-CURRICULAR ACTIVITIES
export const getActivities = async () => {
  const items = getLocalArray(KEYS.ACTIVITIES, activitiesJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    const aCreated = a.createdAt || 0;
    const bCreated = b.createdAt || 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    
    return (b.startDate || 0) - (a.startDate || 0);
  });
  return sorted;
};

export const addActivity = async (data) => {
  return addToArray(KEYS.ACTIVITIES, activitiesJson, data);
};

export const updateActivity = async (id, data) => {
  updateInArray(KEYS.ACTIVITIES, activitiesJson, id, data);
};

export const deleteActivity = async (id) => {
  deleteFromArray(KEYS.ACTIVITIES, activitiesJson, id);
};

export const updateActivityOrder = async (id, order) => {
  updateOrderInArray(KEYS.ACTIVITIES, activitiesJson, id, order);
};

// AWARDS
export const getAwards = async () => {
  const items = getLocalArray(KEYS.AWARDS, awardsJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    const aCreated = a.createdAt || 0;
    const bCreated = b.createdAt || 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    
    return (b.date || 0) - (a.date || 0);
  });
  return sorted;
};

export const addAward = async (data) => {
  return addToArray(KEYS.AWARDS, awardsJson, data, 'date');
};

export const updateAward = async (id, data) => {
  updateInArray(KEYS.AWARDS, awardsJson, id, data, 'date');
};

export const deleteAward = async (id) => {
  deleteFromArray(KEYS.AWARDS, awardsJson, id);
};

export const updateAwardOrder = async (id, order) => {
  updateOrderInArray(KEYS.AWARDS, awardsJson, id, order);
};

// PERSONAL PROJECTS
export const getPersonalProjects = async () => {
  const items = getLocalArray(KEYS.PERSONAL_PROJECTS, personalProjectsJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aHasOrder = a.order !== undefined && a.order !== null;
    const bHasOrder = b.order !== undefined && b.order !== null;
    
    if (aHasOrder && bHasOrder) return a.order - b.order;
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;
    
    const aHasEndDate = a.endDate != null && a.endDate !== '' && a.endDate !== 0;
    const bHasEndDate = b.endDate != null && b.endDate !== '' && b.endDate !== 0;
    
    if (!aHasEndDate && !bHasEndDate) {
      const aStartDate = a.startDate ? (typeof a.startDate === 'number' ? a.startDate : new Date(a.startDate).getTime() / 1000) : 0;
      const bStartDate = b.startDate ? (typeof b.startDate === 'number' ? b.startDate : new Date(b.startDate).getTime() / 1000) : 0;
      return bStartDate - aStartDate;
    }
    
    if (!aHasEndDate && bHasEndDate) return -1;
    if (aHasEndDate && !bHasEndDate) return 1;
    
    const aEndDate = typeof a.endDate === 'number' ? a.endDate : new Date(a.endDate).getTime() / 1000;
    const bEndDate = typeof b.endDate === 'number' ? b.endDate : new Date(b.endDate).getTime() / 1000;
    return bEndDate - aEndDate;
  });
  return sorted;
};

export const addPersonalProject = async (data) => {
  return addToArray(KEYS.PERSONAL_PROJECTS, personalProjectsJson, data);
};

export const updatePersonalProject = async (id, data) => {
  updateInArray(KEYS.PERSONAL_PROJECTS, personalProjectsJson, id, data);
};

export const deletePersonalProject = async (id) => {
  deleteFromArray(KEYS.PERSONAL_PROJECTS, personalProjectsJson, id);
};

export const updatePersonalProjectOrder = async (id, order) => {
  updateOrderInArray(KEYS.PERSONAL_PROJECTS, personalProjectsJson, id, order);
};

// PROGRAMMING
export const getProgramming = async () => {
  const data = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  return { description: data.description, githubUrl: data.githubUrl };
};

export const updateProgramming = async (data) => {
  const current = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  setLocalObject(KEYS.PROGRAMMING, { ...current, ...data });
};

export const getProgrammingProjects = async () => {
  const data = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  return data.projects || [];
};

export const addProgrammingProject = async (data) => {
  const current = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  const projects = [...(current.projects || [])];
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newProject = { ...data, id, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(newProject).forEach(k => {
    if (newProject[k] === undefined) delete newProject[k];
    if (newProject[k] === '') newProject[k] = null;
  });

  projects.push(newProject);
  setLocalObject(KEYS.PROGRAMMING, { ...current, projects });
  return id;
};

export const updateProgrammingProject = async (id, data) => {
  const current = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  const projects = (current.projects || []).map(p => {
    if (p.id === id) {
      const updated = { ...p, ...data };
      Object.keys(updated).forEach(k => {
        if (updated[k] === undefined) delete updated[k];
        if (updated[k] === '') updated[k] = null;
      });
      return updated;
    }
    return p;
  });
  setLocalObject(KEYS.PROGRAMMING, { ...current, projects });
};

export const deleteProgrammingProject = async (id) => {
  const current = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  const projects = (current.projects || []).filter(p => p.id !== id);
  setLocalObject(KEYS.PROGRAMMING, { ...current, projects });
};

export const updateProgrammingProjectOrder = async (id, order) => {
  const current = getLocalObject(KEYS.PROGRAMMING, programmingJson);
  const projects = (current.projects || []).map(p => {
    if (p.id === id) return { ...p, order };
    return p;
  });
  setLocalObject(KEYS.PROGRAMMING, { ...current, projects });
};

// WEB DEVELOPMENT
export const getWebDevelopment = async () => {
  const data = getLocalObject(KEYS.WEB_DEV, webDevJson);
  return { description: data.description };
};

export const updateWebDevelopment = async (data) => {
  const current = getLocalObject(KEYS.WEB_DEV, webDevJson);
  setLocalObject(KEYS.WEB_DEV, { ...current, ...data });
};

export const getWebDevProjects = async () => {
  const data = getLocalObject(KEYS.WEB_DEV, webDevJson);
  return data.projects || [];
};

export const addWebDevProject = async (data) => {
  const current = getLocalObject(KEYS.WEB_DEV, webDevJson);
  const projects = [...(current.projects || [])];
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newProject = { ...data, id, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(newProject).forEach(k => {
    if (newProject[k] === undefined) delete newProject[k];
    if (newProject[k] === '') newProject[k] = null;
  });

  projects.push(newProject);
  setLocalObject(KEYS.WEB_DEV, { ...current, projects });
  return id;
};

export const updateWebDevProject = async (id, data) => {
  const current = getLocalObject(KEYS.WEB_DEV, webDevJson);
  const projects = (current.projects || []).map(p => {
    if (p.id === id) {
      const updated = { ...p, ...data };
      Object.keys(updated).forEach(k => {
        if (updated[k] === undefined) delete updated[k];
        if (updated[k] === '') updated[k] = null;
      });
      return updated;
    }
    return p;
  });
  setLocalObject(KEYS.WEB_DEV, { ...current, projects });
};

export const deleteWebDevProject = async (id) => {
  const current = getLocalObject(KEYS.WEB_DEV, webDevJson);
  const projects = (current.projects || []).filter(p => p.id !== id);
  setLocalObject(KEYS.WEB_DEV, { ...current, projects });
};

export const updateWebDevProjectOrder = async (id, order) => {
  const current = getLocalObject(KEYS.WEB_DEV, webDevJson);
  const projects = (current.projects || []).map(p => {
    if (p.id === id) return { ...p, order };
    return p;
  });
  setLocalObject(KEYS.WEB_DEV, { ...current, projects });
};

// SCRIBBLING
export const getScribblingEntries = async (tag = null) => {
  const items = getLocalArray(KEYS.SCRIBBLING, scribblingJson);
  const filtered = items.filter(item => !tag || item.tag === tag);
  const sorted = [...filtered];
  sorted.sort((a, b) => {
    const aDate = a.date || 0;
    const bDate = b.date || 0;
    if (aDate !== bDate) return bDate - aDate;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const getScribblingTags = async () => {
  const entries = await getScribblingEntries();
  return [...new Set(entries.map(e => e.tag).filter(Boolean))];
};

export const addScribblingEntry = async (data) => {
  return addToArray(KEYS.SCRIBBLING, scribblingJson, data, 'date');
};

export const updateScribblingEntry = async (id, data) => {
  updateInArray(KEYS.SCRIBBLING, scribblingJson, id, data, 'date');
};

export const deleteScribblingEntry = async (id) => {
  deleteFromArray(KEYS.SCRIBBLING, scribblingJson, id);
};

export const updateScribblingEntryOrder = async (id, order) => {
  updateOrderInArray(KEYS.SCRIBBLING, scribblingJson, id, order);
};

export const getScribblingBySlug = async (slug) => {
  const entries = await getScribblingEntries();
  return entries.find(e => generateSlug(getSlugTitle(e)) === slug) || null;
};

// LEGACY SCRIBBLING (POEMS / STORIES / DRAWINGS)
export const getScribblingPoems = async () => getScribblingEntries('Poem');
export const addScribblingPoem = async (data) => addScribblingEntry({ ...data, tag: 'Poem' });
export const updateScribblingPoem = async (id, data) => updateScribblingEntry(id, { ...data, tag: 'Poem' });
export const deleteScribblingPoem = async (id) => deleteScribblingEntry(id);
export const updateScribblingPoemOrder = async (id, order) => updateScribblingEntryOrder(id, order);

export const getScribblingStories = async () => getScribblingEntries('Story');
export const addScribblingStory = async (data) => addScribblingEntry({ ...data, tag: 'Story' });
export const updateScribblingStory = async (id, data) => updateScribblingEntry(id, { ...data, tag: 'Story' });
export const deleteScribblingStory = async (id) => deleteScribblingEntry(id);
export const updateScribblingStoryOrder = async (id, order) => updateScribblingEntryOrder(id, order);

export const getScribblingDrawings = async () => getScribblingEntries('Drawing');
export const addScribblingDrawing = async (data) => addScribblingEntry({ ...data, tag: 'Drawing' });
export const updateScribblingDrawing = async (id, data) => updateScribblingEntry(id, { ...data, tag: 'Drawing' });
export const deleteScribblingDrawing = async (id) => deleteScribblingEntry(id);
export const updateScribblingDrawingOrder = async (id, order) => updateScribblingEntryOrder(id, order);

// CURATIONS
export const getCurationsEntries = async (tag = null) => {
  const items = getLocalArray(KEYS.CURATIONS, curationsJson);
  const filtered = items.filter(item => !tag || item.tag === tag);
  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const getCurationsTags = async () => {
  const entries = await getCurationsEntries();
  return [...new Set(entries.map(e => e.tag).filter(Boolean))];
};

export const addCurationsEntry = async (data) => {
  return addToArray(KEYS.CURATIONS, curationsJson, data);
};

export const updateCurationsEntry = async (id, data) => {
  updateInArray(KEYS.CURATIONS, curationsJson, id, data);
};

export const deleteCurationsEntry = async (id) => {
  deleteFromArray(KEYS.CURATIONS, curationsJson, id);
};

export const updateCurationsEntryOrder = async (id, order) => {
  updateOrderInArray(KEYS.CURATIONS, curationsJson, id, order);
};

// LEGACY CURATIONS
export const getCurationsMovies = async () => getCurationsEntries('Movie');
export const addCurationsMovie = async (data) => addCurationsEntry({ ...data, tag: 'Movie' });
export const updateCurationsMovie = async (id, data) => updateCurationsEntry(id, { ...data, tag: 'Movie' });
export const deleteCurationsMovie = async (id) => deleteCurationsEntry(id);
export const updateCurationsMovieOrder = async (id, order) => updateCurationsEntryOrder(id, order);

export const getCurationsBooks = async () => getCurationsEntries('Book');
export const addCurationsBook = async (data) => addCurationsEntry({ ...data, tag: 'Book' });
export const updateCurationsBook = async (id, data) => updateCurationsEntry(id, { ...data, tag: 'Book' });
export const deleteCurationsBook = async (id) => deleteCurationsEntry(id);
export const updateCurationsBookOrder = async (id, order) => updateCurationsEntryOrder(id, order);

export const getCurationsMusic = async () => getCurationsEntries('Music');
export const addCurationsMusic = async (data) => addCurationsEntry({ ...data, tag: 'Music' });
export const updateCurationsMusic = async (id, data) => updateCurationsEntry(id, { ...data, tag: 'Music' });
export const deleteCurationsMusic = async (id) => deleteCurationsEntry(id);
export const updateCurationsMusicOrder = async (id, order) => updateCurationsEntryOrder(id, order);

export const getCurationsArts = async () => getCurationsEntries('Art');
export const addCurationsArt = async (data) => addCurationsEntry({ ...data, tag: 'Art' });
export const updateCurationsArt = async (id, data) => updateCurationsEntry(id, { ...data, tag: 'Art' });
export const deleteCurationsArt = async (id) => deleteCurationsEntry(id);
export const updateCurationsArtOrder = async (id, order) => updateCurationsEntryOrder(id, order);

// GALLERY
export const getGallery = async () => {
  const items = getLocalArray(KEYS.GALLERY, galleryJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addGalleryItem = async (data) => {
  return addToArray(KEYS.GALLERY, galleryJson, data);
};

export const updateGalleryItem = async (id, data) => {
  updateInArray(KEYS.GALLERY, galleryJson, id, data);
};

export const deleteGalleryItem = async (id) => {
  deleteFromArray(KEYS.GALLERY, galleryJson, id);
};

export const updateGalleryItemOrder = async (id, order) => {
  updateOrderInArray(KEYS.GALLERY, galleryJson, id, order);
};

// POSTS
export const getPosts = async () => {
  const items = getLocalArray(KEYS.POSTS, postsJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aDate = a.date || 0;
    const bDate = b.date || 0;
    if (aDate !== bDate) return bDate - aDate;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addPost = async (data) => {
  return addToArray(KEYS.POSTS, postsJson, data, 'date');
};

export const updatePost = async (id, data) => {
  updateInArray(KEYS.POSTS, postsJson, id, data, 'date');
};

export const deletePost = async (id) => {
  deleteFromArray(KEYS.POSTS, postsJson, id);
};

export const updatePostOrder = async (id, order) => {
  updateOrderInArray(KEYS.POSTS, postsJson, id, order);
};

export const getPostBySlug = async (slug) => {
  const posts = await getPosts();
  return posts.find(p => generateSlug(getSlugTitle(p)) === slug) || null;
};

// HOBBIES
export const getHobbies = async () => {
  const items = getLocalArray(KEYS.HOBBIES, hobbiesJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addHobby = async (data) => {
  return addToArray(KEYS.HOBBIES, hobbiesJson, data);
};

export const updateHobby = async (id, data) => {
  updateInArray(KEYS.HOBBIES, hobbiesJson, id, data);
};

export const deleteHobby = async (id) => {
  deleteFromArray(KEYS.HOBBIES, hobbiesJson, id);
};

export const updateHobbyOrder = async (id, order) => {
  updateOrderInArray(KEYS.HOBBIES, hobbiesJson, id, order);
};

export const getHobbyBySlug = async (slug) => {
  const hobbies = await getHobbies();
  return hobbies.find(h => generateSlug(h.title) === slug) || null;
};

// CHESS JOURNAL
export const getChessJournalEntries = async () => {
  const items = getLocalArray(KEYS.CHESS_JOURNAL, chessJournalJson);
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aDate = a.date || 0;
    const bDate = b.date || 0;
    if (aDate !== bDate) return bDate - aDate;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return sorted;
};

export const addChessJournalEntry = async (data) => {
  return addToArray(KEYS.CHESS_JOURNAL, chessJournalJson, data, 'date');
};

export const updateChessJournalEntry = async (id, data) => {
  updateInArray(KEYS.CHESS_JOURNAL, chessJournalJson, id, data, 'date');
};

export const deleteChessJournalEntry = async (id) => {
  deleteFromArray(KEYS.CHESS_JOURNAL, chessJournalJson, id);
};

export const getChessJournalEntryBySlug = async (slug) => {
  const entries = await getChessJournalEntries();
  return entries.find(e => generateSlug(e.title) === slug) || null;
};

// Slugs / Titles Utilities
export const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getSlugTitle = (entry) => {
  if (entry.englishTitle && entry.englishTitle.trim()) {
    return entry.englishTitle;
  }
  return entry.title || '';
};

export { timestampToDateString };
