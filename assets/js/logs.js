import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, onValue, push, remove, update, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);

    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const loginView = document.getElementById('loginView');
    const postsView = document.getElementById('postsView');
    const userAvatar = document.getElementById('userAvatar');
    const postsContainer = document.getElementById('postsContainer');
    const editorView = document.getElementById('editorView');
    const searchInput = document.getElementById('searchInput');
    const writeBtn = document.getElementById('writeBtn');

    // Auth State Observer
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User is signed in:', user);
            await showUserUI(user);
            await loadPosts();
        } else {
            console.log('User is signed out');
            await showLoginUI();
        }
    });

    // Google Login Function
    window.GoogleLogin = async function() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                showUserUI(result.user);
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Error signing in: ' + error.message);
            });
    }

    // Logout Function
    window.logout = async function() {
        signOut(auth)
            .then(() => {
                showLoginUI();
            })
            .catch((error) => {
                console.error('Error signing out:', error);
                alert('Error signing out. Please try again.');
            });
    }

    // Show/Hide UI Functions
    async function showLoginUI() {
        loginBtn.classList.remove('hide');
        userMenu.classList.add('hide');
        loginView.classList.remove('hide');
        searchInput.classList.add('hide');
        postsView.classList.add('hide');
        editorView.classList.add('hide');
        writeBtn.classList.add('hide');

        if (searchBox) {
            searchBox.classList.remove('show');
            searchBox.classList.add('hide');
        }

        const singlePostView = document.getElementById('singlePostView');
        if (singlePostView) {
            singlePostView.remove();
        }

        if (userAvatar) {
            userAvatar.style.display = 'none';
        }

        if (postsContainer) {
            postsContainer.innerHTML = '';
        }
    }

    async function showUserUI(user) {
        loginBtn.classList.add('hide');
        userMenu.classList.remove('hide');
        loginView.classList.add('hide');
        postsView.classList.remove('hide');
        writeBtn.classList.remove('hide');

        if (searchBox) {
            searchBox.classList.remove('hide');
            searchBox.classList.add('show');
            searchInput.value = '';
            searchInput.classList.remove('hide');
        }

        if (userAvatar) {
            userAvatar.src = user.photoURL || '';
            userAvatar.style.display = user.photoURL ? 'block' : 'none';
        }

        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        if (userName) userName.textContent = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email;
    }

    // Posts Functions
    window.loadPosts = async function() {
        const postsRef = ref(database, 'life');
        onValue(postsRef, (snapshot) => {
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = '';
            
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

            Object.entries(posts)
                .map(([id, post]) => ({id, ...post}))
                .sort((a, b) => {
                    // Parse both date formats
                    const parseDate = (timeStr) => {
                        // Try "Month Day, Year at Time" format first
                        let date = new Date(timeStr.replace(' at ', ' '));
                        
                        // If invalid, try "Time, Day Month Year" format
                        if (isNaN(date.getTime())) {
                            const [time, datePart] = timeStr.split(', ');
                            const [day, month, year] = datePart.split(' ');
                            date = new Date(`${month} ${day}, ${year} ${time}`);
                        }
                        
                        return date.getTime();
                    };
                    
                    return parseDate(b.time) - parseDate(a.time);
                })
                .forEach(post => {
                    displayPost(post);
                });
        });
    }

    // Add the displayPost function
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
                    <span class="post-date">${post.time}</span>
                    <span class="post-id" onclick="copyIdToClipboard('copyId','${post.id}')"><i class="fas fa-copy" id="copyId-${post.id}"></i> ${post.id}</span>
                </div>
                <h2 class="post-title" onclick="showSinglePost('${post.id}')">${post.title}</h2>
                <p class="post-excerpt">${contentPreview}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        <span class="tag ${post.public ? 'public' : 'private'}">${post.public ? 'Public' : 'Private'}</span>
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="post-actions">
                        <button class="edit-btn" onclick="editPost('${post.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="event.stopPropagation(); deletePost('${post.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="read-more-btn" onclick="showSinglePost('${post.id}')">
                            Read
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const postsContainer = document.getElementById('postsContainer');
        if (postsContainer) {
            postsContainer.appendChild(postElement);
        }
    }

    // Event Listeners
    document.querySelector('.logo')?.addEventListener('click', () => window.showPosts());
    document.querySelector('.write-btn')?.addEventListener('click', () => window.showEditor());
    
    // Initialize search functionality with existing search box
    const searchBox = document.getElementById('searchBox');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const posts = document.querySelectorAll('.post-preview');
            let hasResults = false;
            
            posts.forEach(post => {
                const title = post.querySelector('.post-title').textContent.toLowerCase();
                const content = post.querySelector('.post-excerpt').textContent.toLowerCase();
                const tags = post.querySelector('.post-tags') ? 
                    post.querySelector('.post-tags').textContent.toLowerCase() : '';
                
                const matchesSearch = title.includes(searchTerm) || 
                                    content.includes(searchTerm) || 
                                    tags.includes(searchTerm);
                
                post.style.display = matchesSearch ? 'block' : 'none';
                if (matchesSearch) hasResults = true;
            });
            
            // Show no results message if needed
            const existingNoResults = document.querySelector('.no-results-message');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            if (!hasResults && searchTerm) {
                const postsContainer = document.getElementById('postsContainer');
                if (postsContainer) {
                    postsContainer.innerHTML = `
                        <div class="no-results-message">
                            <div class="no-results-content">
                                <i class="fas fa-search"></i>
                                <h3>No posts found</h3>
                                <p>No posts match your search for "${searchTerm}"</p>
                            </div>
                        </div>
                    `;
                }
            } else if (!searchTerm) {
                loadPosts(); // Reload all posts when search is cleared
            }
        }, 300));
    }

    // Utility Functions
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

    function showNoResults(searchTerm) {
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

    // Add editPost function
    window.editPost = async function(postId) {
        try {
            const postRef = ref(database, `life/${postId}`);
            const snapshot = await get(postRef);
            const post = snapshot.val();
            if (!post) throw new Error('Post not found');

            // Set the editor fields with the post data
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postContent').innerHTML = post.details;
            document.getElementById('postTags').value = post.tags || '';
            document.getElementById('postVisibility').value = post.public ? 'public' : 'private';
            editorView.dataset.editingPostId = postId; // Store the post ID for editing

            // Show the editor view
            postsView.classList.add('hide');
            document.getElementById('singlePostView')?.classList.add('hide');
            editorView.classList.remove('hide');

            // Initialize the editor
            await initEditor();
        } catch (error) {
            console.error('Error loading post for edit:', error);
            alert('Error loading post. Please try again.');
        }
    }

    // Add showSinglePost function
    window.showSinglePost = async function(postId) {
        try {
            const postRef = ref(database, `life/${postId}`);
            const snapshot = await get(postRef);
            const post = snapshot.val();
            if (!post) return;

            postsView.classList.add('hide');

            // Then create the view with the processed content
            const singlePostView = document.createElement('div');
            singlePostView.id = 'singlePostView';
            singlePostView.className = 'single-post-view';

            singlePostView.innerHTML = `
                <div class="single-post-container">
                    <div class="single-post-header">
                        <button class="back-btn" onclick="showPosts()">
                            <i class="fas fa-arrow-left"></i> Back to posts
                        </button>
                        <div class="post-actions">
                            <button class="edit-btn" onclick="editPost('${postId}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-btn" onclick="deletePost('${postId}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="post-meta">
                        <span class="post-date">${post.time}</span>
                        <span class="post-id" onclick="copyIdToClipboard('clipId','${postId}')"><i class="fas fa-copy" id="clipId-${postId}"></i> ${postId}</span>
                    </div>
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-tags post-tags-single">
                        <span class="tag ${post.public ? 'public' : 'private'}">${post.public ? 'Public' : 'Private'}</span>
                        ${post.tags ? post.tags.split(',').map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <div class="post-content" id="postContentDetails">${await formatContent(post.details.replaceAll('<br>','\n'))}</div>
                </div>
            `;
            
            // Remove existing view if present
            const existingView = document.getElementById('singlePostView');
            if (existingView) {
                existingView.remove();
            }
            
            // Add the new view to the DOM
            document.body.appendChild(singlePostView);

            // Render LaTeX if MathJax is available
            if (typeof MathJax !== 'undefined') {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, singlePostView]);
            }

        } catch (error) {
            console.error('Error loading post:', error);
            alert('Error loading post. Please try again.');
        }
    }

    // Add showPosts function
    window.showPosts = async function() {
        const singlePostView = document.getElementById('singlePostView');
        if (singlePostView) {
            singlePostView.remove();
        }
        editorView.classList.add('hide');
        postsView.classList.remove('hide');
        loadPosts(); // Refresh posts
    }

    // Add initEditor function
    async function initEditor() {
        const editor = document.getElementById('postContent');
        const title = document.getElementById('postTitle');
        const tags = document.getElementById('postTags');
        const visibility = document.getElementById('postVisibility');
        
        // Initialize editor if needed
        if (editor) {
            // Set focus to the title if it's empty
            if (!title.value) {
                title.focus();
            } else {
                editor.focus();
            }
        }

        // Add publish post functionality
        window.publishPost = async function() {
            if (!auth.currentUser) {
                alert("Please sign in to continue");
                return;
            }

            const titleValue = title.value.trim();
            const contentValue = editor.innerHTML;
            const tagsValue = tags.value.trim();
            const visibilityValue = visibility.value.trim() === 'public' ? true : false;

            if (!titleValue || !contentValue) {
                alert("Please fill in both title and content");
                return;
            }

            try {
                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                const postData = {
                    title: titleValue,
                    details: contentValue.replaceAll(/<div>/g, '\n').replace(/<\/div>/g, '').replaceAll('\n','<br>'),
                    tags: tagsValue,
                    time: timeString,
                    public: visibilityValue,
                    createdAt: now.getTime(),
                    authorId: auth.currentUser.uid
                };

                const editingPostId = editorView.dataset.editingPostId;
                let finalPostId;
                
                if (editingPostId) {
                    // Update existing post
                    const postRef = ref(database, `life/${editingPostId}`);
                    await update(postRef, postData);
                    finalPostId = editingPostId;
                } else {
                    // Create new post
                    const postsRef = ref(database, 'life');
                    const newPostRef = await push(postsRef, postData);
                    finalPostId = newPostRef.key;
                }

                // Clear the editor and show the post
                clearEditor();
                await showSinglePost(finalPostId);
            } catch (error) {
                console.error('Error publishing post:', error);
                alert('Error publishing post. Please try again.');
            }
        }

        // Add cancel edit functionality
        window.cancelEdit = async function() {
            const hasContent = title.value.trim() || editor.innerHTML.trim() || tags.value.trim();
            
            if (hasContent) {
                if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
                    clearEditor();
                    await showPosts();
                }
            } else {
                clearEditor();
                await showPosts();
            }
        }
    }

    // Add clearEditor function if not already defined
    window.clearEditor = async function() {
        const title = document.getElementById('postTitle');
        const editor = document.getElementById('postContent');
        const tags = document.getElementById('postTags');
        const visibility = document.getElementById('postVisibility');
        
        if (title) title.value = '';
        if (editor) {
            editor.innerHTML = '';
            editor.placeholder = 'Tell your story...';
        }
        if (tags) tags.value = '';
        if (visibility) visibility.value = '';
        
        // Clear any editing state
        delete editorView.dataset.editingPostId;
    }

    // Add deletePost function
    window.deletePost = async function(postId) {
        if (!auth.currentUser) {
            alert("Please sign in to continue");
            return;
        }

        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                // Get reference to the post
                const postRef = ref(database, `life/${postId}`);
                
                // Remove the post
                await remove(postRef);
                
                console.log('Post deleted successfully');
                
                // If we're in single post view, return to posts list
                const singlePostView = document.getElementById('singlePostView');
                if (singlePostView) {
                    singlePostView.remove();
                }
                
                // Show posts view and refresh posts
                showPosts();
                
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Error deleting post. Please try again.');
            }
        }
    }

    // Add showEditor function
    window.showEditor = async function() {
        postsView.classList.add('hide');
        editorView.classList.remove('hide');
        await initEditor();
    }
});

// Copy ID to Clipboard Function
window.copyIdToClipboard = function(tag,id) {
    navigator.clipboard.writeText(id);
    document.getElementById(tag + '-' + id).classList.remove('fa-copy');
    document.getElementById(tag + '-' + id).classList.add('fa-check');
    setTimeout(() => {
        document.getElementById(tag + '-' + id).classList.add('fa-copy');
        document.getElementById(tag + '-' + id).classList.remove('fa-check');
    }, 2000);
}

function formatContent(content) {
    if (!content) return '';

    // First, convert divs to newlines and sanitize
    let processedContent = content
        .replace(/<div>/gi, '\n')     // Convert div starts to newlines
        .replace(/<\/div>/gi, '')     // Remove div ends
        .replace(/<[^>]*>/g, '')      // Remove other HTML tags
        .replace(/&nbsp;/g, ' ')      // Replace &nbsp; with space
        .trim();                      // Trim extra spaces

    // Handle code blocks first (```)
    processedContent = processedContent.replace(
        /```([\s\S]*?)```/g,
        (match, code) => {
            // Remove first newline if it exists and trim
            code = code.replace(/^\n/, '').trim();
            return `<pre><code>${code}</code></pre>`;
        }
    );

    // Handle inline code (`)
    processedContent = processedContent.replace(
        /`([^`]+)`/g,
        (match, code) => `<code>${code.trim()}</code>`
    );

    // Process tables - match entire tables including headers and separators
    processedContent = processedContent.replace(
        /(\|[^\n]*\|\n\|[^\n]*\|\n\|[^\n]*\|(\n\|[^\n]*\|)*)/g,
        (table) => {
            console.log('Found table:', table);
            
            // Ensure proper spacing in the table
            const formattedTable = table
                .split('\n')
                .filter(row => row.trim())
                .map(row => {
                    const cells = row
                        .split('|')
                        .filter(cell => cell !== '')
                        .map(cell => cell.trim());
                    return '| ' + cells.join(' | ') + ' |';
                })
                .join('\n');

            // Add newlines around the table
            return '\n\n' + formattedTable + '\n\n';
        }
    );

    // Configure marked
    marked.setOptions({
        mangle: false,         // Don't escape HTML
        headerIds: false,      // Don't add IDs to headers
        smartypants: true,     // Use smart punctuation
        smartLists: true,      // Use smarter list behavior
        gfm: true,            // Enable GitHub Flavored Markdown
        breaks: true,         // Convert line breaks to <br>
        tables: true,         // Enable tables
        pedantic: false       // Be more lenient with table parsing
    });
    
    // Let marked handle all markdown processing
    let finalResult = marked.parse(processedContent);

    return replaceTag(finalResult);
}

async function replaceTag(postContent) {
    if (postContent) {
        postContent = postContent.replace(
            /@\{(\d+)\}/g, 
            (match, refPostId) => `
                <a href="#" 
                   onclick="event.preventDefault(); showSinglePost('${refPostId}')" 
                   class="post-reference"
                >
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            `
        );
        return postContent;
    }
}