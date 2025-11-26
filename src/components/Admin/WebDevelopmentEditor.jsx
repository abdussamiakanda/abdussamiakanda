import { useState, useEffect } from 'react';
import { getWebDevelopment, updateWebDevelopment, getWebDevProjects, addWebDevProject, updateWebDevProject, deleteWebDevProject, updateWebDevProjectOrder } from '../../services/dataService';
import './ProfileEditor.css';

function WebDevelopmentEditor() {
  const [webDev, setWebDev] = useState({ description: '' });
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', url: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoadingItems(true);
    try {
      const [webDevData, projectsData] = await Promise.all([getWebDevelopment(), getWebDevProjects()]);
      if (webDevData) setWebDev(webDevData);
      setProjects(projectsData || []);
    } catch (err) { console.error('Error loading:', err); } finally { setLoadingItems(false); }
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateWebDevelopment({ description: webDev.description.trim() });
      alert('Saved!');
    } catch (error) { alert('Error: ' + error.message); } finally { setLoading(false); }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await updateWebDevProject(editing.id, projectForm);
      else await addWebDevProject(projectForm);
      setProjectForm({ name: '', url: '', description: '' });
      setEditing(null);
      await loadData();
    } catch (error) { alert('Error: ' + error.message); } finally { setLoading(false); }
  };

  const handleEdit = (project) => { setEditing(project); setProjectForm({ name: project.name || '', url: project.url || '', description: project.description || '' }); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try { await deleteWebDevProject(id); await loadData(); } catch (error) { alert('Error deleting'); }
    }
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
    const newProjects = [...projects];
    const draggedItemData = newProjects[draggedItem];
    newProjects.splice(draggedItem, 1);
    let newIndex = dropIndex;
    if (draggedItem < dropIndex) newIndex = dropIndex;
    newProjects.splice(newIndex, 0, draggedItemData);
    const updates = {};
    newProjects.forEach((item, index) => { updates[item.id] = index; });
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
    setProjects(newProjects);
    setDraggedItem(null);
    setDragOverIndex(null);
    try {
      await Promise.all(Object.entries(updates).map(([id, order]) => updateWebDevProjectOrder(id, order)));
      await loadData();
    } catch (error) { alert('Failed to update order'); await loadData(); }
  };

  const handleDragEnd = (e) => {
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = ''; });
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="editor-container">
      <h2>Manage Web Development Section</h2>
      <form onSubmit={handleMainSubmit} className="editor-form">
        <div className="form-group">
          <label>Description</label>
          <textarea value={webDev.description} onChange={(e) => setWebDev({ ...webDev, description: e.target.value })} rows="4" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">Save Main Content</button>
      </form>
      <div className="items-list" style={{ marginTop: '3rem' }}>
        <h3>Web Development Projects</h3>
        <form onSubmit={handleProjectSubmit} className="editor-form">
          <div className="form-row">
            <div className="form-group"><label>Project Name</label><input type="text" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required /></div>
            <div className="form-group"><label>Project URL</label><input type="url" value={projectForm.url} onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })} required /></div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              rows="3"
              placeholder="Optional project description..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : editing ? 'Update' : 'Add Project'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setProjectForm({ name: '', url: '', description: '' }); }} className="btn btn-secondary">Cancel</button>}
        </form>
        {loadingItems ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div> :
          projects.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>No projects yet.</div> :
            projects.map((project, index) => (
              <div key={project.id} data-index={index} className={`item-card ${draggedItem === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <span className="drag-handle" draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd}>☰</span>
                <h4>{project.name}</h4>
                <div className="item-actions">
                  <button onClick={() => handleEdit(project)} className="btn btn-small">Edit</button>
                  <button onClick={() => handleDelete(project.id)} className="btn btn-small btn-danger">Delete</button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default WebDevelopmentEditor;

