import { useState, useEffect } from 'react';
import { getPersonalProjects, addPersonalProject, updatePersonalProject, deletePersonalProject, updatePersonalProjectOrder, timestampToDateString } from '../../services/dataService';
import './ProfileEditor.css';

function PersonalProjectsEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    technologies: [],
    startDate: '',
    endDate: '',
    website: '',
    demo: '',
    github: ''
  });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const data = await getPersonalProjects();
      console.log('Loaded personal projects:', data);
      setItems(data || []);
    } catch (err) {
      console.error('Error loading personal projects:', err);
      setError('Failed to load personal projects: ' + err.message);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (index) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        overview: formData.overview.trim() || null,
        technologies: Array.isArray(formData.technologies) ? formData.technologies.filter(t => t.trim() !== '') : [],
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        website: formData.website.trim() || null,
        demo: formData.demo.trim() || null,
        github: formData.github.trim() || null
      };
      
      console.log('Saving personal project:', dataToSave);

      if (editing) {
        await updatePersonalProject(editing.id, dataToSave);
      } else {
        await addPersonalProject(dataToSave);
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Error saving personal project:', error);
      alert('Error saving personal project: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      overview: item.overview || '',
      technologies: item.technologies || [],
      startDate: timestampToDateString(item.startDate),
      endDate: timestampToDateString(item.endDate),
      website: item.website || '',
      demo: item.demo || '',
      github: item.github || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deletePersonalProject(id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting personal project:', error);
        alert('Error deleting personal project');
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      overview: '',
      technologies: [],
      startDate: '',
      endDate: '',
      website: '',
      demo: '',
      github: ''
    });
    setTechInput('');
  };

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
      dragImage.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.5)';
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
          updatePersonalProjectOrder(id, order)
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
      <h2>Manage Personal Projects</h2>
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label>Project Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
            placeholder="Short description of the project"
          />
        </div>
        <div className="form-group">
          <label>Case Study Overview (Markdown)</label>
          <textarea
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            rows="12"
            placeholder="Write a detailed case study in Markdown format. This will be displayed on the case study page. Leave empty if this project doesn't have a case study."
            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
          />
          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
            Projects with overview content will have a case study page accessible at /projects/case/[project-name]
          </small>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date (leave empty if ongoing)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Technologies Used</label>
          <div className="subject-input">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              placeholder="Enter technology and press Enter"
            />
            <button type="button" onClick={handleAddTech}>Add</button>
          </div>
          <div className="subjects-list">
            {formData.technologies.map((tech, index) => (
              <span key={index} className="subject-tag">
                {tech}
                <button type="button" onClick={() => handleRemoveTech(index)}>×</button>
              </span>
            ))}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div className="form-group">
            <label>Demo (HTML file name)</label>
            <input
              type="text"
              value={formData.demo}
              onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
              placeholder="dino (for /demo/dino)"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>GitHub URL</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/user/repo"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : editing ? 'Update' : 'Add Project'}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </form>

      <div className="items-list">
        <h3>Existing Projects</h3>
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
            No projects yet. Add your first personal project above.
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
              <h4>
                {item.title}
                {item.overview && (
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.75rem', 
                    color: 'var(--primary-color)',
                    fontWeight: 'normal'
                  }}>
                    (Case Study)
                  </span>
                )}
              </h4>
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

export default PersonalProjectsEditor;

