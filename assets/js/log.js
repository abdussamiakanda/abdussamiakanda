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
  
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const database = firebase.database();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pageid = urlParams.get('id');

// Progress bar
let processScroll = () => {
  var docElem = document.documentElement;
  var docBody = document.body;
  var scrollTop = docElem['scrollTop'] || docBody['scrollTop'];
  var scrollBottom = (docElem['scrollHeight'] || docBody['scrollHeight']) - window.innerHeight;
  var scrollPercent = scrollTop / scrollBottom * 100 + '%';
  document.getElementById('progressbar').style.setProperty('--scrollAmount', scrollPercent);
}

document.addEventListener('scroll', processScroll);

function startWorking(id) {
  verifyID(id);
}

function verifyID(id) {
  if (!id) {
    document.getElementById('single').innerHTML = `
    <div class="no-results-message">
      <div class="no-results-content">
        <i class="fas fa-search"></i>
        <h3>No post specified</h3>
        <p>Please provide a valid post ID.</p>
      </div>
    </div>`;
    return;
  }

  database.ref("/public/")
    .once("value")
    .then((snap) => {
      var public = snap.child(id).val();
      if (public === true) {
        showSingle(id);
      } else {
        document.getElementById('single').innerHTML = `
          <div class="no-results-message" style="margin-top: 100px; text-align: center;">
            <div class="no-results-content">
              <i class="fas fa-lock" style="font-size: 50px; color: #ff4757;"></i>
              <h3>🚨 BUSTED! 🚨</h3>
              <p>Oh, you thought you were slick, huh? 🕵️‍♂️</p>
              <p>Just casually snooping around like this was your grandma’s diary? 💀</p>
              <p>Well, guess what? This post is off-limits, and you, my friend, are OUT OF LUCK! 🔒</p>
              <p>So pack your bags, turn around, and pretend this never happened before I roast you harder than the sun. ☀️🔥</p>
              <p>Now go on, shoo! 🚪💨</p>
            </div>
          </div>`;
      }
    });
}

function showSingle(id) {
  database.ref("/life/"+id)
    .once("value")
    .then(async (snap) => {
      const post = snap.val();
      if (!post) return;

      document.getElementById('single').innerHTML = `
        <div class="single-post-view">
          <div class="single-post-container">
            <div class="post-meta">
              <span class="post-date">${post.time}</span>
            </div>
            <h1 class="post-title">${post.title}</h1>
            <div class="post-tags post-tags-single">
              ${post.tags ? post.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : ''}
            </div>
            <div class="post-content" id="postContentDetails">
              ${await formatContent(post.details)}
            </div>
          </div>
        </div>`;

      // Render LaTeX if MathJax is available
      if (typeof MathJax !== 'undefined') {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.getElementById('single')]);
      }
    });
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

  // Process tables
  processedContent = processedContent.replace(
    /(\|[^\n]*\|\n\|[^\n]*\|\n\|[^\n]*\|(\n\|[^\n]*\|)*)/g,
    (table) => {
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
        <a href="?id=${refPostId}" 
           class="post-reference"
        >
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      `
    );
    return postContent;
  }
}

startWorking(pageid);