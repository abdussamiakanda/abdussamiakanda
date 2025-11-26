import { useState, useEffect } from 'react';
import { getNotes, addNote, updateNote, deleteNote, updateNoteOrder } from '../../services/dataService';
import './ProfileEditor.css';

function NotesEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    date: '',
    url: ''
  });
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
      const data = await getNotes();
      console.log('Loaded notes:', data);
      setItems(data || []);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes: ' + err.message);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim() || null,
        date: formData.date || null,
        url: formData.url.trim() || null
      };

      console.log('Saving note data:', dataToSave);

      if (editing) {
        await updateNote(editing.id, dataToSave);
      } else {
        await addNote(dataToSave);
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      content: item.content || '',
      date: item.date ? (typeof item.date === 'number' ? new Date(item.date * 1000).toISOString().split('T')[0] : item.date) : '',
      url: item.url || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note');
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      date: '',
      url: ''
    });
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
          updateNoteOrder(id, order)
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
      <h2>Manage Notes</h2>
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description (Brief summary)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="2"
            placeholder="Brief description/summary"
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Content (Markdown with LaTeX support)</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="15"
            placeholder="Write your note content in Markdown. Use $...$ for inline LaTeX and $$...$$ for block LaTeX."
            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
          />
          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
            Supports Markdown and LaTeX. Use $...$ for inline math and $$...$$ for block equations.
          </small>
        </div>
        <div className="form-group">
          <label>URL (Optional - external link)</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : editing ? 'Update' : 'Add Note'}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </form>

      <div className="items-list">
        <h3>Existing Notes</h3>
        {loadingItems ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading notes...
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem' }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No notes yet. Add your first note above.
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
              <h4>{item.title}</h4>
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

export default NotesEditor;

