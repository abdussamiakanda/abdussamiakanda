import { useState, useEffect } from 'react';
import { getTeaching, addTeaching, updateTeaching, deleteTeaching, updateTeachingOrder, timestampToDateString, getTeachingMetadata, updateTeachingMetadata } from '../../services/dataService';
import './ProfileEditor.css';

function TeachingEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    role: '',
    startDate: '',
    endDate: '',
    subjects: []
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState({ description: '', generalSubjects: [] });
  const [generalSubjectInput, setGeneralSubjectInput] = useState('');
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  useEffect(() => {
    loadItems();
    loadMetadata();
  }, []);

  const loadItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const data = await getTeaching();
      console.log('Loaded teaching items:', data);
      setItems(data || []);
    } catch (err) {
      console.error('Error loading teaching:', err);
      setError('Failed to load teaching items: ' + err.message);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const data = await getTeachingMetadata();
      setMetadata(data || { description: '', generalSubjects: [] });
    } catch (err) {
      console.error('Error loading metadata:', err);
      setMetadata({ description: '', generalSubjects: [] });
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleAddGeneralSubject = () => {
    if (generalSubjectInput.trim()) {
      setMetadata({
        ...metadata,
        generalSubjects: [...metadata.generalSubjects, generalSubjectInput.trim()]
      });
      setGeneralSubjectInput('');
    }
  };

  const handleRemoveGeneralSubject = (index) => {
    setMetadata({
      ...metadata,
      generalSubjects: metadata.generalSubjects.filter((_, i) => i !== index)
    });
  };

  const handleSaveMetadata = async () => {
    setLoading(true);
    try {
      await updateTeachingMetadata(metadata);
      alert('Metadata saved successfully!');
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Error saving metadata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    if (subjectInput.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectInput.trim()]
      });
      setSubjectInput('');
    }
  };

  const handleRemoveSubject = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for Realtime Database
      const dataToSave = {
        institution: formData.institution.trim(),
        role: formData.role.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        subjects: Array.isArray(formData.subjects) ? formData.subjects.filter(s => s.trim() !== '') : []
      };
      
      console.log('Saving teaching data:', dataToSave);

      if (editing) {
        await updateTeaching(editing.id, dataToSave);
      } else {
        await addTeaching(dataToSave);
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Error saving teaching:', error);
      alert('Error saving teaching: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      institution: item.institution || '',
      role: item.role || '',
      startDate: timestampToDateString(item.startDate),
      endDate: timestampToDateString(item.endDate),
      subjects: item.subjects || []
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteTeaching(id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting teaching:', error);
        alert('Error deleting teaching');
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      institution: '',
      role: '',
      startDate: '',
      endDate: '',
      subjects: []
    });
    setSubjectInput('');
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
          updateTeachingOrder(id, order)
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
      <h2>Manage Teaching Experience</h2>
      
      <div style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Teaching Section Metadata</h3>
        <div className="form-group">
          <label>General Description</label>
          <textarea
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            rows="3"
            placeholder="e.g., I have been teaching offline and online since my undergraduate first year."
          />
        </div>
        <div className="form-group">
          <label>General Subjects List</label>
          <div className="subject-input">
            <input
              type="text"
              value={generalSubjectInput}
              onChange={(e) => setGeneralSubjectInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGeneralSubject())}
              placeholder="Enter subject and press Enter"
            />
            <button type="button" onClick={handleAddGeneralSubject}>Add</button>
          </div>
          <div className="subjects-list">
            {metadata.generalSubjects.map((subject, index) => (
              <span key={index} className="subject-tag">
                {subject}
                <button type="button" onClick={() => handleRemoveGeneralSubject(index)}>×</button>
              </span>
            ))}
          </div>
        </div>
        <button type="button" onClick={handleSaveMetadata} disabled={loading || loadingMetadata} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save Metadata'}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label>Institution</label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date (leave empty if present)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Subjects</label>
          <div className="subject-input">
            <input
              type="text"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
              placeholder="Enter subject and press Enter"
            />
            <button type="button" onClick={handleAddSubject}>Add</button>
          </div>
          <div className="subjects-list">
            {formData.subjects.map((subject, index) => (
              <span key={index} className="subject-tag">
                {subject}
                <button type="button" onClick={() => handleRemoveSubject(index)}>×</button>
              </span>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : editing ? 'Update' : 'Add Teaching'}
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
            No items yet. Add your first teaching entry above.
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
              <h4>{item.institution} - {item.role}</h4>
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

export default TeachingEditor;

