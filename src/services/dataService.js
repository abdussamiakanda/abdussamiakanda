// Read-only access to the site's content, which lives in src/data/*.json and
// ships with the build. Edit those files to change what the site shows.
//
// The getters stay async so pages can keep loading through useAsync; nothing
// here touches the network or browser storage.
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
import developerJson from '../data/developer.json';
import scribblingJson from '../data/scribbling.json';
import curationsJson from '../data/curations.json';
import galleryJson from '../data/gallery.json';
import postsJson from '../data/posts.json';
import hobbiesJson from '../data/hobbies.json';
import chessJournalJson from '../data/chessJournal.json';
import { generateSlug, getSlugTitle } from '../lib/slug';

export { generateSlug, getSlugTitle };

const hasOrder = (item) => item.order !== undefined && item.order !== null;

// Explicit `order` first, then newest `createdAt`, then the optional
// `dateField`, newest first.
const byOrder = (dateField) => (a, b) => {
  if (hasOrder(a) && hasOrder(b)) return a.order - b.order;
  if (hasOrder(a)) return -1;
  if (hasOrder(b)) return 1;
  const created = (b.createdAt || 0) - (a.createdAt || 0);
  if (created !== 0 || !dateField) return created;
  return (b[dateField] || 0) - (a[dateField] || 0);
};

// Newest `date` first, then newest `createdAt`.
const byDate = (a, b) => (b.date || 0) - (a.date || 0) || (b.createdAt || 0) - (a.createdAt || 0);

const sorted = (items, compare) => [...items].sort(compare);

// Unix seconds, or a date string from older entries.
const toSeconds = (value) => (typeof value === 'number' ? value : new Date(value).getTime() / 1000);
const hasEnd = (p) => p.endDate != null && p.endDate !== '' && p.endDate !== 0;

// Ordered projects first, then ongoing ones (latest start first), then
// finished ones (latest end first).
const byProject = (a, b) => {
  if (hasOrder(a) && hasOrder(b)) return a.order - b.order;
  if (hasOrder(a)) return -1;
  if (hasOrder(b)) return 1;
  if (!hasEnd(a) && !hasEnd(b)) return (b.startDate ? toSeconds(b.startDate) : 0) - (a.startDate ? toSeconds(a.startDate) : 0);
  if (!hasEnd(a)) return -1;
  if (!hasEnd(b)) return 1;
  return toSeconds(b.endDate) - toSeconds(a.endDate);
};

export const getProfile = async () => profileJson;
export const getResearchMetadata = async () => researchMetadataJson;
export const getTeachingMetadata = async () => teachingMetadataJson;

export const getResearch = async () => sorted(researchJson, byOrder('startDate'));
export const getTeaching = async () => sorted(teachingJson, byOrder('startDate'));
export const getEducation = async () => sorted(educationJson, byOrder('startDate'));
export const getActivities = async () => sorted(activitiesJson, byOrder('startDate'));
export const getAwards = async () => sorted(awardsJson, byOrder('date'));
export const getPublications = async () => sorted(publicationsJson, byOrder());
export const getSpeeches = async () => sorted(speechesJson, byOrder());
export const getCourses = async () => sorted(coursesJson, byOrder());
export const getSkills = async () => sorted(skillsJson, byOrder());
export const getGallery = async () => sorted(galleryJson, byOrder());
export const getHobbies = async () => sorted(hobbiesJson, byOrder());
export const getPersonalProjects = async () => sorted(personalProjectsJson, byProject);

export const getNotes = async () => sorted(notesJson, byDate);
export const getPosts = async () => sorted(postsJson, byDate);
export const getChessJournalEntries = async () => sorted(chessJournalJson, byDate);

export const getScribblingEntries = async (tag = null) =>
  sorted(
    scribblingJson.filter((item) => !tag || item.tag === tag),
    byDate,
  );

export const getCurationsEntries = async (tag = null) =>
  sorted(
    curationsJson.filter((item) => !tag || item.tag === tag),
    byOrder(),
  );

// Software I have built: { intro, github, stack, categories, projects }.
export const getDeveloper = async () => developerJson;
export const getDeveloperProject = async (slug) => developerJson.projects.find((p) => p.slug === slug) || null;

export const getNoteBySlug = async (slug) => (await getNotes()).find((n) => generateSlug(n.title) === slug) || null;
export const getPostBySlug = async (slug) => (await getPosts()).find((p) => generateSlug(getSlugTitle(p)) === slug) || null;
export const getScribblingBySlug = async (slug) =>
  (await getScribblingEntries()).find((e) => generateSlug(getSlugTitle(e)) === slug) || null;
