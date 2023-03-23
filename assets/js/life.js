var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var userdata = null;

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const pageid = urlParams.get("id");


// MAIN FUNCTIONS

function startWorking(user) {
  document.getElementById('top').innerHTML = `
    <div class="top-flex">
      <div class="title">Life of Sami</div>
      <div>
        <input type="text" id="search-text" placeholder="Search life..." autocomplete="off" required/>
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

  document.getElementById(id).classList.remove('hide');
}


document.getElementById("add_new_entry").onclick = function () {
  var title = document.getElementById("title").value;
  var details = document.getElementById("details").value;
  var tags = document.getElementById("tags").value;

  if (title && details && tags) {
    database.ref("/life/" + moment().format("x")).update({
      title: title.replace(/(\r\n|\r|\n)/g, '<br>'),
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
      var details = snap.child(childSnap.key + "/details").val();
      var time = snap.child(childSnap.key + "/time").val();

      document.getElementById('main').innerHTML += `
        <div class="item">
          <span>${time}</span>
          <b>${title}</b>
        </div>`;
    })
  })
}

{/* <md-block>${details}</md-block>               */}
