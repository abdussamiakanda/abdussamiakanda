document.addEventListener('DOMContentLoaded', function() {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyD2FLUPlMF4tVFBPtIea1AUzM6RgWeaZ1o",
        authDomain: "life-abdussamiakanda.firebaseapp.com",
        databaseURL: "https://life-abdussamiakanda-default-rtdb.firebaseio.com",
        projectId: "life-abdussamiakanda",
        storageBucket: "life-abdussamiakanda.appspot.com",
        messagingSenderId: "699844726358",
        appId: "1:699844726358:web:98bb59195a9e33354bf5f7",
        measurementId: "G-S411V27PLT"
    };

    // Initialize Firebase only if it hasn't been initialized yet
    let app;
    try {
        app = firebase.app();
    } catch (error) {
        app = firebase.initializeApp(firebaseConfig);
    }
    
    const auth = firebase.auth();
    const database = firebase.database();

    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    const postsContainer = document.getElementById('postsContainer');
    const loginView = document.getElementById('loginView');
    const postsView = document.getElementById('postsView');
    const editorView = document.getElementById('editorView');

    // Additional Elements
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');

    function createPostActions(postId, authorId) {
        if (!auth.currentUser || authorId !== auth.currentUser.uid) {
            return '';
        }
        
        return `
            <button class="edit-btn" onclick="editPost('${postId}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn" onclick="event.stopPropagation(); deletePost('${postId}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
    }

    // Make all interactive functions global
    window.GoogleLogin = function() {
        console.log('Starting Google login...');
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log('Login successful:', result.user);
                showUserUI(result.user);
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Error signing in: ' + error.message);
            });
    }

    window.logout = function() {
        auth.signOut()
            .then(() => {
                console.log('User signed out successfully');
                const searchBox = document.getElementById('searchBox');
                if (searchBox) {
                    searchBox.classList.add('hide');
                    searchBox.classList.remove('show');
                }
                showLoginUI();
            })
            .catch((error) => {
                console.error('Error signing out:', error);
                alert('Error signing out. Please try again.');
            });
    }

    window.showEditor = async function() {
        if (!auth.currentUser) {
            alert("Please sign in to write a post");
            return;
        }
        
        postsView.classList.add('hide');
        editorView.classList.remove('hide');
        
        const editor = document.getElementById('postContent');
        const content = editor.innerHTML;
        
        // Clear editor contents if it's not editing an existing post
        if (!editorView.dataset.editingPostId) {
            document.getElementById('postTitle').value = '';
            editor.innerHTML = '<p><br></p>';
            document.getElementById('postTags').value = '';
            document.getElementById('postVisibility').value = 'private';
        }
        
        // Initialize editor event listeners
        initEditor();
    };

    // Additional functions that need to be global
    window.showPosts = function() {
        const singlePostView = document.getElementById('singlePostView');
        if (singlePostView) {
            singlePostView.remove();
        }
        editorView.classList.add('hide');
        postsView.classList.remove('hide');
        loadPosts(); // Refresh posts
    }

    window.loadPosts = function() {
        const postsRef = database.ref('life');
        postsRef.on('value', (snapshot) => {
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = ''; // Clear existing posts
            
            const posts = snapshot.val();
            if (!posts) {
                postsContainer.innerHTML = `
                    <div class="no-results-message">
                        <div class="no-results-content">
                            <i class="fas fa-file-alt"></i>
                            <h3>No posts yet</h3>
                            <p>Be the first to share your thoughts!</p>
                        </div>
                    </div>
                `;
                return;
            }

            // Convert to array and sort by timestamp
            const postsArray = Object.entries(posts)
                .map(([id, post]) => ({
                    id,
                    ...post
                }))
                .sort((a, b) => b.createdAt - a.createdAt);

            let hasVisiblePosts = false;
            postsArray.forEach(post => {
                displayPost(post);
                hasVisiblePosts = true;
            });

            // If no visible posts (all private and not owned by current user)
            if (!hasVisiblePosts) {
                postsContainer.innerHTML = `
                    <div class="no-results-message">
                        <div class="no-results-content">
                            <i class="fas fa-lock"></i>
                            <h3>No posts available</h3>
                            <p>There are no public posts to display at this time.</p>
                        </div>
                    </div>
                `;
            }
        });
    }

    window.displayPost = async function(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post-preview';
        
        // Create preview of the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.details;
        const contentPreview = tempDiv.textContent.slice(0, 120) + 
            (tempDiv.textContent.length > 120 ? '...' : '');

        const tags = post.tags ? post.tags.split(',').map(tag => tag.trim()) : [];

        postElement.innerHTML = `
            <div class="post-preview-content">
                <div class="post-meta">
                    <div class="post-author">
                        <img src="${post.authorPhoto}" alt="${post.authorName}" class="author-avatar">
                        <span class="author-name">${post.authorName}</span>
                    </div>
                    <span class="post-date">${post.time}</span>
                </div>
                <h2 class="post-title" onclick="showSinglePost('${post.id}')">${post.title}</h2>
                <p class="post-excerpt">${contentPreview}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${tags.length > 3 ? `<span class="tag">+${tags.length - 3}</span>` : ''}
                    </div>
                    <div class="post-actions">
                        ${post.isPublic ? 
                            '<span class="visibility-badge">Public</span>' : 
                            '<span class="visibility-badge private">Private</span>'}
                        ${createPostActions(post.id, post.authorId)}
                        <button class="read-more-btn" onclick="showSinglePost('${post.id}')">
                            Read
                        </button>
                    </div>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    }

    window.clearEditor = function() {
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').innerHTML = '';
        document.getElementById('postTags').value = '';
        document.getElementById('postVisibility').value = 'private';
        // Clear any editing state
        delete editorView.dataset.editingPostId;
    }

    // Utility function for formatting dates
    window.formatDate = function(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // If less than 1 day, show relative time
        if (diffDays === 0) {
            const hours = Math.floor(diffTime / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diffTime / (1000 * 60));
                return `${minutes}m ago`;
            }
            return `${hours}h ago`;
        }
        // If less than 7 days, show days ago
        else if (diffDays < 7) {
            return `${diffDays}d ago`;
        }
        // If same year, show month and day
        else if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        // If different year, include the year
        else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    // Helper functions (not needed globally)
    function showLoginUI() {
        loginBtn.classList.remove('hide');
        userMenu.classList.add('hide');
        userMenu.classList.remove('show');
        loginView.classList.remove('hide');
        postsView.classList.add('hide');
        editorView.classList.add('hide');

        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.classList.add('hide');
            searchBox.classList.remove('show');
        }

        if (userAvatar) {
            userAvatar.style.display = 'none';
            userAvatar.src = '';
        }
        
        const writeBtn = document.querySelector('.write-btn');
        if (writeBtn) {
            writeBtn.classList.add('hide');
        }

        if (postsContainer) {
            postsContainer.innerHTML = '';
        }
    }

    function showUserUI(user) {
        loginBtn.classList.add('hide');
        userMenu.classList.remove('hide');
        userMenu.classList.add('show');
        loginView.classList.add('hide');
        postsView.classList.remove('hide');
        
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.classList.remove('hide');
            searchBox.classList.add('show');
        }
        
        const writeBtn = document.querySelector('.write-btn');
        if (writeBtn) {
            writeBtn.classList.remove('hide');
        }
        
        if (userAvatar) {
            if (user.photoURL) {
                userAvatar.src = user.photoURL;
                userAvatar.style.display = 'block';
            } else {
                userAvatar.style.display = 'none';
            }
        }
        
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        if (userName) userName.textContent = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email;
    }

    // Function to create verse block for saving
    function createVerseBlock(reference, verse) {
        return `
            <div class="verse-block" data-verse-ref="${reference}">
                <div class="verse-text">${verse}</div>
                <div class="verse-reference">${reference}</div>
            </div>
        `;
    }

    // Function to process content and replace verse tags for saving
    async function processVerseReferences(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Update the verse pattern to include optional language tag
        const versePattern = /v\[(\d+:\d+(?:-\d+)?(?:\[\w+\])?)\]/g;
        let processedContent = tempDiv.innerHTML;
        const matches = [...processedContent.matchAll(versePattern)];

        for (const match of matches) {
            const [fullMatch, reference] = match;
            const verseData = await fetchVerses(reference);
            const verseBlock = createVersePreview(reference, verseData);
            processedContent = processedContent.replace(fullMatch, verseBlock);
        }

        return processedContent;
    }

    // Auth State Observer
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is signed in:', user);
            showUserUI(user);
            loadPosts();
        } else {
            console.log('User is signed out');
            showLoginUI();
        }
    });

    // Start with login UI
    showLoginUI();

    // Add edit functionality
    window.editPost = async function(postId) {
        const postRef = database.ref('life').child(postId);
        
        try {
            const snapshot = await postRef.once('value');
            const post = snapshot.val();
            if (!post) {
                console.error('Post not found');
                return;
            }

            // Switch to editor view
            postsView.classList.add('hide');
            if (document.querySelector('.single-post-view')) {
                document.querySelector('.single-post-view').remove();
            }
            editorView.classList.remove('hide');

            // First, clean any existing previews from the content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.content;
            const existingPreviews = tempDiv.querySelectorAll('.verse-preview');
            existingPreviews.forEach(preview => preview.remove());
            
            // Process verse tags
            if (tempDiv.innerHTML.includes('v[')) {
                // Update the verse pattern to match exactly the same as above
                const versePattern = /v\[(\d+:\d+(?:-\d+)?(?:\[\w+\])?)\]/g;
                const matches = [...tempDiv.innerHTML.matchAll(versePattern)];
                
                for (const match of matches) {
                    const [fullMatch, reference] = match;
                    try {
                        const verseData = await fetchVerses(reference);
                        const preview = createVersePreview(reference, verseData);
                        tempDiv.innerHTML = tempDiv.innerHTML.replace(fullMatch, fullMatch + preview);
                    } catch (error) {
                        console.error('Error fetching verse:', error);
                    }
                }
            }

            // Populate editor with processed content
            document.getElementById('postTitle').value = post.title || '';
            document.getElementById('postContent').innerHTML = tempDiv.innerHTML;
            document.getElementById('postTags').value = post.tags ? post.tags.join(', ') : '';
            document.getElementById('postVisibility').value = post.isPublic ? 'public' : 'private';

            // Add post ID to editor for updating
            editorView.dataset.editingPostId = postId;

            // Set the lastContent in initEditor to prevent immediate reprocessing
            const editor = document.getElementById('postContent');
            editor.dataset.lastContent = editor.innerHTML;
            
            // Initialize editor
            initEditor();
        } catch (error) {
            console.error('Error loading post for edit:', error);
            alert('Error loading post. Please try again.');
        }
    }

    // Add single post view function
    window.showSinglePost = async function(postId) {
        const postRef = database.ref('life').child(postId);
        
        try {
            const snapshot = await postRef.once('value');
            const post = snapshot.val();
            if (!post) return;

            postsView.classList.add('hide');
            
            // Create a temporary div for content processing
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.content;
            
            // Remove any existing verse previews first
            const existingPreviews = tempDiv.querySelectorAll('.verse-preview');
            existingPreviews.forEach(preview => preview.remove());
            
            // Now process verse tags
            const versePattern = /v\[(\d+:\d+(?:-\d+)?(?:\[(\w+)\])?)\]/g;
            const matches = [...tempDiv.innerHTML.matchAll(versePattern)];
            
            for (const match of matches) {
                const [fullMatch, reference] = match;
                try {
                    const verseData = await fetchVerses(reference);
                    const preview = createVersePreview(reference, verseData);
                    tempDiv.innerHTML = tempDiv.innerHTML.replace(fullMatch, preview);
                } catch (error) {
                    console.error('Error fetching verse:', error);
                }
            }

            // Create the single post view
            const singlePostView = document.createElement('div');
            singlePostView.id = 'singlePostView';
            singlePostView.className = 'single-post-view';
            
            const tags = post.tags || [];
            
            singlePostView.innerHTML = `
                <div class="single-post-container">
                    <div class="single-post-header">
                        <button class="back-btn" onclick="showPosts()">
                            <i class="fas fa-arrow-left"></i> Back to posts
                        </button>
                        <div class="post-actions">
                            ${createPostActions(postId, post.authorId)}
                        </div>
                    </div>
                    <div class="post-meta">
                        <div class="post-author">
                            <img src="${post.authorPhoto}" alt="${post.authorName}" class="author-avatar">
                            <span class="author-name">${post.authorName}</span>
                        </div>
                        <span class="post-date">${formatDate(post.createdAt)}</span>
                    </div>
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-tags">
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="post-content">${tempDiv.innerHTML}</div>
                </div>
            `;
            
            const existingView = document.getElementById('singlePostView');
            if (existingView) {
                existingView.remove();
            }
            
            document.body.appendChild(singlePostView);
        } catch (error) {
            console.error('Error loading post:', error);
            alert('Error loading post. Please try again.');
        }
    }

    // Make cancelEdit function global
    window.cancelEdit = function() {
        // Show confirmation if there's content
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').innerHTML.trim();
        const tags = document.getElementById('postTags').value.trim();
        
        if (title || content || tags) {
            if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
                clearEditor();
                showPosts();
            }
        } else {
            // If no content, just go back without confirmation
            clearEditor();
            showPosts();
        }
    }

    // Add delete post function
    window.deletePost = function(postId) {
        if (!auth.currentUser) {
            alert("Please sign in to delete posts");
            return;
        }

        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            const postRef = database.ref('posts/' + postId);
            
            postRef.once('value')
                .then((snapshot) => {
                    const post = snapshot.val();
                    
                    // Check if user owns the post
                    if (post.authorId !== auth.currentUser.uid) {
                        alert("You can only delete your own posts");
                        return;
                    }

                    // Delete the post
                    return postRef.remove();
                })
                .then(() => {
                    console.log('Post deleted successfully');
                    showPosts(); // Return to posts list
                })
                .catch((error) => {
                    console.error('Error deleting post:', error);
                    alert('Error deleting post. Please try again.');
                });
        }
    }


    // Add this near the end of the DOMContentLoaded function
    document.querySelector('.logo').addEventListener('click', showPosts);

    // Update the write button click handler
    document.querySelector('.write-btn').addEventListener('click', function() {
        // Remove single post view if it exists
        const singlePostView = document.getElementById('singlePostView');
        if (singlePostView) {
            singlePostView.remove();
        }
        
        // Hide posts view
        postsView.classList.add('hide');
        
        // Show and reset editor
        editorView.classList.remove('hide');
        clearEditor();
    });

    // Add search functionality
    searchInput.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const posts = document.querySelectorAll('.post-preview');
        let hasResults = false;
        
        // Remove existing no-results message if it exists
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        posts.forEach(post => {
            const title = post.querySelector('.post-title').textContent.toLowerCase();
            const content = post.querySelector('.post-excerpt').textContent.toLowerCase();
            const tags = Array.from(post.querySelectorAll('.tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            const matchesSearch = 
                title.includes(searchTerm) || 
                content.includes(searchTerm) ||
                tags.some(tag => tag.includes(searchTerm));
            
            post.style.display = matchesSearch ? 'block' : 'none';
            if (matchesSearch) hasResults = true;
        });
        
        // Show no results message if needed
        if (!hasResults && searchTerm) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-search"></i>
                    <h3>No posts found</h3>
                    <p>No posts match your search for "${searchTerm}"</p>
                </div>
            `;
            postsContainer.appendChild(noResultsMessage);
        }
    }, 300));

    // Add this utility function at the top level
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.publishPost = async function() {
        if (!auth.currentUser) {
            alert("Please sign in to publish posts");
            return;
        }

        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').innerHTML.trim();
        const tags = document.getElementById('postTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        const visibility = document.getElementById('postVisibility').value;
        const isPublic = visibility === 'public';

        if (!title || !content) {
            alert("Please fill in both title and content");
            return;
        }

        try {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const postData = {
                title,
                details: content,
                tags: tags.join(', '),
                time: timeString,
                isPublic,
                authorId: auth.currentUser.uid,
                authorName: auth.currentUser.displayName,
                authorPhoto: auth.currentUser.photoURL,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            // Check if we're editing an existing post
            const editingPostId = editorView.dataset.editingPostId;
            let postRef;

            if (editingPostId) {
                // Update existing post
                postRef = database.ref('life/' + editingPostId);
                await postRef.update(postData);
            } else {
                // Create new post
                postRef = database.ref('life').push();
                await postRef.set(postData);
            }

            // Clear editor and show posts
            clearEditor();
            showPosts();
        } catch (error) {
            console.error('Error publishing post:', error);
            alert('Error publishing post. Please try again.');
        }
    }
});

// Move these functions outside DOMContentLoaded to make them globally available
window.updateToolbarState = function() {
    const toolbar = document.querySelector('.editor-toolbar');
    
    toolbar.querySelectorAll('button').forEach(button => {
        const command = button.getAttribute('data-command');
        
        switch(command) {
            case 'bold':
            case 'italic':
                const state = document.queryCommandState(command);
                button.classList.toggle('active', state);
                break;
                
            case 'h2':
                const isH2 = document.queryCommandValue('formatBlock').toLowerCase() === 'h2';
                button.classList.toggle('active', isH2);
                break;
                
            case 'quote':
                const isQuote = document.queryCommandValue('formatBlock').toLowerCase() === 'blockquote';
                button.classList.toggle('active', isQuote);
                break;
                
            case 'link':
                const isLink = document.queryCommandState('createLink');
                button.classList.toggle('active', isLink);
                break;
        }
    });
};

window.handleToolbarClick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const editor = document.getElementById('postContent');
    const command = this.getAttribute('data-command');
    
    editor.focus();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    switch(command) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
            
        case 'italic':
            document.execCommand('italic', false, null);
            break;
            
        case 'h2':
            const parentBlock = range.commonAncestorContainer.parentElement;
            const isH2 = parentBlock.tagName === 'H2';
            document.execCommand('formatBlock', false, isH2 ? 'p' : 'h2');
            break;
            
        case 'quote':
            const blockParent = range.commonAncestorContainer.parentElement;
            const isQuote = blockParent.tagName === 'BLOCKQUOTE';
            document.execCommand('formatBlock', false, isQuote ? 'p' : 'blockquote');
            break;
            
        case 'link':
            const isLink = document.queryCommandState('createLink');
            if (isLink) {
                document.execCommand('unlink', false, null);
            } else {
                const url = prompt('Enter the URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                    // Make links open in new tab
                    const links = editor.getElementsByTagName('a');
                    for (let link of links) {
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                    }
                }
            }
            break;
    }
    
    // Update button states after formatting
    updateToolbarState();
};

function updateToolbarState() {
    const toolbar = document.querySelector('.editor-toolbar');
    const selection = window.getSelection();
    
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const parentBlock = range.commonAncestorContainer.parentElement;
    
    toolbar.querySelectorAll('button').forEach(button => {
        const command = button.getAttribute('data-command');
        
        switch(command) {
            case 'bold':
                button.classList.toggle('active', document.queryCommandState('bold'));
                break;
                
            case 'italic':
                button.classList.toggle('active', document.queryCommandState('italic'));
                break;
                
            case 'h2':
                button.classList.toggle('active', parentBlock.tagName === 'H2');
                break;
                
            case 'quote':
                button.classList.toggle('active', parentBlock.tagName === 'BLOCKQUOTE');
                break;
                
            case 'link':
                button.classList.toggle('active', document.queryCommandState('createLink'));
                break;
        }
    });
}

function initializeEditor() {
    const editor = document.getElementById('postContent');
    const toolbar = document.querySelector('.editor-toolbar');
    
    // Remove existing listeners
    toolbar.querySelectorAll('button').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Add new listeners
    toolbar.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', handleToolbarClick);
    });
    
    // Monitor selection changes
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('focus', updateToolbarState);
    
    // Initialize editor with a paragraph
    if (editor.innerHTML.trim() === '') {
        editor.innerHTML = '<p><br></p>';
    }
}