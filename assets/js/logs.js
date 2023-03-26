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
      <div class="title" onclick="showThings('main')">Logs of Sami</div>
      <div class="search-input">
        <span></span>
        <input type="text" id="search-text" placeholder="Search log..." autocomplete="off" onkeydown="if(event.keyCode===13){showSearchResult();}" required/>
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
  document.getElementById('edit').classList.add('hide');

  document.getElementById(id).classList.remove('hide');

  if (id === 'new') {
    document.getElementById('renderbox').innerHTML = '';
  } else if (id === 'edit') {
    document.getElementById('renderbox2').innerHTML = '';
  }
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
    showThings('main');
    showMain();
    document.getElementById("title").value = '';
    document.getElementById("details").value = '';
    document.getElementById("tags").value = '';
  }
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
        <div class="item" onclick="showSingle('${childSnap.key}')" id="item-${childSnap.key}">
          <div class="item-info">
            <span>${time}</span>
            <b>${title}</b>
            <div><span>${tags}</span></div>
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

function delPop2(key) {
  document.getElementById('item-single-'+key).innerHTML = `
    <i class="fas fa-check" onclick="delLife2('${key}')"></i>
    <i class="fas fa-times" onclick="noPop2('${key}')"></i>`;
}

function delLife(key) {
  database.ref('/life/'+key).remove();
  document.getElementById('item-'+key).remove();
}

function delLife2(key) {
  database.ref('/life/'+key).remove();
  showThings('main');
  showMain();
}

function showEditBox(key) {
  database
  .ref("/life/"+key)
  .once("value")
  .then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var tags = snap.child("tags").val();

    document.getElementById('edit').innerHTML = `
    <form class="new-entry" onSubmit="return false;">
      <div>
        <span></span>
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
      <div>
        <span></span>
        <input
        type="text"
        id="tags2"
        placeholder="Enter tags... (Comma separated)"
        autocomplete="off"
        value="${tags}"
        required />
      </div>
      <div>
        <span></span>
        <button type="submit" onclick="editEntry('${key}')">Edit This Entry</button>
      </div>
    </form>`;
  }).then((value) => {
    showThings('edit');
  })
}

function showEditBox2(key) {
  database
  .ref("/life/"+key)
  .once("value")
  .then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var tags = snap.child("tags").val();

    document.getElementById('edit').innerHTML = `
    <form class="new-entry" onSubmit="return false;">
      <div>
        <span></span>
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
      <div>
        <span></span>
        <input
        type="text"
        id="tags2"
        placeholder="Enter tags... (Comma separated)"
        autocomplete="off"
        value="${tags}"
        required />
      </div>
      <div>
        <span></span>
        <button type="submit" onclick="editEntry2('${key}')">Edit This Entry</button>
      </div>
    </form>`;
  }).then((value) => {
    showThings('edit');
  })
}


function editEntry(key) {
  var title = document.getElementById("title2").value;
  var details = document.getElementById("details2").value;
  var tags = document.getElementById("tags2").value;

  if (title && details && tags) {
    database.ref("/life/" + key).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags:tags,
    });
  showThings('main');
  showMain();
  }
}

function editEntry2(key) {
  var title = document.getElementById("title2").value;
  var details = document.getElementById("details2").value;
  var tags = document.getElementById("tags2").value;

  if (title && details && tags) {
    database.ref("/life/" + key).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br><br>'),
      details: details,
      tags:tags,
    });
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
  database
  .ref("/life/"+id)
  .once("value")
  .then((snap) => {
    var title = snap.child("title").val();
    var details = snap.child("details").val();
    var time = snap.child("time").val();
    var tags = snap.child("tags").val();
    tags = tags.replaceAll(',','</span><span>')
    console.log(id);

    document.getElementById('single').innerHTML = `
    <div class="single-item">
      <div class="single-item-flex">
        <div class="item-info">
          <em onclick="copy('${id}')">${id} <i class="fas fa-copy"></i></em>
          <span>${time}</span>
          <b>${title}</b>
          <p><span>${tags}</span></p>
        </div>
        <div class="item-edit" id="item-single-${snap.key}" onclick="event.stopPropagation();">
          <i class="fas fa-edit" onclick="showEditBox2('${snap.key}')"></i>
          <i class="fas fa-trash-alt" onclick="delPop2('${snap.key}')"></i>
        </div>
      </div>
      <div class="details" id="deets"><md-block>${details}</md-block></div>
    </div>`;
  }).then((value) => {
    processSingle();
    renderMath();
  })
  showThings('single');
}

function copy(id) {
  navigator.clipboard.writeText(id);
}

function processRender(id) {
  if (id === '1'){
    var details = document.getElementById('details').value

    document.getElementById('renderbox').innerHTML = '<md-block>'+details+'</md-block>';
  } else if (id === '2') {
    var details = document.getElementById('details2').value

    document.getElementById('renderbox2').innerHTML = '<md-block>'+details+'</md-block>';
  }
  renderMath();
}

function processSingle() {
  const details = document.body;
  const regex = /@\{(\d+)\}/g;
  details.innerHTML = details.innerHTML.replace(regex, (match, number) => {
    const id = parseInt(number, 10);
    const customTag = `<i class="hyperlink fas fa-link" onclick="showSingle('${id}')"></i>`;
    return customTag;
  });
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
          <div class="item" onclick="showSingle('${childSnap.key}')" id="item-${childSnap.key}">
            <div class="item-info">
              <span>${time}</span>
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
