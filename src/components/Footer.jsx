import { useEffect, useState } from 'react';
import { getProfile } from '../services/dataService';
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaFilePdf,
  FaOrcid,
  FaResearchgate,
  FaMedium,
  FaBlog,
  FaStackOverflow,
  FaGraduationCap
} from 'react-icons/fa';
import { SiGooglescholar, SiArxiv, SiDblp, SiSemanticscholar, SiX } from 'react-icons/si';
import './Footer.css';

function Footer() {
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      if (data?.socialLinks && Array.isArray(data.socialLinks)) {
        const links = data.socialLinks.filter(link => link.platform && link.url);
        setSocialLinks(links);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const getIcon = (platform) => {
    if (!platform) return <FaGlobe />;
    
    const platformLower = platform.toLowerCase().trim();
    const iconStyle = { fontSize: '1.2rem' };
    
    const icons = {
      github: <FaGithub style={iconStyle} />,
      'google scholar': <SiGooglescholar style={iconStyle} />,
      'googlescholar': <SiGooglescholar style={iconStyle} />,
      scholar: <SiGooglescholar style={iconStyle} />,
      linkedin: <FaLinkedin style={iconStyle} />,
      twitter: <FaTwitter style={iconStyle} />,
      'twitter/x': <SiX style={iconStyle} />,
      x: <SiX style={iconStyle} />,
      email: <FaEnvelope style={iconStyle} />,
      'e-mail': <FaEnvelope style={iconStyle} />,
      mail: <FaEnvelope style={iconStyle} />,
      orcid: <FaOrcid style={iconStyle} />,
      researchgate: <FaResearchgate style={iconStyle} />,
      'research gate': <FaResearchgate style={iconStyle} />,
      website: <FaGlobe style={iconStyle} />,
      facebook: <FaFacebook style={iconStyle} />,
      instagram: <FaInstagram style={iconStyle} />,
      youtube: <FaYoutube style={iconStyle} />,
      cv: <FaFilePdf style={iconStyle} />,
      'cv/resume': <FaFilePdf style={iconStyle} />,
      resume: <FaFilePdf style={iconStyle} />,
      dblp: <SiDblp style={iconStyle} />,
      arxiv: <SiArxiv style={iconStyle} />,
      semantic: <SiSemanticscholar style={iconStyle} />,
      'semantic scholar': <SiSemanticscholar style={iconStyle} />,
      medium: <FaMedium style={iconStyle} />,
      blog: <FaBlog style={iconStyle} />,
      stackoverflow: <FaStackOverflow style={iconStyle} />,
      'stack overflow': <FaStackOverflow style={iconStyle} />,
      academic: <FaGraduationCap style={iconStyle} />
    };
    
    // Try exact match first
    if (icons[platformLower]) {
      return icons[platformLower];
    }
    
    // Try partial matches
    for (const key in icons) {
      if (platformLower.includes(key) || key.includes(platformLower)) {
        return icons[key];
      }
    }
    
    return <FaGlobe style={iconStyle} />; // Default icon
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {socialLinks.length > 0 ? (
          <div className="footer-social">
            {socialLinks.map((link, index) => {
              const icon = getIcon(link.platform);
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={link.platform}
                >
                  <span className="social-icon" role="img" aria-label={link.platform}>
                    {icon || <FaGlobe />}
                  </span>
                  <span className="social-label">{link.platform}</span>
                </a>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="social-icon"><FaGlobe /></span>
            <span>No social links configured. Add them in Admin → Profile.</span>
          </div>
        )}
        <p className="footer-copyright">
          Copyright © {new Date().getFullYear()} {profile?.name || 'Md Abdus Sami Akanda'}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

