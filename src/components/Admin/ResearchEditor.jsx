import { useState, useEffect } from 'react';
import { getResearch, addResearch, updateResearch, deleteResearch, updateResearchOrder, timestampToDateString, getResearchMetadata, updateResearchMetadata } from '../../services/dataService';
import { auth } from '../../firebase/config';
import './ProfileEditor.css';

function ResearchEditor() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    links: []
  });
  const [metadata, setMetadata] = useState({ profileLinks: [] });
  const [profileLinkInput, setProfileLinkInput] = useState({ label: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
    loadMetadata();
  }, []);

  const loadItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const data = await getResearch();
      console.log('Loaded research items:', data);
      setItems(data || []);
    } catch (err) {
      console.error('Error loading research:', err);
      setError('Failed to load research items: ' + err.message);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const data = await getResearchMetadata();
      setMetadata(data || { profileLinks: [] });
    } catch (err) {
      console.error('Error loading metadata:', err);
      setMetadata({ profileLinks: [] });
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleAddProfileLink = () => {
    if (profileLinkInput.label.trim() && profileLinkInput.url.trim()) {
      setMetadata({
        ...metadata,
        profileLinks: [...metadata.profileLinks, { label: profileLinkInput.label.trim(), url: profileLinkInput.url.trim() }]
      });
      setProfileLinkInput({ label: '', url: '' });
    }
  };

  const handleRemoveProfileLink = (index) => {
    setMetadata({
      ...metadata,
      profileLinks: metadata.profileLinks.filter((_, i) => i !== index)
    });
  };

  const handleSaveMetadata = async () => {
    setLoading(true);
    try {
      await updateResearchMetadata(metadata);
      alert('Metadata saved successfully!');
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Error saving metadata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check authentication first
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be logged in to save data. Please sign in again.');
        return;
      }
      console.log('User authenticated:', currentUser.email);

      // Prepare data for Realtime Database
      const dataToSave = {
        institution: formData.institution.trim(),
        role: formData.role.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description.trim() || null,
        links: Array.isArray(formData.links) ? formData.links : []
      };
      
      console.log('Saving research data:', dataToSave);

      console.log('Attempting save operation...');
      let saveResult;
      let saveSucceeded = false;
      
      try {
        if (editing) {
          console.log('Updating research item:', editing.id);
          await updateResearch(editing.id, dataToSave);
          saveResult = editing.id;
          saveSucceeded = true;
        } else {
          console.log('Adding new research item');
          saveResult = await addResearch(dataToSave);
          console.log('Save result (document ID):', saveResult);
          saveSucceeded = true;
        }
      } catch (saveError) {
        console.error('Save operation FAILED:', saveError);
        throw saveError; // Re-throw to be caught by outer catch
      }
      
      if (!saveSucceeded) {
        throw new Error('Save operation did not complete');
      }

      // Verify save succeeded - if we get here, save worked
      console.log('✅✅✅ SAVE OPERATION COMPLETED SUCCESSFULLY ✅✅✅');
      console.log('Document ID:', saveResult);
      console.log('Full path: website/research/' + saveResult);
      console.log('✅ The document has been saved to Realtime Database!');
      
      // Show success message with instructions
      alert('✅ Research saved successfully!\n\nDocument ID: ' + saveResult + '\n\nTo verify:\n1. Go to Firebase Console\n2. Open Realtime Database\n3. Navigate to: website/research/' + saveResult + '\n\nThe document should be there!');
      resetForm();
      
      // Reload immediately
      loadItems().catch(reloadError => {
        console.warn('Reload error (this is okay - data was saved):', reloadError.message);
        // Optimistically add the new item if it's a new entry
        setItems(prevItems => {
          if (!editing && saveResult) {
            return [{ id: saveResult, ...dataToSave }, ...prevItems];
          }
          return prevItems;
        });
      });
    } catch (error) {
      console.error('❌ ERROR SAVING RESEARCH:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Error saving research: ' + error.message;
      if (error.code === 'permission-denied') {
        errorMessage += '\n\nMake sure you are logged in and have write permissions.';
      } else if (error.code === 'unavailable') {
        errorMessage += '\n\nFirestore service is unavailable. Check your internet connection.';
      } else if (error.code === 'not-found') {
        errorMessage += '\n\nDatabase or collection not found. Check Firebase configuration.';
      }
      
      alert(errorMessage);
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
      description: item.description || '',
      links: item.links || []
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteResearch(id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting research:', error);
        alert('Error deleting research');
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
      description: '',
      links: []
    });
  };

  const handleDragStart = (e, index) => {
    e.stopPropagation();
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    const card = e.currentTarget.closest('.item-card');
    if (card) {
      // Create a custom drag image
      const dragImage = card.cloneNode(true);
      dragImage.style.width = card.offsetWidth + 'px';
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'rotate(2deg)';
      dragImage.style.boxShadow = '0 10px 30px rgba(0, 0, 255, 0.5)';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
      
      // Make the original card semi-transparent
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
    // Check if we're actually leaving the element
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
      // Reset opacity and transform
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
    
    // Remove dragged item
    newItems.splice(draggedItem, 1);
    
    // Calculate new index (accounting for removed item)
    let newIndex = dropIndex;
    if (draggedItem < dropIndex) {
      newIndex = dropIndex;
    }
    
    // Insert at new position
    newItems.splice(newIndex, 0, draggedItemData);
    
    // Update order for all items
    const updates = {};
    newItems.forEach((item, index) => {
      updates[item.id] = index;
    });

    // Reset opacity and transform
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = '';
    });

    // Optimistically update UI
    setItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);

    // Update order in database
    try {
      await Promise.all(
        Object.entries(updates).map(([id, order]) => 
          updateResearchOrder(id, order)
        )
      );
      // Reload to ensure sync
      await loadItems();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
      // Reload on error
      await loadItems();
    }
  };

  const handleDragEnd = (e) => {
    // Reset opacity and transform for all cards
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
      <h2>Manage Research</h2>
      
      <div style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Research Section Links</h3>
        
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label>Profile Links (Researchgate, Academia, Google Scholar, etc.)</label>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                value={profileLinkInput.label}
                onChange={(e) => setProfileLinkInput({ ...profileLinkInput, label: e.target.value })}
                placeholder="Label (e.g., Researchgate)"
              />
            </div>
            <div className="form-group">
              <input
                type="url"
                value={profileLinkInput.url}
                onChange={(e) => setProfileLinkInput({ ...profileLinkInput, url: e.target.value })}
                placeholder="URL"
              />
            </div>
            <button type="button" onClick={handleAddProfileLink} className="btn btn-secondary">Add</button>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {metadata.profileLinks.map((link, index) => (
              <span key={index} className="subject-tag">
                {link.label}
                <button type="button" onClick={() => handleRemoveProfileLink(index)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSaveMetadata} disabled={loading || loadingMetadata} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save Links'}
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
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : editing ? 'Update' : 'Add Research'}
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
            No items yet. Add your first research entry above.
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

export default ResearchEditor;

