import { 
  ref,
  get,
  set,
  push,
  update,
  remove,
  child,
  query,
  orderByChild,
  limitToLast
} from 'firebase/database';
import { db } from '../firebase/config';

// Base path for all data
const WEBSITE_PATH = 'website';

// Helper to get reference to website path
const getWebsiteRef = (path = '') => {
  return path ? ref(db, `${WEBSITE_PATH}/${path}`) : ref(db, WEBSITE_PATH);
};

// Helper to convert date string to timestamp (Unix seconds)
const dateStringToTimestamp = (dateString) => {
  if (!dateString || dateString === '') {
    return null;
  }
  try {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000); // Convert to Unix timestamp
  } catch (error) {
    console.error('Error converting date to timestamp:', error);
    return null;
  }
};

// Helper to convert timestamp to date string for form inputs
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

// Profile
export const getProfile = async () => {
  try {
    const profileRef = getWebsiteRef('profile/main');
    const snapshot = await get(profileRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('getProfile failed:', error);
    return null;
  }
};

export const updateProfile = async (data) => {
  const profileRef = getWebsiteRef('profile/main');
  await set(profileRef, data);
};

// Research
export const getResearch = async () => {
  try {
    const researchRef = getWebsiteRef('research');
    const snapshot = await get(researchRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Filter out 'metadata', 'publications', 'speeches', and 'notes' keys as they're not research experience entries
      const items = Object.keys(data)
        .filter(id => id !== 'metadata' && id !== 'publications' && id !== 'speeches' && id !== 'notes')
        .map(id => ({
          id,
          ...data[id],
          createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0 // Fallback to timestamp from key
        }));
      // Sort by order if exists, then by createdAt (newest first), then by startDate if createdAt is same
      items.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // Otherwise sort by createdAt
        if (a.createdAt !== b.createdAt) {
          return b.createdAt - a.createdAt; // Newest first
        }
        const aDate = a.startDate || 0;
        const bDate = b.startDate || 0;
        return bDate - aDate;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getResearch failed:', error);
    return [];
  }
};

export const addResearch = async (data) => {
  // Convert dates to timestamps
  const dataToSave = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || null,
    endDate: dateStringToTimestamp(data.endDate) || null,
    createdAt: Math.floor(Date.now() / 1000), // Unix timestamp for sorting newest first
  };
  
  // Remove undefined values
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
    if (dataToSave[key] === '') {
      dataToSave[key] = null;
    }
  });
  
  try {
    const researchRef = getWebsiteRef('research');
    const newRef = push(researchRef);
    await set(newRef, dataToSave);
    
    return newRef.key;
  } catch (error) {
    console.error('❌❌❌ CRITICAL ERROR ADDING RESEARCH ❌❌❌');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const updateResearch = async (id, data) => {
  // Convert dates to timestamps
  const dataToUpdate = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || data.startDate,
    endDate: dateStringToTimestamp(data.endDate) || data.endDate,
  };
  
  // Remove undefined values
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) {
      delete dataToUpdate[key];
    }
    if (dataToUpdate[key] === '') {
      dataToUpdate[key] = null;
    }
  });
  
  try {
    const researchRef = getWebsiteRef(`research/${id}`);
    await set(researchRef, dataToUpdate);
    
  } catch (error) {
    console.error('❌❌❌ CRITICAL ERROR UPDATING RESEARCH ❌❌❌');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const deleteResearch = async (id) => {
  const researchRef = getWebsiteRef(`research/${id}`);
  await remove(researchRef);
};

export const updateResearchOrder = async (id, order) => {
  const researchRef = getWebsiteRef(`research/${id}/order`);
  await set(researchRef, order);
};

// Research Metadata (work links and profile links)
export const getResearchMetadata = async () => {
  try {
    const metadataRef = getWebsiteRef('research/metadata');
    const snapshot = await get(metadataRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return { profileLinks: [] };
  } catch (error) {
    console.error('getResearchMetadata failed:', error);
    return { profileLinks: [] };
  }
};

export const updateResearchMetadata = async (data) => {
  const metadataRef = getWebsiteRef('research/metadata');
  const dataToSave = {
    profileLinks: Array.isArray(data.profileLinks) ? data.profileLinks.filter(link => link.label && link.url) : []
  };
  await set(metadataRef, dataToSave);
};

// Publications (Research)
export const getPublications = async () => {
  try {
    const publicationsRef = getWebsiteRef('research/publications');
    const snapshot = await get(publicationsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getPublications failed:', error);
    return [];
  }
};

export const addPublication = async (data) => {
  const publicationsRef = getWebsiteRef('research/publications');
  const newRef = push(publicationsRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updatePublication = async (id, data) => {
  const publicationRef = getWebsiteRef(`research/publications/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(publicationRef, dataToUpdate);
};

export const deletePublication = async (id) => {
  const publicationRef = getWebsiteRef(`research/publications/${id}`);
  await remove(publicationRef);
};

export const updatePublicationOrder = async (id, order) => {
  const publicationRef = getWebsiteRef(`research/publications/${id}/order`);
  await set(publicationRef, order);
};

// Speeches (Research)
export const getSpeeches = async () => {
  try {
    const speechesRef = getWebsiteRef('research/speeches');
    const snapshot = await get(speechesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getSpeeches failed:', error);
    return [];
  }
};

export const addSpeech = async (data) => {
  const speechesRef = getWebsiteRef('research/speeches');
  const newRef = push(speechesRef);
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || null,
    createdAt: Math.floor(Date.now() / 1000)
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateSpeech = async (id, data) => {
  const speechRef = getWebsiteRef(`research/speeches/${id}`);
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date
  };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(speechRef, dataToUpdate);
};

export const deleteSpeech = async (id) => {
  const speechRef = getWebsiteRef(`research/speeches/${id}`);
  await remove(speechRef);
};

export const updateSpeechOrder = async (id, order) => {
  const speechRef = getWebsiteRef(`research/speeches/${id}/order`);
  await set(speechRef, order);
};

// Notes (Research)
export const getNotes = async () => {
  try {
    const notesRef = getWebsiteRef('research/notes');
    const snapshot = await get(notesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // Sort by date (most recent first), then by createdAt if no date
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        if (aDate !== bDate) {
          return bDate - aDate; // Most recent first
        }
        // If dates are equal or both null, sort by createdAt
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getNotes failed:', error);
    return [];
  }
};

export const addNote = async (data) => {
  const notesRef = getWebsiteRef('research/notes');
  const newRef = push(notesRef);
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || null,
    createdAt: Math.floor(Date.now() / 1000)
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateNote = async (id, data) => {
  const noteRef = getWebsiteRef(`research/notes/${id}`);
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date
  };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(noteRef, dataToUpdate);
};

// Generate slug from title
export const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Helper to get title for slug generation (prefers englishTitle for scribbling entries)
export const getSlugTitle = (entry) => {
  if (entry.englishTitle && entry.englishTitle.trim()) {
    return entry.englishTitle;
  }
  return entry.title || '';
};

// Get single note by slug
export const getNoteBySlug = async (slug) => {
  try {
    const notesRef = getWebsiteRef('research/notes');
    const snapshot = await get(notesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const notes = Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
      const note = notes.find(n => generateSlug(n.title) === slug);
      return note || null;
    }
    return null;
  } catch (error) {
    console.error('getNoteBySlug failed:', error);
    return null;
  }
};

// Get single note by ID (for backward compatibility)
export const getNote = async (id) => {
  try {
    const noteRef = getWebsiteRef(`research/notes/${id}`);
    const snapshot = await get(noteRef);
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error('getNote failed:', error);
    return null;
  }
};

export const deleteNote = async (id) => {
  const noteRef = getWebsiteRef(`research/notes/${id}`);
  await remove(noteRef);
};

export const updateNoteOrder = async (id, order) => {
  const noteRef = getWebsiteRef(`research/notes/${id}/order`);
  await set(noteRef, order);
};

// Teaching
export const getTeaching = async () => {
  try {
    const teachingRef = getWebsiteRef('teaching');
    const snapshot = await get(teachingRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Filter out 'metadata' and 'courses' keys as they are not teaching experience entries
      const items = Object.keys(data)
        .filter(id => id !== 'metadata' && id !== 'courses')
        .map(id => ({
          id,
          ...data[id],
          createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
        }));
      items.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // Otherwise sort by createdAt
        if (a.createdAt !== b.createdAt) {
          return b.createdAt - a.createdAt;
        }
        const aDate = a.startDate || 0;
        const bDate = b.startDate || 0;
        return bDate - aDate;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getTeaching failed:', error);
    return [];
  }
};

export const addTeaching = async (data) => {
  const teachingRef = getWebsiteRef('teaching');
  const newRef = push(teachingRef);
  
  // Convert dates to timestamps
  const dataToSave = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || null,
    endDate: dateStringToTimestamp(data.endDate) || null,
    createdAt: Math.floor(Date.now() / 1000),
  };
  
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateTeaching = async (id, data) => {
  const teachingRef = getWebsiteRef(`teaching/${id}`);
  
  const dataToUpdate = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || data.startDate,
    endDate: dateStringToTimestamp(data.endDate) || data.endDate,
  };
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(teachingRef, dataToUpdate);
};

export const deleteTeaching = async (id) => {
  const teachingRef = getWebsiteRef(`teaching/${id}`);
  await remove(teachingRef);
};

export const updateTeachingOrder = async (id, order) => {
  const teachingRef = getWebsiteRef(`teaching/${id}/order`);
  await set(teachingRef, order);
};

// Teaching Metadata (description and general subjects)
export const getTeachingMetadata = async () => {
  try {
    const metadataRef = getWebsiteRef('teaching/metadata');
    const snapshot = await get(metadataRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return { description: '', generalSubjects: [] };
  } catch (error) {
    console.error('getTeachingMetadata failed:', error);
    return { description: '', generalSubjects: [] };
  }
};

export const updateTeachingMetadata = async (data) => {
  const metadataRef = getWebsiteRef('teaching/metadata');
  const dataToSave = {
    description: data.description || '',
    generalSubjects: Array.isArray(data.generalSubjects) ? data.generalSubjects.filter(s => s.trim() !== '') : []
  };
  await set(metadataRef, dataToSave);
};

// Courses
export const getCourses = async () => {
  try {
    const coursesRef = getWebsiteRef('teaching/courses');
    const snapshot = await get(coursesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getCourses failed:', error);
    return [];
  }
};

export const addCourse = async (data) => {
  const coursesRef = getWebsiteRef('teaching/courses');
  const newRef = push(coursesRef);
  
  const dataToSave = {
    ...data,
    createdAt: Math.floor(Date.now() / 1000),
  };
  
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateCourse = async (id, data) => {
  const courseRef = getWebsiteRef(`teaching/courses/${id}`);
  
  const dataToUpdate = { ...data };
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(courseRef, dataToUpdate);
};

export const deleteCourse = async (id) => {
  const courseRef = getWebsiteRef(`teaching/courses/${id}`);
  await remove(courseRef);
};

export const updateCourseOrder = async (id, order) => {
  const courseRef = getWebsiteRef(`teaching/courses/${id}/order`);
  await set(courseRef, order);
};

// Education
export const getEducation = async () => {
  try {
    const educationRef = getWebsiteRef('education');
    const snapshot = await get(educationRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // Otherwise sort by createdAt
        if (a.createdAt !== b.createdAt) {
          return b.createdAt - a.createdAt;
        }
        const aDate = a.startDate || 0;
        const bDate = b.startDate || 0;
        return bDate - aDate;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getEducation failed:', error);
    return [];
  }
};

export const addEducation = async (data) => {
  const educationRef = getWebsiteRef('education');
  const newRef = push(educationRef);
  
  const dataToSave = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || null,
    endDate: dateStringToTimestamp(data.endDate) || null,
    createdAt: Math.floor(Date.now() / 1000),
  };
  
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateEducation = async (id, data) => {
  const educationRef = getWebsiteRef(`education/${id}`);
  
  const dataToUpdate = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || data.startDate,
    endDate: dateStringToTimestamp(data.endDate) || data.endDate,
  };
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(educationRef, dataToUpdate);
};

export const deleteEducation = async (id) => {
  const educationRef = getWebsiteRef(`education/${id}`);
  await remove(educationRef);
};

export const updateEducationOrder = async (id, order) => {
  const educationRef = getWebsiteRef(`education/${id}/order`);
  await set(educationRef, order);
};

// Skills
export const getSkills = async () => {
  try {
    const skillsRef = getWebsiteRef('skills');
    const snapshot = await get(skillsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // Otherwise sort by createdAt
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getSkills failed:', error);
    return [];
  }
};

export const addSkill = async (data) => {
  const skillsRef = getWebsiteRef('skills');
  const newRef = push(skillsRef);
  
  const dataToSave = { 
    ...data,
    createdAt: Math.floor(Date.now() / 1000),
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateSkill = async (id, data) => {
  const skillsRef = getWebsiteRef(`skills/${id}`);
  
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(skillsRef, dataToUpdate);
};

export const deleteSkill = async (id) => {
  const skillsRef = getWebsiteRef(`skills/${id}`);
  await remove(skillsRef);
};

export const updateSkillOrder = async (id, order) => {
  const skillRef = getWebsiteRef(`skills/${id}/order`);
  await set(skillRef, order);
};

// Activities
export const getActivities = async () => {
  try {
    const activitiesRef = getWebsiteRef('activities');
    const snapshot = await get(activitiesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // Otherwise sort by createdAt
        if (a.createdAt !== b.createdAt) {
          return b.createdAt - a.createdAt;
        }
        const aDate = a.startDate || 0;
        const bDate = b.startDate || 0;
        return bDate - aDate;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getActivities failed:', error);
    return [];
  }
};

export const addActivity = async (data) => {
  const activitiesRef = getWebsiteRef('activities');
  const newRef = push(activitiesRef);
  
  const dataToSave = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || null,
    endDate: dateStringToTimestamp(data.endDate) || null,
    createdAt: Math.floor(Date.now() / 1000),
  };
  
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateActivity = async (id, data) => {
  const activitiesRef = getWebsiteRef(`activities/${id}`);
  
  const dataToUpdate = {
    ...data,
    startDate: dateStringToTimestamp(data.startDate) || data.startDate,
    endDate: dateStringToTimestamp(data.endDate) || data.endDate,
  };
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(activitiesRef, dataToUpdate);
};

export const deleteActivity = async (id) => {
  const activitiesRef = getWebsiteRef(`activities/${id}`);
  await remove(activitiesRef);
};

export const updateActivityOrder = async (id, order) => {
  const activityRef = getWebsiteRef(`activities/${id}/order`);
  await set(activityRef, order);
};

// Awards
export const getAwards = async () => {
  try {
    const awardsRef = getWebsiteRef('awards');
    const snapshot = await get(awardsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // Otherwise sort by createdAt
        if (a.createdAt !== b.createdAt) {
          return b.createdAt - a.createdAt;
        }
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        return bDate - aDate;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getAwards failed:', error);
    return [];
  }
};

export const addAward = async (data) => {
  const awardsRef = getWebsiteRef('awards');
  const newRef = push(awardsRef);
  
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || null,
    createdAt: Math.floor(Date.now() / 1000),
  };
  
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateAward = async (id, data) => {
  const awardsRef = getWebsiteRef(`awards/${id}`);
  
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date,
  };
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(awardsRef, dataToUpdate);
};

export const deleteAward = async (id) => {
  const awardsRef = getWebsiteRef(`awards/${id}`);
  await remove(awardsRef);
};

export const updateAwardOrder = async (id, order) => {
  const awardRef = getWebsiteRef(`awards/${id}/order`);
  await set(awardRef, order);
};

// Personal Projects
export const getPersonalProjects = async () => {
  try {
    const projectsRef = getWebsiteRef('personal/projects');
    const snapshot = await get(projectsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // If order is set, respect manual ordering (but only if both have order or one has order)
        // If order is explicitly set to null/undefined, ignore it and use date sorting
        const aHasOrder = a.order !== undefined && a.order !== null;
        const bHasOrder = b.order !== undefined && b.order !== null;
        
        if (aHasOrder && bHasOrder) {
          return a.order - b.order;
        }
        if (aHasOrder) return -1;
        if (bHasOrder) return 1;
        
        // Otherwise, sort by: ongoing projects first (by startDate newest first), then finished projects (by endDate newest first)
        // Ongoing = project without endDate (endDate is null/undefined/empty)
        const aHasEndDate = a.endDate != null && a.endDate !== '' && a.endDate !== 0;
        const bHasEndDate = b.endDate != null && b.endDate !== '' && b.endDate !== 0;
        
        // If both are ongoing (no endDate), sort by start date (newest first)
        if (!aHasEndDate && !bHasEndDate) {
          const aStartDate = a.startDate ? (typeof a.startDate === 'number' ? a.startDate : new Date(a.startDate).getTime() / 1000) : 0;
          const bStartDate = b.startDate ? (typeof b.startDate === 'number' ? b.startDate : new Date(b.startDate).getTime() / 1000) : 0;
          return bStartDate - aStartDate; // newest first (descending order)
        }
        
        // If only one is ongoing, ongoing project comes first
        if (!aHasEndDate && bHasEndDate) {
          return -1; // a is ongoing, b is finished - a comes first
        }
        if (aHasEndDate && !bHasEndDate) {
          return 1; // a is finished, b is ongoing - b comes first
        }
        
        // Both have end dates (both finished), sort by end date (newest first)
        const aEndDate = typeof a.endDate === 'number' ? a.endDate : new Date(a.endDate).getTime() / 1000;
        const bEndDate = typeof b.endDate === 'number' ? b.endDate : new Date(b.endDate).getTime() / 1000;
        return bEndDate - aEndDate; // newest first
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getPersonalProjects failed:', error);
    return [];
  }
};

export const addPersonalProject = async (data) => {
  const projectsRef = getWebsiteRef('personal/projects');
  const newRef = push(projectsRef);
  
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date || null,
    startDate: dateStringToTimestamp(data.startDate) || data.startDate || null,
    endDate: dateStringToTimestamp(data.endDate) || data.endDate || null,
    createdAt: Math.floor(Date.now() / 1000),
  };
  
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updatePersonalProject = async (id, data) => {
  const projectRef = getWebsiteRef(`personal/projects/${id}`);
  
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date,
    startDate: dateStringToTimestamp(data.startDate) || data.startDate,
    endDate: dateStringToTimestamp(data.endDate) || data.endDate,
  };
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  
  await set(projectRef, dataToUpdate);
};

export const deletePersonalProject = async (id) => {
  const projectRef = getWebsiteRef(`personal/projects/${id}`);
  await remove(projectRef);
};

export const updatePersonalProjectOrder = async (id, order) => {
  const projectRef = getWebsiteRef(`personal/projects/${id}/order`);
  await set(projectRef, order);
};

// Programming (Personal)
export const getProgramming = async () => {
  try {
    const programmingRef = getWebsiteRef('personal/programming');
    const snapshot = await get(programmingRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('getProgramming failed:', error);
    return null;
  }
};

export const updateProgramming = async (data) => {
  const programmingRef = getWebsiteRef('personal/programming');
  await set(programmingRef, data);
};

export const getProgrammingProjects = async () => {
  try {
    const projectsRef = getWebsiteRef('personal/programming/projects');
    const snapshot = await get(projectsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getProgrammingProjects failed:', error);
    return [];
  }
};

export const addProgrammingProject = async (data) => {
  const projectsRef = getWebsiteRef('personal/programming/projects');
  const newRef = push(projectsRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateProgrammingProject = async (id, data) => {
  const projectRef = getWebsiteRef(`personal/programming/projects/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(projectRef, dataToUpdate);
};

export const deleteProgrammingProject = async (id) => {
  const projectRef = getWebsiteRef(`personal/programming/projects/${id}`);
  await remove(projectRef);
};

export const updateProgrammingProjectOrder = async (id, order) => {
  const projectRef = getWebsiteRef(`personal/programming/projects/${id}/order`);
  await set(projectRef, order);
};

// Web Development (Personal)
export const getWebDevelopment = async () => {
  try {
    const webDevRef = getWebsiteRef('personal/web-development');
    const snapshot = await get(webDevRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('getWebDevelopment failed:', error);
    return null;
  }
};

export const updateWebDevelopment = async (data) => {
  const webDevRef = getWebsiteRef('personal/web-development');
  await set(webDevRef, data);
};

export const getWebDevProjects = async () => {
  try {
    const projectsRef = getWebsiteRef('personal/web-development/projects');
    const snapshot = await get(projectsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getWebDevProjects failed:', error);
    return [];
  }
};

export const addWebDevProject = async (data) => {
  const projectsRef = getWebsiteRef('personal/web-development/projects');
  const newRef = push(projectsRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateWebDevProject = async (id, data) => {
  const projectRef = getWebsiteRef(`personal/web-development/projects/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(projectRef, dataToUpdate);
};

export const deleteWebDevProject = async (id) => {
  const projectRef = getWebsiteRef(`personal/web-development/projects/${id}`);
  await remove(projectRef);
};

export const updateWebDevProjectOrder = async (id, order) => {
  const projectRef = getWebsiteRef(`personal/web-development/projects/${id}/order`);
  await set(projectRef, order);
};

// Scribbling (Personal) - Get all entries with optional tag filter
export const getScribblingEntries = async (tag = null) => {
  try {
    const scribblingRef = getWebsiteRef('personal/scribbling/entries');
    const snapshot = await get(scribblingRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      })).filter(item => !tag || item.tag === tag);
      items.sort((a, b) => {
        // Sort by date (most recent first), then by createdAt if no date
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        if (aDate !== bDate) {
          return bDate - aDate; // Most recent first
        }
        // If dates are equal or both null, sort by createdAt
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getScribblingEntries failed:', error);
    return [];
  }
};

export const getScribblingTags = async () => {
  try {
    const entries = await getScribblingEntries();
    const tags = [...new Set(entries.map(e => e.tag).filter(Boolean))];
    return tags;
  } catch (error) {
    console.error('getScribblingTags failed:', error);
    return [];
  }
};

export const addScribblingEntry = async (data) => {
  const entriesRef = getWebsiteRef('personal/scribbling/entries');
  const newRef = push(entriesRef);
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date || null,
    createdAt: Math.floor(Date.now() / 1000)
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateScribblingEntry = async (id, data) => {
  const entryRef = getWebsiteRef(`personal/scribbling/entries/${id}`);
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date
  };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(entryRef, dataToUpdate);
};

export const deleteScribblingEntry = async (id) => {
  const entryRef = getWebsiteRef(`personal/scribbling/entries/${id}`);
  await remove(entryRef);
};

export const updateScribblingEntryOrder = async (id, order) => {
  const entryRef = getWebsiteRef(`personal/scribbling/entries/${id}/order`);
  await set(entryRef, order);
};

export const getScribblingBySlug = async (slug) => {
  try {
    const scribblingRef = getWebsiteRef('personal/scribbling/entries');
    const snapshot = await get(scribblingRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const entries = Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
      const entry = entries.find(e => generateSlug(getSlugTitle(e)) === slug);
      return entry || null;
    }
    return null;
  } catch (error) {
    console.error('getScribblingBySlug failed:', error);
    return null;
  }
};

// Legacy functions for backwards compatibility (keeping for admin editor)
export const getScribblingPoems = async () => {
  try {
    const poemsRef = getWebsiteRef('personal/scribbling/poems');
    const snapshot = await get(poemsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getScribblingPoems failed:', error);
    return [];
  }
};

export const addScribblingPoem = async (data) => {
  const poemsRef = getWebsiteRef('personal/scribbling/poems');
  const newRef = push(poemsRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateScribblingPoem = async (id, data) => {
  const poemRef = getWebsiteRef(`personal/scribbling/poems/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(poemRef, dataToUpdate);
};

export const deleteScribblingPoem = async (id) => {
  const poemRef = getWebsiteRef(`personal/scribbling/poems/${id}`);
  await remove(poemRef);
};

export const updateScribblingPoemOrder = async (id, order) => {
  const poemRef = getWebsiteRef(`personal/scribbling/poems/${id}/order`);
  await set(poemRef, order);
};

export const getScribblingStories = async () => {
  try {
    const storiesRef = getWebsiteRef('personal/scribbling/stories');
    const snapshot = await get(storiesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getScribblingStories failed:', error);
    return [];
  }
};

export const addScribblingStory = async (data) => {
  const storiesRef = getWebsiteRef('personal/scribbling/stories');
  const newRef = push(storiesRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateScribblingStory = async (id, data) => {
  const storyRef = getWebsiteRef(`personal/scribbling/stories/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(storyRef, dataToUpdate);
};

export const deleteScribblingStory = async (id) => {
  const storyRef = getWebsiteRef(`personal/scribbling/stories/${id}`);
  await remove(storyRef);
};

export const updateScribblingStoryOrder = async (id, order) => {
  const storyRef = getWebsiteRef(`personal/scribbling/stories/${id}/order`);
  await set(storyRef, order);
};

export const getScribblingDrawings = async () => {
  try {
    const drawingsRef = getWebsiteRef('personal/scribbling/drawings');
    const snapshot = await get(drawingsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getScribblingDrawings failed:', error);
    return [];
  }
};

export const addScribblingDrawing = async (data) => {
  const drawingsRef = getWebsiteRef('personal/scribbling/drawings');
  const newRef = push(drawingsRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateScribblingDrawing = async (id, data) => {
  const drawingRef = getWebsiteRef(`personal/scribbling/drawings/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(drawingRef, dataToUpdate);
};

export const deleteScribblingDrawing = async (id) => {
  const drawingRef = getWebsiteRef(`personal/scribbling/drawings/${id}`);
  await remove(drawingRef);
};

export const updateScribblingDrawingOrder = async (id, order) => {
  const drawingRef = getWebsiteRef(`personal/scribbling/drawings/${id}/order`);
  await set(drawingRef, order);
};

// Curations (Personal) - Get all entries with optional tag filter
export const getCurationsEntries = async (tag = null) => {
  try {
    const curationsRef = getWebsiteRef('personal/curations/entries');
    const snapshot = await get(curationsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      })).filter(item => !tag || item.tag === tag);
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getCurationsEntries failed:', error);
    return [];
  }
};

export const getCurationsTags = async () => {
  try {
    const entries = await getCurationsEntries();
    const tags = [...new Set(entries.map(e => e.tag).filter(Boolean))];
    return tags;
  } catch (error) {
    console.error('getCurationsTags failed:', error);
    return [];
  }
};

export const addCurationsEntry = async (data) => {
  const entriesRef = getWebsiteRef('personal/curations/entries');
  const newRef = push(entriesRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateCurationsEntry = async (id, data) => {
  const entryRef = getWebsiteRef(`personal/curations/entries/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(entryRef, dataToUpdate);
};

export const deleteCurationsEntry = async (id) => {
  const entryRef = getWebsiteRef(`personal/curations/entries/${id}`);
  await remove(entryRef);
};

export const updateCurationsEntryOrder = async (id, order) => {
  const entryRef = getWebsiteRef(`personal/curations/entries/${id}/order`);
  await set(entryRef, order);
};

// Legacy functions for backwards compatibility
export const getCurationsMovies = async () => {
  try {
    const moviesRef = getWebsiteRef('personal/curations/movies');
    const snapshot = await get(moviesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getCurationsMovies failed:', error);
    return [];
  }
};

export const addCurationsMovie = async (data) => {
  const moviesRef = getWebsiteRef('personal/curations/movies');
  const newRef = push(moviesRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateCurationsMovie = async (id, data) => {
  const movieRef = getWebsiteRef(`personal/curations/movies/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(movieRef, dataToUpdate);
};

export const deleteCurationsMovie = async (id) => {
  const movieRef = getWebsiteRef(`personal/curations/movies/${id}`);
  await remove(movieRef);
};

export const updateCurationsMovieOrder = async (id, order) => {
  const movieRef = getWebsiteRef(`personal/curations/movies/${id}/order`);
  await set(movieRef, order);
};

export const getCurationsBooks = async () => {
  try {
    const booksRef = getWebsiteRef('personal/curations/books');
    const snapshot = await get(booksRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getCurationsBooks failed:', error);
    return [];
  }
};

export const addCurationsBook = async (data) => {
  const booksRef = getWebsiteRef('personal/curations/books');
  const newRef = push(booksRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateCurationsBook = async (id, data) => {
  const bookRef = getWebsiteRef(`personal/curations/books/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(bookRef, dataToUpdate);
};

export const deleteCurationsBook = async (id) => {
  const bookRef = getWebsiteRef(`personal/curations/books/${id}`);
  await remove(bookRef);
};

export const updateCurationsBookOrder = async (id, order) => {
  const bookRef = getWebsiteRef(`personal/curations/books/${id}/order`);
  await set(bookRef, order);
};

export const getCurationsMusic = async () => {
  try {
    const musicRef = getWebsiteRef('personal/curations/music');
    const snapshot = await get(musicRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getCurationsMusic failed:', error);
    return [];
  }
};

export const addCurationsMusic = async (data) => {
  const musicRef = getWebsiteRef('personal/curations/music');
  const newRef = push(musicRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateCurationsMusic = async (id, data) => {
  const musicRef = getWebsiteRef(`personal/curations/music/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(musicRef, dataToUpdate);
};

export const deleteCurationsMusic = async (id) => {
  const musicRef = getWebsiteRef(`personal/curations/music/${id}`);
  await remove(musicRef);
};

export const updateCurationsMusicOrder = async (id, order) => {
  const musicRef = getWebsiteRef(`personal/curations/music/${id}/order`);
  await set(musicRef, order);
};

export const getCurationsArts = async () => {
  try {
    const artsRef = getWebsiteRef('personal/curations/arts');
    const snapshot = await get(artsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getCurationsArts failed:', error);
    return [];
  }
};

export const addCurationsArt = async (data) => {
  const artsRef = getWebsiteRef('personal/curations/arts');
  const newRef = push(artsRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateCurationsArt = async (id, data) => {
  const artRef = getWebsiteRef(`personal/curations/arts/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(artRef, dataToUpdate);
};

export const deleteCurationsArt = async (id) => {
  const artRef = getWebsiteRef(`personal/curations/arts/${id}`);
  await remove(artRef);
};

export const updateCurationsArtOrder = async (id, order) => {
  const artRef = getWebsiteRef(`personal/curations/arts/${id}/order`);
  await set(artRef, order);
};

// Gallery (Personal)
export const getGallery = async () => {
  try {
    const galleryRef = getWebsiteRef('personal/gallery');
    const snapshot = await get(galleryRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      })).filter(item => item.id !== 'main'); // Exclude 'main' if it's metadata
      items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getGallery failed:', error);
    return [];
  }
};

export const addGalleryItem = async (data) => {
  const galleryRef = getWebsiteRef('personal/gallery');
  const newRef = push(galleryRef);
  const dataToSave = { ...data, createdAt: Math.floor(Date.now() / 1000) };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateGalleryItem = async (id, data) => {
  const itemRef = getWebsiteRef(`personal/gallery/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(itemRef, dataToUpdate);
};

export const deleteGalleryItem = async (id) => {
  const itemRef = getWebsiteRef(`personal/gallery/${id}`);
  await remove(itemRef);
};

export const updateGalleryItemOrder = async (id, order) => {
  const itemRef = getWebsiteRef(`personal/gallery/${id}/order`);
  await set(itemRef, order);
};

// Posts (Personal)
export const getPosts = async () => {
  try {
    const postsRef = getWebsiteRef('personal/posts');
    const snapshot = await get(postsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // Sort by date (most recent first), then by createdAt if no date
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        if (aDate !== bDate) {
          return bDate - aDate; // Most recent first
        }
        // If dates are equal or both null, sort by createdAt
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getPosts failed:', error);
    return [];
  }
};

export const addPost = async (data) => {
  const postsRef = getWebsiteRef('personal/posts');
  const newRef = push(postsRef);
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date || null,
    createdAt: Math.floor(Date.now() / 1000)
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updatePost = async (id, data) => {
  const postRef = getWebsiteRef(`personal/posts/${id}`);
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date
  };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(postRef, dataToUpdate);
};

export const deletePost = async (id) => {
  const postRef = getWebsiteRef(`personal/posts/${id}`);
  await remove(postRef);
};

export const updatePostOrder = async (id, order) => {
  const postRef = getWebsiteRef(`personal/posts/${id}/order`);
  await set(postRef, order);
};

// Get single post by slug
export const getPostBySlug = async (slug) => {
  try {
    const postsRef = getWebsiteRef('personal/posts');
    const snapshot = await get(postsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const posts = Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
      const post = posts.find(p => generateSlug(p.title) === slug);
      return post || null;
    }
    return null;
  } catch (error) {
    console.error('getPostBySlug failed:', error);
    return null;
  }
};

// Hobbies
export const getHobbies = async () => {
  try {
    const hobbiesRef = getWebsiteRef('personal/hobbies');
    const snapshot = await get(hobbiesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const hobbies = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      // Sort by order if exists, then by createdAt (newest first)
      hobbies.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      return hobbies;
    }
    return [];
  } catch (error) {
    console.error('getHobbies failed:', error);
    return [];
  }
};

export const addHobby = async (data) => {
  const hobbiesRef = getWebsiteRef('personal/hobbies');
  const newRef = push(hobbiesRef);
  const dataToSave = {
    ...data,
    createdAt: Math.floor(Date.now() / 1000)
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateHobby = async (id, data) => {
  const hobbyRef = getWebsiteRef(`personal/hobbies/${id}`);
  const dataToUpdate = { ...data };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(hobbyRef, dataToUpdate);
};

export const deleteHobby = async (id) => {
  const hobbyRef = getWebsiteRef(`personal/hobbies/${id}`);
  await remove(hobbyRef);
};

export const updateHobbyOrder = async (id, order) => {
  const hobbyRef = getWebsiteRef(`personal/hobbies/${id}/order`);
  await set(hobbyRef, order);
};

// Get single hobby by slug
export const getHobbyBySlug = async (slug) => {
  try {
    const hobbiesRef = getWebsiteRef('personal/hobbies');
    const snapshot = await get(hobbiesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const hobbies = Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
      const hobby = hobbies.find(h => generateSlug(h.title) === slug);
      return hobby || null;
    }
    return null;
  } catch (error) {
    console.error('getHobbyBySlug failed:', error);
    return null;
  }
};

// Chess Journal
export const getChessJournalEntries = async () => {
  try {
    const journalRef = getWebsiteRef('personal/hobbies/chess/journal');
    const snapshot = await get(journalRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const items = Object.keys(data).map(id => ({
        id,
        ...data[id],
        createdAt: data[id].createdAt || parseInt(id.slice(-13)) || 0
      }));
      items.sort((a, b) => {
        // Sort by date (most recent first), then by createdAt if no date
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        if (aDate !== bDate) {
          return bDate - aDate; // Most recent first
        }
        // If dates are equal or both null, sort by createdAt
        return b.createdAt - a.createdAt;
      });
      return items;
    }
    return [];
  } catch (error) {
    console.error('getChessJournalEntries failed:', error);
    return [];
  }
};

export const addChessJournalEntry = async (data) => {
  const journalRef = getWebsiteRef('personal/hobbies/chess/journal');
  const newRef = push(journalRef);
  const dataToSave = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date || null,
    createdAt: Math.floor(Date.now() / 1000)
  };
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) delete dataToSave[key];
    if (dataToSave[key] === '') dataToSave[key] = null;
  });
  await set(newRef, dataToSave);
  return newRef.key;
};

export const updateChessJournalEntry = async (id, data) => {
  const entryRef = getWebsiteRef(`personal/hobbies/chess/journal/${id}`);
  const dataToUpdate = {
    ...data,
    date: dateStringToTimestamp(data.date) || data.date
  };
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === '') dataToUpdate[key] = null;
  });
  await set(entryRef, dataToUpdate);
};

export const deleteChessJournalEntry = async (id) => {
  const entryRef = getWebsiteRef(`personal/hobbies/chess/journal/${id}`);
  await remove(entryRef);
};

export const getChessJournalEntryBySlug = async (slug) => {
  try {
    const journalRef = getWebsiteRef('personal/hobbies/chess/journal');
    const snapshot = await get(journalRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const entries = Object.keys(data).map(id => ({
        id,
        ...data[id]
      }));
      const entry = entries.find(e => generateSlug(e.title) === slug);
      return entry || null;
    }
    return null;
  } catch (error) {
    console.error('getChessJournalEntryBySlug failed:', error);
    return null;
  }
};

// Export helper for components that need date conversion
export { timestampToDateString };
