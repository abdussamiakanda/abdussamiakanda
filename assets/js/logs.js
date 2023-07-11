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
  document.title = 'Logs of Md Abdus Sami Akanda'
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
          <i class="fas fa-clipboard selected" onclick="goToApp('logs')"></i>
          <i class="fas fa-list-ul" onclick="goToApp('todo')"></i>
          <i class="fas fa-link" onclick="goToApp('links')"></i>
        </div>
        <div class="title" onclick="showAll()">Logs of Sami</div>
      </div>
      <div class="search-input">
        <span></span>
        <input type="text" id="search-text" placeholder="Search log..." autocomplete="off" onkeydown="if(event.keyCode===13){showSearchResult();}" required/>
      </div>
      <div class="top-buttons">
        <i class="fas fa-plus" onclick="showThings('new')"></i>
        <i class="fas fa-infinity" onclick="showThings('pin')"></i>
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
  if (url !== 'logs') {
    goTo('./'+url);
  }
}

function goTo(path){
  window.location.assign(path);
}

function showThings(id){
  document.getElementById('login').classList.add('hide');
  document.getElementById('main').classList.add('hide');
  document.getElementById('new').classList.add('hide');
  document.getElementById('single').classList.add('hide');
  document.getElementById('edit').classList.add('hide');
  document.getElementById('pin').classList.add('hide');

  document.getElementById(id).classList.remove('hide');

  if (id === 'new') {
    document.getElementById('renderbox').innerHTML = '';
  } else if (id === 'edit') {
    document.getElementById('renderbox2').innerHTML = '';
  }
}

function addLog() {
  var title = document.getElementById("title").value;
  var details = document.getElementById("details").value;
  var tags = document.getElementById("tags").value;
  var public = document.getElementById("public").value;
  var lid = moment().format("x");

  if (title && details && tags) {
    database.ref("/life/" + lid).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags:tags,
      public:public,
      pin:'no',
      time: moment().format("LT, DD MMMM YYYY"),
    });
    if (public === 'true') {
      database.ref("/public/" + lid).set(true);
    }
    showThings('single');
    showSingle(lid);
    document.getElementById("title").value = '';
    document.getElementById("details").value = '';
    document.getElementById("tags").value = '';
  }
}

function showMain() {
  document.getElementById('main').innerHTML = '';
  document.getElementById('pin').innerHTML = '';
  database.ref("/life").orderByKey().limitToLast(50).once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var time = snap.child(childSnap.key + "/time").val();
      var tags = snap.child(childSnap.key + "/tags").val();
      var public = snap.child(childSnap.key + "/public").val();
      var pin = snap.child(childSnap.key + "/pin").val();
      tags = tags.replaceAll(',','</span><span>')

      document.getElementById('pin').innerHTML += `
        <div class="item" onclick="showSingle('${childSnap.key}')" id="item-${childSnap.key}">
          <div class="item-info">
            <span>${time} &#x2022; ${public === 'true' ? '<i class="fas fa-globe-asia"></i>' : '<i class="fas fa-user-lock"></i>'}</span>
            <b>${title}</b>
            <div><span>${tags}</span></div>
          </div>
          <div class="item-edit" id="item-edit-${childSnap.key}" onclick="event.stopPropagation();">
            <i class="fas fa-edit" onclick="showEditBox('${childSnap.key}')"></i>
            <i class="fas fa-trash-alt" onclick="delPop('${childSnap.key}')"></i>
          </div>
        </div>`;
      if (pin === 'yes') {
        document.getElementById('main').innerHTML += `
          <div class="item" onclick="showSingle('${childSnap.key}')" id="item-${childSnap.key}">
            <div class="item-info">
              <span>${time} &#x2022; ${public === 'true' ? '<i class="fas fa-globe-asia"></i>' : '<i class="fas fa-user-lock"></i>'}</span>
              <b>${title}</b>
              <div><span>${tags}</span></div>
            </div>
            <div class="item-edit" id="item-edit-${childSnap.key}" onclick="event.stopPropagation();">
              <i class="fas fa-edit" onclick="showEditBox('${childSnap.key}')"></i>
              <i class="fas fa-trash-alt" onclick="delPop('${childSnap.key}')"></i>
            </div>
          </div>`;
      }
    })
  })
}

function delPop(key) {
  document.getElementById('item-edit-'+key).innerHTML = `
    <i class="fas fa-check" onclick="delLife('${key}')"></i>
    <i class="fas fa-times" onclick="noPop('${key}')"></i>`;

  document.getElementById('item-'+key).classList.add('item-del');
}

function delPop2(key) {
  document.getElementById('item-single-'+key).innerHTML = `
    <i class="fas fa-check" onclick="delLife2('${key}')"></i>
    <i class="fas fa-times" onclick="noPop2('${key}')"></i>`;
}

function delLife(key) {
  database.ref('/life/'+key).remove();
  database.ref('/public/'+key).remove();
  document.getElementById('item-'+key).remove();
}

function delLife2(key) {
  database.ref('/life/'+key).remove();
  database.ref('/public/'+key).remove();
  showThings('main');
  showMain();
}

function showEditBox(key) {
  database.ref("/life/"+key).once("value").then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var tags = snap.child("tags").val();
    var public = snap.child("public").val();

    document.getElementById('edit').innerHTML = `
    <form class="new-entry" onSubmit="return false;">
      <div>
        <input
        type="text"
        id="title2"
        placeholder="Enter title..."
        autocomplete="off"
        value="${title}"
        required />
      </div>
      <div class="renderWindow">
        <textarea id="details2" placeholder="Enter details..." onkeyup="processRender('2')" required>${details}</textarea>
        <div class="renderbox" id="renderbox2"></div>
      </div>
      <div class="fixed">
        <div>
          <input
          type="text"
          id="tags2"
          placeholder="Enter tags... (Comma separated)"
          autocomplete="off"
          value="${tags}"
          required />
          <select id="public2">
            <option value="false" ${public === 'false' ? 'selected' : ''}>Private Log</option>
            <option value="true" ${public === 'true' ? 'selected' : ''}>Public Log</option>
          </select>
        </div>
        <div>
          <button type="submit" onclick="editEntry('${key}')">Edit This Entry</button>
        </div>
      </div>
    </form>`;
  }).then((value) => {
    showThings('edit');
    processRender('2');
    processTextAreaHeight();
  })
}

function showEditBox2(key) {
  database.ref("/life/"+key).once("value").then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var tags = snap.child("tags").val();
    var public = snap.child("public").val();

    document.getElementById('edit').innerHTML = `
    <form class="new-entry" onSubmit="return false;">
      <div>
        <input
        type="text"
        id="title2"
        placeholder="Enter title..."
        autocomplete="off"
        value="${title}"
        required />
      </div>
      <div class="renderWindow">
        <textarea id="details2" placeholder="Enter details..." onkeyup="processRender('2')" required>${details}</textarea>
        <div class="renderbox" id="renderbox2"></div>
      </div>
      <div class="fixed">
        <div>
          <input
          type="text"
          id="tags2"
          placeholder="Enter tags... (Comma separated)"
          autocomplete="off"
          value="${tags}"
          required />
          <select id="public2">
            <option value="false" ${public === 'false' ? 'selected' : ''}>Private Log</option>
            <option value="true" ${public === 'true' ? 'selected' : ''}>Public Log</option>
          </select>
        </div>
        <div>
          <button type="submit" onclick="editEntry2('${key}')">Edit This Entry</button>
        </div>
      </div>
    </form>`;
  }).then((value) => {
    showThings('edit');
    processRender('2');
    processTextAreaHeight();
  })
}


function editEntry(key) {
  var title = document.getElementById("title2").value;
  var details = document.getElementById("details2").value;
  var tags = document.getElementById("tags2").value;
  var public = document.getElementById("public2").value;

  if (title && details && tags) {
    database.ref("/life/" + key).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags:tags,
      public:public,
    });
    if (public === 'true') {
      database.ref("/public/" + key).set(true);
    } else if (public === 'false') {
      database.ref('/public/'+key).remove();
    }
    showThings('main');
    showMain();
  }
}

function editEntry2(key) {
  var title = document.getElementById("title2").value;
  var details = document.getElementById("details2").value;
  var tags = document.getElementById("tags2").value;
  var public = document.getElementById("public2").value;

  if (title && details && tags) {
    database.ref("/life/" + key).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags:tags,
      public:public,
    });
    if (public === 'true') {
      database.ref("/public/" + key).set(true);
    } else if (public === 'false') {
      database.ref('/public/'+key).remove();
    }
    showSingle(key);
  }
}


function noPop(key) {
  document.getElementById('item-edit-'+key).innerHTML = `
    <i class="fas fa-edit" onclick="showEditBox('${key}')"></i>
    <i class="fas fa-trash-alt" onclick="delPop('${key}')"></i>`;
  document.getElementById('item-'+key).classList.remove('item-del');
}

function noPop2(key) {
  document.getElementById('item-single-'+key).innerHTML = `
    <i class="fas fa-edit" onclick="showEditBox2('${key}')"></i>
    <i class="fas fa-trash-alt" onclick="delPop2('${key}')"></i>`;
}


function showSingle(id) {
  database.ref("/life/"+id).once("value").then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var time = snap.child("time").val();
    var tags = snap.child("tags").val();
    var public = snap.child("public").val();
    var pin = snap.child("pin").val();
    tags = tags.replaceAll(',','</span><span>')

    document.getElementById('single').innerHTML = `
    <div class="single-item">
      <div class="single-item-flex">
        <div class="item-info">
          <em onclick="copy('${id}')">${id} <i class="fas fa-copy"></i></em>
          <span>${time} &#x2022; ${public === 'true' ? `<i class="fas fa-globe-asia"></i> &#x2022; <i onclick="copy('https://abdussamiakanda.com/log?id=${id}')" class="share fas fa-share-alt-square"></i>` : '<i class="fas fa-user-lock"></i>'} &#x2022; 
          ${pin === 'yes' ? `<i class="share fas fa-map-marker-alt" onclick="makePin('${id}','no')"></i>` : `<i class="share fas fa-map-marker" onclick="makePin('${id}','yes')"></i>`}</span>
          <b>${title}</b>
          <p><span>${tags}</span></p>
        </div>
        <div class="item-edit" id="item-single-${snap.key}" onclick="event.stopPropagation();">
          <i class="fas fa-edit" onclick="showEditBox2('${snap.key}')"></i>
          <i class="fas fa-trash-alt" onclick="delPop2('${snap.key}')"></i>
        </div>
      </div>
      <div class="details" id="deets">${marked.parse(details)}</div>
    </div>`;
  }).then((value) => {
    processSingle();
    renderMath();
  })
  showThings('single');
}

function makePin(id,tag) {
  if (tag === 'yes') {
    database.ref("/life/"+id+"/pin").set('yes');
  } else {
    database.ref("/life/"+id+"/pin").set('no');
  }
  showSingle(id);
}

function copy(id) {
  navigator.clipboard.writeText(id);
}

function processRender(id) {
  let textArea = '';
  let details = '';
  let objDiv = '';

  if (id === '1'){
    textArea = document.getElementById('details');
    details = textArea.value;
    objDiv = document.getElementById('renderbox');
  } else if (id === '2') {
    textArea = document.getElementById('details2');
    details = textArea.value;
    objDiv = document.getElementById('renderbox2')
  }
  objDiv.innerHTML = marked.parse(details);
  objDiv.scrollTop = objDiv.scrollHeight - objDiv.clientHeight;
  renderMath();

  if (window.innerWidth > 600) {
    textArea.addEventListener("input", function (e) {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
      if (textArea.selectionEnd === textArea.value.length) {
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        textArea.scrollTo(0, textArea.selectionStart+200);
      }
    });
  }
}

function processTextAreaHeight() {
  document.getElementById('details2').style.height = "auto";
  document.getElementById('details2').style.height = document.getElementById('details2').scrollHeight + "px";
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

function showSearchResult() {
  var searchInput = document.getElementById('search-text').value.toLowerCase().replaceAll(' ','');
  document.getElementById('main').innerHTML = '';

  database.ref("/life").orderByKey().once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var time = snap.child(childSnap.key + "/time").val();
      var details = snap.child(childSnap.key + "/details").val();
      var tags = snap.child(childSnap.key + "/tags").val();
      var public = snap.child(childSnap.key + "/public").val();

      if (title.toLowerCase().replaceAll(' ','').includes(searchInput) || time.toLowerCase().replaceAll(' ','').includes(searchInput) || details.toLowerCase().replaceAll(' ','').includes(searchInput) || tags.toLowerCase().replaceAll(' ','').includes(searchInput)) {
        var tagsHtml = tags.replaceAll(',','</span><span>');

        document.getElementById('main').innerHTML += `
          <div class="item" onclick="showSingle('${childSnap.key}')" id="item-${childSnap.key}">
            <div class="item-info">
              <span>${time} &#x2022; ${public === 'true' ? '<i class="fas fa-globe-asia"></i>' : '<i class="fas fa-user-lock"></i>'}</span>
              <b>${title}</b>
              <div><span>${tagsHtml}</span></div>
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
