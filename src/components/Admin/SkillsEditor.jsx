import { useState, useEffect, useRef } from 'react';
import { getSkills, addSkill, updateSkill, deleteSkill, updateSkillOrder } from '../../services/dataService';
import './ProfileEditor.css';

function SkillsEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 0,
    logo: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const data = await getSkills();
      console.log('Loaded skills items:', data);
      setItems(data || []);
    } catch (err) {
      console.error('Error loading skills:', err);
      setError('Failed to load skills items: ' + err.message);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for Realtime Database
      const dataToSave = {
        name: formData.name.trim(),
        percentage: parseInt(formData.percentage) || 0,
        logo: formData.logo.trim() || null
      };
      
      // Remove null/empty logo
      if (!dataToSave.logo) {
        delete dataToSave.logo;
      }
      
      console.log('Saving skill data:', dataToSave);

      if (editing) {
        await updateSkill(editing.id, dataToSave);
      } else {
        await addSkill(dataToSave);
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Error saving skill: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name || '',
      percentage: item.percentage || 0,
      logo: item.logo || item.icon || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteSkill(id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Error deleting skill');
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: '',
      percentage: 0,
      logo: ''
    });
  };

  // Mapping of common skill names to Simple Icons names
  const iconNameMap = {
    'c programming': 'c',
    'c++': 'cplusplus',
    'c#': 'csharp',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'html': 'html5',
    'css': 'css3',
    'react': 'react',
    'react.js': 'react',
    'reactjs': 'react',
    'vue': 'vuedotjs',
    'vue.js': 'vuedotjs',
    'angular': 'angular',
    'node.js': 'nodedotjs',
    'nodejs': 'nodedotjs',
    'express': 'express',
    'flask': 'flask',
    'django': 'django',
    'firebase': 'firebase',
    'supabase': 'supabase',
    'mongodb': 'mongodb',
    'postgresql': 'postgresql',
    'mysql': 'mysql',
    'git': 'git',
    'github': 'github',
    'gitlab': 'gitlab',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'aws': 'amazonaws',
    'azure': 'microsoftazure',
    'gcp': 'googlecloud',
    'blender': 'blender',
    'latex': 'latex',
    'originpro': 'origin',
    'mumax3': 'max',
  };

  // Normalize skill name to icon name format
  const normalizeIconName = (name) => {
    const lowerName = name.toLowerCase().trim();
    
    // Check mapping first
    if (iconNameMap[lowerName]) {
      return iconNameMap[lowerName];
    }
    
    // Try variations
    const variations = [
      lowerName.replace(/\.js$/, '').replace(/\./g, '').replace(/\s+/g, ''),
      lowerName.replace(/\s+/g, ''),
      lowerName.replace(/\s+/g, '-'),
      lowerName.replace(/\./g, '').replace(/\s+/g, ''),
      lowerName.replace(/\.js$/, '').replace(/\s+/g, ''),
      lowerName.replace(/\s+/g, '').replace(/programming$/, ''),
    ];
    
    return variations[0]; // Return first variation as default
  };

  // Check if SVG/image URL exists by loading it
  const checkImageExists = (url) => {
    return new Promise((resolve) => {
      // For Simple Icons, we need to fetch the SVG
      fetch(url, { 
        method: 'GET',
        mode: 'no-cors' // This allows the request but we can't read the response
      })
      .then(() => {
        // If no error, assume it exists (no-cors mode)
        // Try loading as image to verify
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        setTimeout(() => resolve(false), 2000);
      })
      .catch(() => resolve(false));
    });
  };

  // Fetch logo automatically from Simple Icons
  const fetchLogo = async (skillName) => {
    if (!skillName || skillName.trim() === '') return;
    
    setLoadingLogo(true);
    try {
      const lowerName = skillName.toLowerCase().trim();
      
      // Try mapped name first
      let iconName = iconNameMap[lowerName];
      
      // If no mapping, try normalized name
      if (!iconName) {
        iconName = normalizeIconName(skillName);
      }
      
      // Try multiple variations
      const variations = [
        iconName,
        lowerName.replace(/\.js$/, '').replace(/\./g, '').replace(/\s+/g, ''),
        lowerName.replace(/\s+/g, ''),
        lowerName.replace(/\s+/g, '-'),
        lowerName.replace(/\./g, '').replace(/\s+/g, ''),
        lowerName.replace(/\.js$/, '').replace(/\s+/g, ''),
      ];

      // Remove duplicates
      const uniqueVariations = [...new Set(variations.filter(v => v))];

      for (const variation of uniqueVariations) {
        // Simple Icons CDN URL
        const simpleIconsUrl = `https://cdn.simpleicons.org/${variation}`;
        
        // Try to load the image (suppress console errors)
        try {
          const img = new Image();
          const loadPromise = new Promise((resolve) => {
            let resolved = false;
            img.onload = () => {
              if (!resolved) {
                resolved = true;
                resolve(true);
              }
            };
            img.onerror = () => {
              if (!resolved) {
                resolved = true;
                resolve(false);
              }
            };
            // Set a timeout
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                resolve(false);
              }
            }, 2000);
            
            // Start loading
            img.src = simpleIconsUrl;
          });
          
          const exists = await loadPromise;
          if (exists) {
            setFormData(prev => ({ ...prev, logo: simpleIconsUrl }));
            setLoadingLogo(false);
            return;
          }
        } catch (e) {
          // Silently continue to next variation
          continue;
        }
      }

      // If no logo found, show message
      setLoadingLogo(false);
      alert('Logo not found. You can manually enter a logo URL.');
    } catch (error) {
      console.error('Error fetching logo:', error);
      setLoadingLogo(false);
    }
  };

  // Auto-fetch logo when name changes (debounced)
  const fetchTimeoutRef = useRef(null);
  
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({ ...formData, name: newName });
    
    // Clear previous timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Auto-fetch logo if name is being entered (not editing existing) and no logo set
    if (!editing && newName.length > 2 && !formData.logo) {
      fetchTimeoutRef.current = setTimeout(() => {
        fetchLogo(newName);
      }, 800);
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleDragStart = (e, index) => {
    e.stopPropagation();
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    const card = e.currentTarget.closest('.item-card');
    if (card) {
      const dragImage = card.cloneNode(true);
      dragImage.style.width = card.offsetWidth + 'px';
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'rotate(2deg)';
      dragImage.style.boxShadow = '0 10px 30px rgba(0, 240, 255, 0.5)';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
      
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
      
      card.style.opacity = '0.3';
      card.style.transform = 'scale(0.98)';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem === null) return;
    const cardIndex = parseInt(e.currentTarget.dataset.index);
    if (cardIndex !== draggedItem) {
      setDragOverIndex(cardIndex);
    }
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropIndex = parseInt(e.currentTarget.dataset.index);
    
    if (draggedItem === null || draggedItem === dropIndex) {
      const cards = document.querySelectorAll('.item-card');
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = '';
      });
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItemData = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    let newIndex = dropIndex;
    if (draggedItem < dropIndex) {
      newIndex = dropIndex;
    }
    newItems.splice(newIndex, 0, draggedItemData);
    
    const updates = {};
    newItems.forEach((item, index) => {
      updates[item.id] = index;
    });

    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = '';
    });
    setItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);

    try {
      await Promise.all(
        Object.entries(updates).map(([id, order]) => 
          updateSkillOrder(id, order)
        )
      );
      await loadItems();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
      await loadItems();
    }
  };

  const handleDragEnd = (e) => {
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = '';
    });
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="editor-container">
      <h2>Manage Skills</h2>
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label>Skill Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Percentage (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>
            Logo URL
            <button
              type="button"
              onClick={() => fetchLogo(formData.name)}
              disabled={loadingLogo || !formData.name}
              style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loadingLogo || !formData.name ? 'not-allowed' : 'pointer',
                opacity: loadingLogo || !formData.name ? 0.6 : 1
              }}
            >
              {loadingLogo ? 'Fetching...' : 'Auto-fetch'}
            </button>
          </label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://cdn.simpleicons.org/react or leave empty"
          />
          {formData.logo && (
            <div style={{ marginTop: '0.5rem' }}>
              <img
                src={formData.logo}
                alt="Logo preview"
                style={{
                  maxWidth: '50px',
                  maxHeight: '50px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '4px',
                  padding: '4px',
                  background: 'white'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : editing ? 'Update' : 'Add Skill'}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </form>

      <div className="items-list">
        <h3>Existing Items</h3>
        {loadingItems ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading items...
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem' }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No items yet. Add your first skill above.
          </div>
        ) : (
          items.map((item, index) => (
            <div 
              key={item.id} 
              data-index={index}
              className={`item-card ${draggedItem === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <span 
                className="drag-handle"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
              >☰</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {item.logo || item.icon ? (
                  <img
                    src={item.logo || item.icon}
                    alt={item.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                <h4>{item.name} - {item.percentage}%</h4>
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(item)} className="btn btn-small">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="btn btn-small btn-danger">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SkillsEditor;

