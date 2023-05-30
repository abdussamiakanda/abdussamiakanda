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

var database = firebase.database();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pageid = urlParams.get('id');

// MAIN FUNCTIONS

let processScroll = () => {
  var docElem = document.documentElement;
  var docBody = document.body;
  var scrollTop = docElem['scrollTop'] || docBody['scrollTop'];
  var scrollBottom = (docElem['scrollHeight'] || docBody['scrollHeight']) - window.innerHeight;
  var scrollPercent = scrollTop / scrollBottom * 100 + '%';

  document.getElementById('progressbar').style.setProperty('--scrollAmount',scrollPercent);
}

document.addEventListener('scroll', processScroll);

function startWorking(id) {
  document.getElementById('top').innerHTML = `
    <div>
      <div class="title">Logs of Sami</div>
    </div>`;
  verifyID(id);
}

function verifyID(id) {
  database
  .ref("/public/")
  .once("value")
  .then((snap) => {
    var public = snap.child(id).val();
    if (public === true) {
      showSingle(id);
    } else {
      document.getElementById('single').innerHTML = `
      <div class="single-item">
        <div class="details" id="deets">
          <center>
            <img src="https://media.tenor.com/JFb7OjmNcewAAAAS/cat-thinking.gif">
            ${marked.parse('Well, well, well, look at you, trying to sneak a peek at my hidden logs by clicking on a vulval link, huh!! <br> Sorry, my friend, but you are not authorized to have that pleasure, and honestly, I don\'t think it even exists!')}
          </center>
        </div>
      </div>`;
    }
  })
}

function showSingle(id) {
  database
  .ref("/life/"+id)
  .once("value")
  .then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var time = snap.child("time").val();
    var tags = snap.child("tags").val();
    tags = tags.replaceAll(',','</span><span>')

    document.getElementById('single').innerHTML = `
    <div class="single-item">
      <div class="single-item-flex">
        <div class="item-info">
          <em onclick="copy('${id}')">${id} <i class="fas fa-copy"></i></em>
          <span>${time}</span>
          <b>${title}</b>
          <p><span>${tags}</span></p>
        </div>
      </div>
      <div class="details" id="deets">${marked.parse(details)}</div>
    </div>`;
  }).then((value) => {
    processSingle();
    renderMath();
  })
}

function copy(id) {
  navigator.clipboard.writeText(id);
}

function processSingle() {
  const details = document.getElementById('deets');
  const regex = /@\{(\d+)\}/g;
  details.innerHTML = details.innerHTML.replace(regex, (match, number) => {
    const id = parseInt(number, 10);
    const customTag = `<i class="hyperlink fas fa-link" onclick="showSingle('${id}')"></i>`;
    return customTag;
  });
      
  if (details) {
    var links = details.getElementsByTagName('a');
    
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank');
    }
  }
}

function goToSingle(id) {
  window.location.href = "?id="+id;
}

function renderMath() {
  setTimeout(
    function() {
      renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError : false
      });
    }, 100);
}

startWorking(pageid);