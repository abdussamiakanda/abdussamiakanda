import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update, remove, query, limitToLast, orderByKey, get } from 'firebase/database';
import { auth, db } from '../firebase/config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import moment from 'moment';
import { marked } from 'marked';
import './VaspPage.css';

function VaspPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); // 'login', 'main', 'new', 'edit', 'single'
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState('false');
  const [editTitle, setEditTitle] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editIsPublic, setEditIsPublic] = useState('false');
  const [searchText, setSearchText] = useState('');

  const detailsRef = useRef(null);
  const editDetailsRef = useRef(null);
  const singleDetailsRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setView('main');
        loadEntries();
      } else {
        // Redirect to home if not logged in
        navigate('/');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (view === 'single' && currentEntry && singleDetailsRef.current) {
      setTimeout(() => {
        processSingle();
        renderMath();
      }, 100);
    }
  }, [view, currentEntry]);

  useEffect(() => {
    if (view === 'new' && detailsRef.current) {
      autoResize(detailsRef.current);
    }
  }, [view]);

  useEffect(() => {
    if (view === 'edit' && editDetailsRef.current) {
      autoResize(editDetailsRef.current);
    }
  }, [view, editingKey]);

  const loadEntries = async () => {
    try {
      const entriesRef = ref(db, '/vasp');
      const q = query(entriesRef, orderByKey(), limitToLast(50));
      
      onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const entriesList = Object.keys(data)
            .map(key => ({ key, ...data[key] }))
            .reverse();
          setEntries(entriesList);
        } else {
          setEntries([]);
        }
      });
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('login');
      setEntries([]);
      setCurrentEntry(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!title || !details || !tags) return;

    const lid = moment().format('x');
    const entryData = {
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags: tags,
      public: isPublic,
      pin: 'no',
      time: moment().format('LT, DD MMMM YYYY'),
    };

    try {
      await set(ref(db, `/vasp/${lid}`), entryData);
      if (isPublic === 'true') {
        await set(ref(db, `/public/${lid}`), true);
      }
      
      setTitle('');
      setDetails('');
      setTags('');
      setIsPublic('false');
      
      setCurrentEntry({ key: lid, ...entryData });
      setView('single');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleEditEntry = async (key, fromSingle = false) => {
    if (!editTitle || !editDetails || !editTags) return;

    const entryData = {
      title: editTitle.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: editDetails,
      tags: editTags,
      public: editIsPublic,
    };

    try {
      await update(ref(db, `/vasp/${key}`), entryData);
      if (editIsPublic === 'true') {
        await set(ref(db, `/public/${key}`), true);
      } else {
        await remove(ref(db, `/public/${key}`));
      }
      
      if (fromSingle) {
        setCurrentEntry({ key, ...currentEntry, ...entryData });
      } else {
        setCurrentEntry({ key, ...entryData });
      }
      setEditingKey(null);
      setView('single');
    } catch (error) {
      console.error('Error editing entry:', error);
    }
  };

  const handleDeleteEntry = async (key) => {
    try {
      await remove(ref(db, `/vasp/${key}`));
      await remove(ref(db, `/public/${key}`));
      setView('main');
      setCurrentEntry(null);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const showSingle = async (id) => {
    try {
      const entryRef = ref(db, `/vasp/${id}`);
      const snapshot = await get(entryRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCurrentEntry({ key: id, ...data });
        setView('single');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  const showEdit = async (key) => {
    try {
      const entryRef = ref(db, `/vasp/${key}`);
      const snapshot = await get(entryRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setEditTitle(data.title || '');
        setEditDetails(data.details || '');
        setEditTags(data.tags || '');
        setEditIsPublic(data.public || 'false');
        setEditingKey(key);
        setView('edit');
      }
    } catch (error) {
      console.error('Error loading entry for edit:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setSearchResults([]);
      setView('main');
      return;
    }

    const searchInput = searchText.toLowerCase().replaceAll(' ', '');
    try {
      const entriesRef = ref(db, '/vasp');
      const snapshot = await get(entriesRef);
      const data = snapshot.val();
      
      if (data) {
        const results = Object.keys(data)
          .filter(key => {
            const entry = data[key];
            const title = (entry.title || '').toLowerCase().replaceAll(' ', '');
            const time = (entry.time || '').toLowerCase().replaceAll(' ', '');
            const details = (entry.details || '').toLowerCase().replaceAll(' ', '');
            const tags = (entry.tags || '').toLowerCase().replaceAll(' ', '');
            
            return title.includes(searchInput) || 
                   time.includes(searchInput) || 
                   details.includes(searchInput) || 
                   tags.includes(searchInput);
          })
          .map(key => ({ key, ...data[key] }))
          .reverse();
        
        setSearchResults(results);
        setView('main');
      } else {
        setSearchResults([]);
        setView('main');
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
  };

  const formatTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
      if (textarea.id === 'details') {
        setDetails(newValue);
      } else if (textarea.id === 'details2') {
        setEditDetails(newValue);
      }
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const autoResize = (textarea) => {
    if (!textarea) return;
    
    const resize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', resize);
    resize();
  };

  const processSingle = () => {
    if (!singleDetailsRef.current) return;
    
    const details = singleDetailsRef.current;
    let html = details.innerHTML;
    
    // Process @{id} links
    const regex = /@\{(\d+)\}/g;
    html = html.replace(regex, (match, number) => {
      return `<i class="hyperlink fas fa-link" onclick="window.showVaspSingle('${number}')"></i>`;
    });
    
    // Process links in code blocks - handle escaped HTML links
    // Handle inline code blocks: <code>content</code>
    html = html.replace(/<code>([\s\S]*?)<\/code>/g, (match, codeContent) => {
      // Check if there are escaped HTML links (like &lt;a href=...&gt;)
      if (/&lt;a\s+href/.test(codeContent)) {
        // Decode HTML entities to get actual HTML links
        const unescaped = codeContent
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"');
        return `<code>${unescaped}</code>`;
      }
      
      // Check if there are markdown link patterns [text](url)
      if (/\[([^\]]+)\]\(([^)]+)\)/.test(codeContent)) {
        const processed = codeContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return `<code>${processed}</code>`;
      }
      
      return match;
    });
    
    // Handle code blocks (pre > code) - multiline
    html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, codeContent) => {
      // Check if there are escaped HTML links
      if (/&lt;a\s+href/.test(codeContent)) {
        // Decode HTML entities
        const unescaped = codeContent
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"');
        return `<pre><code>${unescaped}</code></pre>`;
      }
      
      // Check if there are markdown link patterns
      if (/\[([^\]]+)\]\(([^)]+)\)/.test(codeContent)) {
        const processed = codeContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return `<pre><code>${processed}</code></pre>`;
      }
      
      return match;
    });
    
    details.innerHTML = html;

    // Set target="_blank" for all links (including newly created ones)
    const links = details.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank');
      if (!links[i].hasAttribute('rel')) {
        links[i].setAttribute('rel', 'noopener noreferrer');
      }
    }
  };

  const renderMath = () => {
    setTimeout(() => {
      if (singleDetailsRef.current && window.renderMathInElement) {
        window.renderMathInElement(singleDetailsRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }
    }, 100);
  };

  useEffect(() => {
    window.showVaspSingle = showSingle;
    return () => {
      delete window.showVaspSingle;
    };
  }, []);

  const processMarkdown = (text) => {
    if (!text) return '';
    
    let processed = text.replace(/\\vasp{([^}]+)}/g, (match, text) => {
      return `[${text}](https://www.vasp.at/wiki/index.php/${encodeURIComponent(text)})`;
    });
    
    processed = processed.replace(/#.*$/gm, (match) => {
      return `<!-- ${match} -->`;
    });
    
    // Note: We'll process links in code blocks after markdown parsing
    // because marked escapes HTML in code blocks
    
    return processed;
  };

  const renderMarkdown = (text) => {
    const processed = processMarkdown(text);
    
    // Configure marked to allow HTML
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    });
    
    return marked.parse(processed);
  };

  const displayEntries = searchText.trim() && searchResults.length > 0 ? searchResults : entries;

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not logged in (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="app">
      <SEO 
        title="VASP Documentation"
        description="VASP documentation and notes"
        url="/vasp"
      />
      <Header />
      <main className="vasp-page-main">
        <div className="vasp-page-container">
          {user && (
            <>
              <div className="vasp-header">
                <h1 className="vasp-page-title" onClick={() => { setView('main'); loadEntries(); }}>VASP</h1>
                <div className="vasp-controls">
                  <input 
                    type="text" 
                    className="vasp-search"
                    placeholder="Search..." 
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <button className="vasp-btn" onClick={() => setView('new')}>
                    <i className="fas fa-plus"></i> New Entry
                  </button>
                </div>
              </div>

              {view === 'main' && (
                <div className="vasp-list">
                  {displayEntries.length === 0 ? (
                    <div className="vasp-empty">No entries found</div>
                  ) : (
                    displayEntries.map((entry) => (
                      <div 
                        key={entry.key} 
                        className={`vasp-item ${deleteConfirm === entry.key ? 'vasp-item-del' : ''}`}
                        onClick={() => showSingle(entry.key)}
                      >
                        <div className="vasp-item-content">
                          <h3 className="vasp-item-title" dangerouslySetInnerHTML={{ __html: entry.title }}></h3>
                          {entry.tags && (
                            <div className="vasp-item-tags">
                              {entry.tags.split(',').map((tag, idx) => (
                                <span key={idx} className="vasp-tag">{tag.trim()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div 
                          className="vasp-item-actions" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          {deleteConfirm === entry.key ? (
                            <>
                              <button className="vasp-action-btn" onClick={() => showSingle(entry.key)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="vasp-action-btn vasp-confirm" onClick={() => handleDeleteEntry(entry.key)}>
                                <i className="fas fa-check"></i>
                              </button>
                              <button className="vasp-action-btn" onClick={() => setDeleteConfirm(null)}>
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="vasp-action-btn" onClick={() => showEdit(entry.key)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="vasp-action-btn" onClick={() => setDeleteConfirm(entry.key)}>
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {view === 'new' && (
                <div className="vasp-form-container">
                  <h2 className="vasp-form-title">New Entry</h2>
                  <form className="vasp-form" onSubmit={(e) => { e.preventDefault(); handleAddEntry(); }}>
                    <input
                      type="text"
                      className="vasp-input"
                      placeholder="Title..."
                      autoComplete="off"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <textarea 
                      ref={detailsRef}
                      className="vasp-textarea"
                      placeholder="Details (Markdown supported)..." 
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      onKeyDown={formatTab}
                      required
                    ></textarea>
                    <div className="vasp-form-row">
                      <input
                        type="text"
                        className="vasp-input"
                        placeholder="Tags (comma separated)..."
                        autoComplete="off"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        required
                      />
                      <select 
                        className="vasp-select"
                        value={isPublic}
                        onChange={(e) => setIsPublic(e.target.value)}
                      >
                        <option value="false">Private</option>
                        <option value="true">Public</option>
                      </select>
                    </div>
                    <div className="vasp-form-actions">
                      <button type="button" className="vasp-btn vasp-btn-secondary" onClick={() => setView('main')}>
                        Cancel
                      </button>
                      <button type="submit" className="vasp-btn vasp-btn-primary">
                        Add Entry
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {view === 'edit' && editingKey && (
                <div className="vasp-form-container">
                  <h2 className="vasp-form-title">Edit Entry</h2>
                  <form className="vasp-form" onSubmit={(e) => { e.preventDefault(); handleEditEntry(editingKey, false); }}>
                    <input
                      type="text"
                      className="vasp-input"
                      placeholder="Title..."
                      autoComplete="off"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                    <textarea 
                      ref={editDetailsRef}
                      className="vasp-textarea"
                      placeholder="Details (Markdown supported)..." 
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      onKeyDown={formatTab}
                      required
                    ></textarea>
                    <div className="vasp-form-row">
                      <input
                        type="text"
                        className="vasp-input"
                        placeholder="Tags (comma separated)..."
                        autoComplete="off"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        required
                      />
                      <select 
                        className="vasp-select"
                        value={editIsPublic}
                        onChange={(e) => setEditIsPublic(e.target.value)}
                      >
                        <option value="false">Private</option>
                        <option value="true">Public</option>
                      </select>
                    </div>
                    <div className="vasp-form-actions">
                      <button type="button" className="vasp-btn vasp-btn-secondary" onClick={() => { setView('single'); setEditingKey(null); }}>
                        Cancel
                      </button>
                      <button type="submit" className="vasp-btn vasp-btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {view === 'single' && currentEntry && (
                <div className="vasp-detail">
                  <div className="vasp-detail-header">
                    <div>
                      <h2 className="vasp-detail-title" dangerouslySetInnerHTML={{ __html: currentEntry.title }}></h2>
                      {currentEntry.tags && (
                        <div className="vasp-detail-tags">
                          {currentEntry.tags.split(',').map((tag, idx) => (
                            <span key={idx} className="vasp-tag">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div 
                      className="vasp-detail-actions" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {deleteConfirm === currentEntry.key ? (
                        <>
                          <button className="vasp-action-btn vasp-confirm" onClick={() => handleDeleteEntry(currentEntry.key)}>
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="vasp-action-btn" onClick={() => setDeleteConfirm(null)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="vasp-action-btn" onClick={() => showEdit(currentEntry.key)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="vasp-action-btn" onClick={() => setDeleteConfirm(currentEntry.key)}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                          <button className="vasp-back-btn" onClick={() => setView('main')}>
                            <i className="fas fa-arrow-left"></i> Back
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div 
                    className="vasp-detail-content" 
                    ref={singleDetailsRef}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(currentEntry.details) }}
                  ></div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default VaspPage;
