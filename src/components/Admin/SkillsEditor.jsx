import { useState, useEffect } from 'react';
import { getSkills, addSkill, updateSkill, deleteSkill, updateSkillOrder } from '../../services/dataService';
import './ProfileEditor.css';

function SkillsEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 0
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
        percentage: parseInt(formData.percentage) || 0
      };
      
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
      percentage: item.percentage || 0
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
      percentage: 0
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <h4>{item.name} - {item.percentage}%</h4>
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

