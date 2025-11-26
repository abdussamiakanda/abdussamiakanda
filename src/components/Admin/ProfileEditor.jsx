import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../services/dataService';
import './ProfileEditor.css';

function ProfileEditor() {
  const [profile, setProfile] = useState({ name: '', greeting: '', description: '', cvUrl: '', resumeUrl: '', socialLinks: [] });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Profile doesn't exist yet, that's okay
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      // Prepare data for Realtime Database
      const dataToSave = {
        name: (profile.name || '').trim(),
        greeting: (profile.greeting || '').trim() || null,
        description: (profile.description || '').trim(),
        cvUrl: (profile.cvUrl || '').trim() || null,
        resumeUrl: (profile.resumeUrl || '').trim() || null,
        socialLinks: profile.socialLinks?.filter(link => link.platform && link.url) || null
      };

      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) delete dataToSave[key];
        if (dataToSave[key] === '') dataToSave[key] = null;
      });
      
      console.log('Saving profile data:', dataToSave);

      await updateProfile(dataToSave);
      console.log('Profile saved successfully');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Greeting</label>
          <input
            type="text"
            value={profile.greeting || ''}
            onChange={(e) => setProfile({ ...profile, greeting: e.target.value })}
            placeholder="e.g., Hi, my name is"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            rows="5"
            required
          />
        </div>
        <div className="form-group">
          <label>CV URL</label>
          <input
            type="url"
            value={profile.cvUrl || ''}
            onChange={(e) => setProfile({ ...profile, cvUrl: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Resume URL</label>
          <input
            type="url"
            value={profile.resumeUrl || ''}
            onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>Social Media Links</label>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder="Platform (e.g., GitHub, LinkedIn, Twitter)"
                value={newSocialLink.platform}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                type="url"
                placeholder="URL"
                value={newSocialLink.url}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                style={{ flex: 2 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSocialLink.platform && newSocialLink.url) {
                    setProfile({
                      ...profile,
                      socialLinks: [...(profile.socialLinks || []), { ...newSocialLink }]
                    });
                    setNewSocialLink({ platform: '', url: '' });
                  }
                }}
                className="btn btn-small"
              >
                Add
              </button>
            </div>
            {(profile.socialLinks || []).map((link, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '4px' }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{link.platform}</span>
                <span style={{ flex: 2, fontSize: '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.url}</span>
                <button
                  type="button"
                  onClick={() => {
                    setProfile({
                      ...profile,
                      socialLinks: profile.socialLinks.filter((_, i) => i !== index)
                    });
                  }}
                  className="btn btn-small btn-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
        {saved && <span className="success-message">Saved successfully!</span>}
      </form>
    </div>
  );
}

export default ProfileEditor;

