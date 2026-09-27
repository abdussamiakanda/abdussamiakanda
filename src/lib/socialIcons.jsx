import {
  FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaGlobe, FaFacebook, FaInstagram, FaYoutube,
  FaFilePdf, FaOrcid, FaResearchgate, FaMedium, FaBlog, FaStackOverflow, FaGraduationCap, FaSoundcloud,
} from 'react-icons/fa';
import { SiGooglescholar, SiArxiv, SiDblp, SiSemanticscholar, SiX, SiAcademia } from 'react-icons/si';

const ICONS = {
  github: FaGithub,
  'google scholar': SiGooglescholar,
  googlescholar: SiGooglescholar,
  scholar: SiGooglescholar,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  'twitter/x': SiX,
  x: SiX,
  email: FaEnvelope,
  'e-mail': FaEnvelope,
  mail: FaEnvelope,
  orcid: FaOrcid,
  researchgate: FaResearchgate,
  'research gate': FaResearchgate,
  academia: SiAcademia,
  website: FaGlobe,
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  soundcloud: FaSoundcloud,
  cv: FaFilePdf,
  resume: FaFilePdf,
  dblp: SiDblp,
  arxiv: SiArxiv,
  'semantic scholar': SiSemanticscholar,
  semantic: SiSemanticscholar,
  medium: FaMedium,
  blog: FaBlog,
  stackoverflow: FaStackOverflow,
  'stack overflow': FaStackOverflow,
  academic: FaGraduationCap,
};

export function getSocialIcon(platform = '') {
  const key = platform.toLowerCase().trim();
  if (ICONS[key]) return ICONS[key];
  const partial = Object.keys(ICONS).find((k) => key.includes(k) || k.includes(key));
  return partial ? ICONS[partial] : FaGlobe;
}

// Academic profiles first, then the rest — used to order icon rows.
const ACADEMIC = ['email', 'google scholar', 'orcid', 'researchgate', 'academia'];
export const isAcademicLink = (platform = '') => ACADEMIC.includes(platform.toLowerCase().trim());
