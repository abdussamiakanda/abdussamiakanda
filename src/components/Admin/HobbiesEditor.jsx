import { useState, useEffect } from 'react';
import { getHobbies, addHobby, updateHobby, deleteHobby, updateHobbyOrder } from '../../services/dataService';
import './ProfileEditor.css';

function HobbiesEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    emoji: '🎯',
    route: ''
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
      const data = await getHobbies();
      console.log('Loaded hobbies:', data);
      setItems(data || []);
    } catch (err) {
      console.error('Error loading hobbies:', err);
      setError('Failed to load hobbies: ' + err.message);
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
        emoji: formData.emoji.trim() || '🎯',
        route: formData.route.trim() || null
      };
      
      console.log('Saving hobby:', dataToSave);

      if (editing) {
        await updateHobby(editing.id, dataToSave);
      } else {
        await addHobby(dataToSave);
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Error saving hobby:', error);
      alert('Error saving hobby: ' + error.message);
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
      emoji: item.emoji || '🎯',
      route: item.route || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hobby?')) {
      return;
    }

    try {
      await deleteHobby(id);
      await loadItems();
    } catch (error) {
      console.error('Error deleting hobby:', error);
      alert('Error deleting hobby: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      emoji: '🎯',
      route: ''
    });
  };

  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItemData = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(dropIndex, 0, draggedItemData);

    setItems(newItems);

    // Update orders
    try {
      for (let i = 0; i < newItems.length; i++) {
        await updateHobbyOrder(newItems[i].id, i);
      }
      await loadItems();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order: ' + error.message);
      await loadItems();
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="editor-container">
      <h2 className="editor-title">Hobbies</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Chess"
          />
        </div>

        <div className="form-group">
          <label htmlFor="emoji">Emoji</label>
          <input
            type="text"
            id="emoji"
            value={formData.emoji}
            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
            placeholder="🎯"
            maxLength={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
            placeholder="Brief description of the hobby"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content (Markdown)</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="10"
            placeholder="Detailed content in Markdown format. This will be displayed on the hobby detail page."
          />
          <small>Supports Markdown and LaTeX. Use for detailed descriptions, rules, strategies, etc.</small>
        </div>

        <div className="form-group">
          <label htmlFor="route">Custom Route (optional)</label>
          <input
            type="text"
            id="route"
            value={formData.route}
            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
            placeholder="e.g., /hobbies/chess (leave empty for auto-generated)"
          />
          <small>If empty, route will be auto-generated from title</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editing ? 'Update Hobby' : 'Add Hobby'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        <h3 className="items-list-title">Hobbies ({items.length})</h3>
        {loadingItems ? (
          <div className="loading-message">Loading hobbies...</div>
        ) : items.length === 0 ? (
          <div className="empty-message">No hobbies yet. Add one above.</div>
        ) : (
          <div className="items-grid">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`item-card ${editing?.id === item.id ? 'editing' : ''} ${draggedItem === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="item-header">
                  <div className="item-emoji">{item.emoji || '🎯'}</div>
                  <div className="item-title">{item.title}</div>
                </div>
                {item.description && (
                  <div className="item-description">{item.description}</div>
                )}
                <div className="item-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-small btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HobbiesEditor;

