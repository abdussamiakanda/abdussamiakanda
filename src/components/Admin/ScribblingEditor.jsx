import { useState, useEffect } from 'react';
import { getScribblingEntries, addScribblingEntry, updateScribblingEntry, deleteScribblingEntry, updateScribblingEntryOrder, timestampToDateString } from '../../services/dataService';
import './ProfileEditor.css';

function ScribblingEditor() {
  const [entries, setEntries] = useState([]);
  const [activeTag, setActiveTag] = useState('all');
  const [tags, setTags] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({ title: '', englishTitle: '', date: '', description: '', content: '', tag: 'poems' });
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTag]);

  const loadData = async () => {
    setLoadingItems(true);
    try {
      const allEntries = await getScribblingEntries();
      const uniqueTags = [...new Set(allEntries.map(e => e.tag).filter(Boolean))];
      setTags(uniqueTags);
      
      const filtered = activeTag === 'all' ? allEntries : allEntries.filter(e => e.tag === activeTag);
      setEntries(filtered || []);
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await updateScribblingEntry(editing.id, formData);
      else await addScribblingEntry(formData);
      resetForm();
      await loadData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      title: item.title || '',
      englishTitle: item.englishTitle || '',
      date: timestampToDateString(item.date) || '',
      description: item.description || '',
      content: item.content || '',
      tag: item.tag || 'poems'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await deleteScribblingEntry(id);
        await loadData();
      } catch (error) {
        alert('Error deleting');
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ title: '', englishTitle: '', date: '', description: '', content: '', tag: 'poems' });
  };

  const handleDragStart = (e, index) => {
    e.stopPropagation();
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
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
        if (document.body.contains(dragImage)) document.body.removeChild(dragImage);
      }, 0);
      card.style.opacity = '0.3';
      card.style.transform = 'scale(0.98)';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (draggedItem === null) return;
    const cardIndex = parseInt(e.currentTarget.dataset.index);
    if (cardIndex !== draggedItem) setDragOverIndex(cardIndex);
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const dropIndex = parseInt(e.currentTarget.dataset.index);
    if (draggedItem === null || draggedItem === dropIndex) {
      const cards = document.querySelectorAll('.item-card');
      cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }
    const newEntries = [...entries];
    const draggedItemData = newEntries[draggedItem];
    newEntries.splice(draggedItem, 1);
    let newIndex = dropIndex;
    if (draggedItem < dropIndex) newIndex = dropIndex;
    newEntries.splice(newIndex, 0, draggedItemData);
    const updates = {};
    newEntries.forEach((item, index) => { updates[item.id] = index; });
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
    setEntries(newEntries);
    setDraggedItem(null);
    setDragOverIndex(null);
    try {
      await Promise.all(Object.entries(updates).map(([id, order]) => updateScribblingEntryOrder(id, order)));
      await loadData();
    } catch (error) {
      alert('Failed to update order');
      await loadData();
    }
  };

  const handleDragEnd = (e) => {
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="editor-container">
      <h2>Manage Scribbling</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <button type="button" className={`admin-tab ${activeTag === 'all' ? 'active' : ''}`} onClick={() => { setActiveTag('all'); setEditing(null); resetForm(); }} style={{ padding: '0.75rem 1.5rem' }}>All</button>
        {tags.map(tag => (
          <button key={tag} type="button" className={`admin-tab ${activeTag === tag ? 'active' : ''}`} onClick={() => { setActiveTag(tag); setEditing(null); resetForm(); }} style={{ padding: '0.75rem 1.5rem' }}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label>Tag</label>
          <select value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} required>
            <option value="poems">Poems</option>
            <option value="stories">Stories</option>
            <option value="drawings">Drawings</option>
          </select>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>English Title (optional, for URL if main title is not English)</label>
          <input type="text" value={formData.englishTitle} onChange={(e) => setFormData({ ...formData, englishTitle: e.target.value })} placeholder="Used for generating URL slug" />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
        </div>
        <div className="form-group">
          <label>Content (Markdown with LaTeX supported)</label>
          <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="10" placeholder="Write your content in Markdown. Use $$ for LaTeX equations." />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : editing ? 'Update' : 'Add Entry'}
        </button>
        {editing && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
      </form>

      <div className="items-list">
        <h3>{activeTag === 'all' ? 'All Entries' : activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}</h3>
        {loadingItems ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div> :
          entries.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>No entries yet.</div> :
            entries.map((item, index) => (
              <div key={item.id} data-index={index} className={`item-card ${draggedItem === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <span className="drag-handle" draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd}>☰</span>
                <div style={{ flex: 1 }}>
                  <h4>{item.title}</h4>
                  {item.tag && <span style={{ fontSize: '0.875rem', color: 'var(--primary-color)', marginLeft: '0.5rem' }}>[{item.tag}]</span>}
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEdit(item)} className="btn btn-small">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-small btn-danger">Delete</button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default ScribblingEditor;
