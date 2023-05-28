var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var userdata = null;

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

function showAll() {
  showThings('main');
  showMain();
}

function startWorking(user) {
  document.title = 'Important Links';
  document.getElementById('top').innerHTML = `
    <div class="top-flex">
      <div class="top-flex-left">
        <div id="dots" class="dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="all-apps" id="all-apps">
          <i class="fas fa-home" onclick="goToApp('')"></i>
          <i class="fas fa-clipboard" onclick="goToApp('logs')"></i>
          <i class="fas fa-list-ul" onclick="goToApp('todo')"></i>
          <i class="fas fa-link selected" onclick="goToApp('links')"></i>
        </div>
        <div class="title" onclick="showAll()">Important Links</div>
      </div>
      <div class="search-input">
        <span></span>
        <input type="text" id="search-text" placeholder="Search link..." autocomplete="off" onkeydown="if(event.keyCode===13){showSearchResult();}" required/>
      </div>
      <div class="top-buttons">
        <i class="fas fa-plus" onclick="showThings('new')"></i>
        <i class="fas fa-sign-out-alt" onclick="GoogleLogout()"></i>
      </div>
    </div>`;
  showMain();
  showThings('main');
}

document.addEventListener("click", function(evt) {
  let flyoutEl = document.getElementById('dots'),
    targetEl = evt.target,
    element = document.getElementById('all-apps');
  do {
    if(targetEl == flyoutEl) {
      document.getElementById('dots').classList.toggle('dots-hover');
      if (window.getComputedStyle(element).getPropertyValue("display") === 'none'){
        document.getElementById('all-apps').style.display = 'flex';
      } else {
        document.getElementById('all-apps').style.display = 'none';
      }
      return;
    }
    targetEl = targetEl.parentNode;
  } while (targetEl);
  if (window.getComputedStyle(element).getPropertyValue("display") === 'flex'){
    document.getElementById('all-apps').style.display = 'none';
    document.getElementById('dots').classList.toggle('dots-hover');
  }
});

function goToApp(url) {
  document.getElementById('dots').click;
  if (url !== 'links') {
    goTo('./'+url);
  }
}

function goToLink(url) {
  window.open(url, '_blank').focus()
}

function goTo(path){
  window.location.assign(path);
}

function showThings(id){
  document.getElementById('login').classList.add('hide');
  document.getElementById('main').classList.add('hide');
  document.getElementById('edit').classList.add('hide');
  document.getElementById('new').classList.add('hide');

  document.getElementById(id).classList.remove('hide');
}

function addLog() {
  var title = document.getElementById("title").value;
  var url = document.getElementById("url").value;
  var lid = moment().format("x");

  if (title && url) {
    database.ref("/links/" + lid).update({
      title: title,
      url: url,
    });
    showThings('main');
    showMain();
    document.getElementById("title").value = '';
    document.getElementById("url").value = '';
  }
}

function showMain() {
  document.getElementById('main').innerHTML = '';
  database.ref("/links").orderByKey().once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var url = snap.child(childSnap.key + "/url").val();
      var newurl = url.length > 30 ? url.substring(0, 30)+'...' : url;

      document.getElementById('main').innerHTML += `
        <div class="item" onclick="goToLink('${url}')" id="item-${childSnap.key}">
          <div class="item-info">
            <b>${title}</b>
            <div><span>${newurl}</span></div>
          </div>
          <div class="item-edit" id="item-edit-${childSnap.key}" onclick="event.stopPropagation();">
            <i class="fas fa-edit" onclick="showEditBox('${childSnap.key}')"></i>
            <i class="fas fa-trash-alt" onclick="delPop('${childSnap.key}')"></i>
          </div>
        </div>`;
    })
  })
}

function delPop(key) {
  document.getElementById('item-edit-'+key).innerHTML = `
    <i class="fas fa-check" onclick="delLife('${key}')"></i>
    <i class="fas fa-times" onclick="noPop('${key}')"></i>`;

  document.getElementById('item-'+key).classList.add('item-del');
}


function delLife(key) {
  database.ref('/links/'+key).remove();
  document.getElementById('item-'+key).remove();
}

function showEditBox(key) {
  database.ref("/links/"+key).once("value").then((snap) => {
    var title = snap.child("title").val();
    var url = snap.child("url").val();

    document.getElementById('edit').innerHTML = `
      <form class="new-entry" onSubmit="return false;">
        <div>
          <input type="text" id="title2" placeholder="Enter Text..." autocomplete="off" value="${title}" required />
        </div>
        <div>
          <input type="text" id="url2" placeholder="Enter URL..." autocomplete="off" value="${url}" required/>
        </div>
        <div class="fixed">
          <div>
            <button type="submit" onclick="editEntry('${key}')">Edit This Entry</button>
          </div>
        </div>
      </form>
    `;
  }).then((value) => {
    showThings('edit');
  })
}


function editEntry(key) {
  var title = document.getElementById("title2").value;
  var url = document.getElementById("url2").value;

  if (title && url) {
    database.ref("/links/" + key).update({
      title: title,
      url: url,
    });
    showThings('main');
    showMain();
  }
}

function noPop(key) {
  document.getElementById('item-edit-'+key).innerHTML = `
    <i class="fas fa-edit" onclick="showEditBox('${key}')"></i>
    <i class="fas fa-trash-alt" onclick="delPop('${key}')"></i>`;
  document.getElementById('item-'+key).classList.remove('item-del');
}

function showSearchResult() {
  var searchInput = document.getElementById('search-text').value.toLowerCase().replaceAll(' ','');
  document.getElementById('main').innerHTML = '';

  database.ref("/links").orderByKey().once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var url = snap.child(childSnap.key + "/url").val();
      var newurl = url.length > 30 ? url.substring(0, 30)+'...' : url;

      if (title.toLowerCase().replaceAll(' ','').includes(searchInput) || url.toLowerCase().replaceAll(' ','').includes(searchInput)) {

        document.getElementById('main').innerHTML += `
        <div class="item" onclick="goToLink('${url}')" id="item-${childSnap.key}">
          <div class="item-info">
            <b>${title}</b>
            <div><span>${newurl}</span></div>
          </div>
          <div class="item-edit" id="item-edit-${childSnap.key}" onclick="event.stopPropagation();">
            <i class="fas fa-edit" onclick="showEditBox('${childSnap.key}')"></i>
            <i class="fas fa-trash-alt" onclick="delPop('${childSnap.key}')"></i>
          </div>
        </div>`;
      }
    });
    if (document.getElementById('main').innerHTML == '') {
      document.getElementById('main').innerHTML = `<p class="no-result">No results found!</p>`;
    }
  });
  showThings('main');
}
