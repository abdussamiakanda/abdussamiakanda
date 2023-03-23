var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var userdata = null;

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const pageid = urlParams.get("id");


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


function startWorking(user) {
  document.getElementById('top').innerHTML = `
    <div class="top-flex">
      <div class="title" onclick="showThings('main')">Life of Sami</div>
      <div class="search-input">
        <span></span>
        <input type="text" id="search-text" placeholder="Search life..." autocomplete="off" onkeydown="if(event.keyCode===13){showSearchResult();}" required/>
      </div>
      <div class="top-buttons">
        <i class="fas fa-plus" onclick="showThings('new')"></i>
        <i class="fas fa-sign-out-alt" onclick="GoogleLogout()"></i>
      </div>
    </div>`;
  showMain();
  showThings('main');
}

function showThings(id){
  document.getElementById('login').classList.add('hide');
  document.getElementById('main').classList.add('hide');
  document.getElementById('new').classList.add('hide');
  document.getElementById('single').classList.add('hide');

  document.getElementById(id).classList.remove('hide');
}


document.getElementById("add_new_entry").onclick = function () {
  var title = document.getElementById("title").value;
  var details = document.getElementById("details").value;
  var tags = document.getElementById("tags").value;

  if (title && details && tags) {
    database.ref("/life/" + moment().format("x")).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags:tags,
      time: moment().format("LT, DD MMMM YYYY"),
    });
  }

  showThings('main');
  showMain();
};

function showMain() {
  document.getElementById('main').innerHTML = '';
  database
  .ref("/life")
  .orderByKey()
  .limitToLast(50)
  .once("value")
  .then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var time = snap.child(childSnap.key + "/time").val();
      var tags = snap.child(childSnap.key + "/tags").val();
      tags = tags.replaceAll(',','</span><span>')

      document.getElementById('main').innerHTML += `
        <div class="item" onclick="showSingle('${childSnap.key}')">
          <span>${time}</span>
          <b>${title}</b>
          <div><span>${tags}</span></div>
        </div>`;
    })
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
      <span>${time}</span>
      <b>${title}</b>
      <p><span>${tags}</span></p>
      <div><md-block>${details}</md-block></div>
    </div>`;
  })
  showThings('single');
}


function showSearchResult() {
  var searchInput = document.getElementById('search-text').value.toLowerCase().replaceAll(' ','');
  document.getElementById('main').innerHTML = '';

  database
  .ref("/life")
  .orderByKey()
  .once("value")
  .then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var time = snap.child(childSnap.key + "/time").val();
      var details = snap.child(childSnap.key + "/details").val();
      var tags = snap.child(childSnap.key + "/tags").val();

      if (title.toLowerCase().replaceAll(' ','').includes(searchInput) || time.toLowerCase().replaceAll(' ','').includes(searchInput) || details.toLowerCase().replaceAll(' ','').includes(searchInput) || tags.toLowerCase().replaceAll(' ','').includes(searchInput)) {
        var tagsHtml = tags.replaceAll(',','</span><span>');

        document.getElementById('main').innerHTML += `
          <div class="item" onclick="showSingle('${childSnap.key}')">
            <span>${time}</span>
            <b>${title}</b>
            <div><span>${tagsHtml}</span></div>
          </div>`;
      }
    });
    if (document.getElementById('main').innerHTML == '') {
      document.getElementById('main').innerHTML = `<p class="no-result">No results found!</p>`;
    }
  });
  showThings('main');
}
