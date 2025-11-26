import { useState, useEffect } from 'react';
import { getGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, updateGalleryItemOrder } from '../../services/dataService';
import './ProfileEditor.css';

function GalleryEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoadingItems(true);
    try {
      const data = await getGallery();
      setItems(data || []);
    } catch (err) { console.error('Error loading:', err); } finally { setLoadingItems(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await updateGalleryItem(editing.id, formData);
      else await addGalleryItem(formData);
      resetForm();
      await loadItems();
    } catch (error) { alert('Error: ' + error.message); } finally { setLoading(false); }
  };

  const handleEdit = (item) => { setEditing(item); setFormData({ title: item.title || '', imageUrl: item.imageUrl || '', description: item.description || '' }); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try { await deleteGalleryItem(id); await loadItems(); } catch (error) { alert('Error deleting'); }
    }
  };

  const resetForm = () => { setEditing(null); setFormData({ title: '', imageUrl: '', description: '' }); };

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
      dragImage.style.boxShadow = '0 10px 30px rgba(255, 0, 255, 0.5)';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
      setTimeout(() => { if (document.body.contains(dragImage)) document.body.removeChild(dragImage); }, 0);
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
    const newItems = [...items];
    const draggedItemData = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    let newIndex = dropIndex;
    if (draggedItem < dropIndex) newIndex = dropIndex;
    newItems.splice(newIndex, 0, draggedItemData);
    const updates = {};
    newItems.forEach((item, index) => { updates[item.id] = index; });
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
    setItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
    try {
      await Promise.all(Object.entries(updates).map(([id, order]) => updateGalleryItemOrder(id, order)));
      await loadItems();
    } catch (error) { alert('Failed to update order'); await loadItems(); }
  };

  const handleDragEnd = (e) => {
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="editor-container">
      <h2>Manage Gallery</h2>
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group"><label>Title (optional)</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
        <div className="form-group"><label>Image URL</label><input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required /></div>
        <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" /></div>
        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : editing ? 'Update' : 'Add Item'}</button>
        {editing && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
      </form>
      <div className="items-list">
        <h3>Gallery Items</h3>
        {loadingItems ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div> :
          items.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>No items yet.</div> :
            items.map((item, index) => (
              <div key={item.id} data-index={index} className={`item-card ${draggedItem === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <span className="drag-handle" draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd}>☰</span>
                <div style={{ flex: 1 }}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title || 'Gallery item'} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem' }} />}
                  <h4>{item.title || '(No title)'}</h4>
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

export default GalleryEditor;

