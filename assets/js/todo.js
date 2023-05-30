var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var userdata = null;

function goTo(path){
  window.location.assign(path);
}

// MAIN FUNCTIONS

function showAll() {
  showThings('main');
  showMain();
}

function startWorking(user) {
  document.title = 'Md Abdus Sami Akanda'
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
          <i class="fas fa-list-ul selected" onclick="goToApp('todo')"></i>
          <i class="fas fa-link" onclick="goToApp('links')"></i>
        </div>
        <div class="title" onclick="showAll()">To Do</div>
      </div>
      <div class="top-buttons">
        <i class="fas fa-plus" onclick="showThings('new')"></i>
        <i class="fas fa-check-square" onclick="showDone()"></i>
        <i class="fas fa-chart-area" onclick="showGraphs()"></i>
        <i class="fas fa-sign-out-alt" onclick="GoogleLogout()"></i>
      </div>
    </div>`;
  showMain();
  showThings('main');
}

function showDone() {
  document.getElementById('done').innerHTML = '';
  database.ref("/todo/done/").orderByKey().once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var importance = snap.child(childSnap.key + "/importance").val();
      var repeat = snap.child(childSnap.key + "/repeat").val();
      var when = snap.child(childSnap.key + "/when").val();
      var details = snap.child(childSnap.key + "/details").val();

        document.getElementById('done').innerHTML += `
        <div class="item" style="align-items: flex-start; cursor: default;">
          <div class="tick">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="item-info">
            <b>${title}</b>
            <span>${when}</span>
            <div><span>${imp[importance]}</span><span><i class="fas fa-redo"></i> ${repeat}</span></div>
            <div>${details ? marked.parse(details) : ''}</div>
          </div>
        </div>`;
    })
  })
  showThings('done');
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
    } else if (targetEl !== document.getElementById('suggestions') || targetEl !== document.getElementById('suggestions2')) {
      document.getElementById('suggestions').style.display = 'none';
      if (document.getElementById('suggestions2')) {
        document.getElementById('suggestions2').style.display = 'none';
      }
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
  if (url !== 'todo') {
    goTo('./'+url);
  }
}

function showThings(id){
  document.getElementById('login').classList.add('hide');
  document.getElementById('main').classList.add('hide');
  document.getElementById('new').classList.add('hide');
  document.getElementById('single').classList.add('hide');
  document.getElementById('edit').classList.add('hide');
  document.getElementById('graphs').classList.add('hide');
  document.getElementById('done').classList.add('hide');

  document.getElementById(id).classList.remove('hide');
}

function showGraphs() {
  showThings('graphs');
  showStat(moment().format('YYYY'));
}

function addToDo() {
  var title = document.getElementById("title").value;
  var dodate = document.getElementById("dodate").value;
  var dotime = document.getElementById("dotime").value;
  var importance = document.getElementById("importance").value;
  var repeat = document.getElementById("repeat").value;
  var details = document.getElementById("details").value;
  var lid = moment().format("x");
  
  if (title && importance !== 'false' && repeat !== 'false') {
    database.ref("/todo/tasks/" + getID(dodate,dotime,lid)).update({
      title: title,
      importance: importance,
      done: 'no',
      repeat: repeat,
      when: getWhen(dodate,dotime),
      details: details,
    });
    showThings('main');
    showMain();
    document.getElementById("title").value = '';
    document.getElementById("dodate").value = '';
    document.getElementById("dotime").value = '';
    document.getElementById("importance").value = 'false';
    document.getElementById("repeat").value = 'false';
    document.getElementById("details").value = '';
  }
}

function getWhen(dodate,dotime) {
  let key = '';
  if (!dodate && !dotime) {
    key = '';
  } else if (dodate && !dotime) {
    key = moment(dodate,"YYYY-MM-DD").format("DD MMMM YYYY");
  } else if (!dodate && dotime) {
    key = moment(dotime,"HH:mm").format("LT");
  } else if (dodate && dotime) {
    key = moment(dodate+" "+dotime,"YYYY-MM-DD HH:mm").format("LT, DD MMMM YYYY");
  }
  return key;
}

function getID(dodate,dotime,lid) {
  if (dodate && dotime) {
      lid = moment(dodate+" "+dotime, "YYYY-MM-DD HH:mm").format("x");
  } else if (dodate && !dotime) {
      lid = moment(dodate+" "+moment().format("LT"), "YYYY-MM-DD LT").format("x");
  } else if (!dodate && dotime) {
      lid = moment(moment().format("YYYY-MM-DD")+" "+dotime, "YYYY-MM-DD HH:mm").format("x");
  } else {
      lid = lid;
  }
  return lid;
}

document.getElementById('title').addEventListener("keyup", function(event) {
  var title = document.getElementById("title").value;
  document.getElementById('suggestions').style.display = 'flex';

  database.ref("/todo/suggestions/").orderByKey().once("value").then((snap) => {
    document.getElementById('suggest').innerHTML = '';
    snap.forEach(function (childSnap) {
      var keyword = childSnap.key;
      if (keyword.toLowerCase().includes(title.toLowerCase())) {
        document.getElementById('suggest').innerHTML += `<span onclick="handleKeyword('${keyword}')">${keyword}</span>`;
      }
    })
  })
  document.getElementById('addsugg').innerHTML = `<span onclick="addNewKeyword('${title}')">Add '${title}' to suggestions</span>`;

  if (document.getElementById("title").value === '') {
    document.getElementById('suggestions').style.display = 'none';
  }
});

function showSuggestion() {
  var title = document.getElementById("title2").value;
  document.getElementById('suggestions2').style.display = 'flex';

  database.ref("/todo/suggestions/").orderByKey().once("value").then((snap) => {
    document.getElementById('suggest2').innerHTML = '';
    snap.forEach(function (childSnap) {
      var keyword = childSnap.key;
      if (keyword.toLowerCase().includes(title.toLowerCase())) {
        document.getElementById('suggest2').innerHTML += `<span onclick="handleKeyword2('${keyword}')">${keyword}</span>`;
      }
    })
  })
  document.getElementById('addsugg2').innerHTML = `<span onclick="addNewKeyword2('${title}')">Add '${title}' to suggestions</span>`;

  if (document.getElementById("title2").value === '') {
    document.getElementById('suggestions2').style.display = 'none';
  }
}

function handleKeyword(key) {
  document.getElementById("title").value = key;
  document.getElementById('suggestions').style.display = 'none';
}

function addNewKeyword(key) {
  database.ref("/todo/suggestions/").once("value").then((snapshot) => {
    var ifkey = snapshot.child(key).exists();
    if (ifkey) {
      handleKeyword(key);
    } else {
      database.ref("/todo/suggestions/" + key).update({
        stat: 'no',
      });
      handleKeyword(key);
    }
  })
}

function handleKeyword2(key) {
  document.getElementById("title2").value = key;
  document.getElementById('suggestions2').style.display = 'none';
}

function addNewKeyword2(key) {
  database.ref("/todo/suggestions/").once("value").then((snapshot) => {
    var ifkey = snapshot.child(key).exists();
    if (ifkey) {
      handleKeyword2(key);
    } else {
      database.ref("/todo/suggestions/" + key).update({
        stat: 'no',
      });
      handleKeyword2(key);
    }
  })
}

var imp = ['Select Importance','Not important','Slightly important','Moderately important','Important','Very important']

function showMain() {
  document.getElementById('main').innerHTML = '';
  database.ref("/todo/tasks/").orderByKey().once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var title = snap.child(childSnap.key + "/title").val();
      var importance = snap.child(childSnap.key + "/importance").val();
      var repeat = snap.child(childSnap.key + "/repeat").val();
      var when = snap.child(childSnap.key + "/when").val();

        document.getElementById('main').innerHTML += `
        <div class="item" onclick="showSingle('${childSnap.key}')" id="item-${childSnap.key}">
          <div class="tick" onclick="event.stopPropagation();">
            <i class="far fa-circle" onclick="itsDone('${childSnap.key}')"></i>
          </div>
          <div class="item-info">
            <b>${title}</b>
            <span>${when}</span>
            <div><span>${imp[importance]}</span><span><i class="fas fa-redo"></i> ${repeat}</span></div>
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
  database.ref('/todo/tasks/'+key).remove();
  document.getElementById('item-'+key).remove();
}

function delLife2(key) {
  database.ref('/todo/tasks/'+key).remove();
  showThings('main');
  showMain();
}


// okksa


function showEditBox(key) {
  database.ref("/todo/tasks/"+key).once("value").then((snap) => {
    var title = snap.child("title").val();
    var importance = snap.child("importance").val();
    var repeat = snap.child("repeat").val();
    var when = snap.child("when").val();
    var details = snap.child("details").val();

    document.getElementById('edit').innerHTML = `
      <form class="new-entry" onSubmit="return false;">
        <div class="input-title">
          <input type="text" id="title2" placeholder="Edit Task..." autocomplete="off" value="${title}" onkeyup="showSuggestion()" required />
          <div class="suggestions" id="suggestions2">
            <div class="suggest" id="suggest2"></div>
            <div class="addsugg" id="addsugg2"></div>
          </div>
        </div>
        <div>
          <input type="date" id="dodate2" autocomplete="off" value="${moment(when, 'LT, DD MMMM YYYY').format('YYYY-MM-DD')}"/>
          <input type="time" id="dotime2" autocomplete="off" value="${moment(when, 'LT, DD MMMM YYYY').format('HH:mm')}"/>
        </div>
        <div>
          <select id="importance2" required>
            <option value="false" ${importance === 'false' ? 'selected': ''}>Select Importance</option>
            <option value="1" ${importance === '1' ? 'selected': ''}>Not important</option>
            <option value="2" ${importance === '2' ? 'selected': ''}>Slightly important</option>
            <option value="3" ${importance === '3' ? 'selected': ''}>Moderately important</option>
            <option value="4" ${importance === '4' ? 'selected': ''}>Important</option>
            <option value="5" ${importance === '5' ? 'selected': ''}>Very important</option>
          </select>
          <select id="repeat2">
            <option value="false" ${repeat === 'false' ? 'selected': ''}>Select Recurrence</option>
            <option value="Once" ${repeat === 'Once' ? 'selected': ''}>Once</option>
            <option value="Daily" ${repeat === 'Daily' ? 'selected': ''}>Daily</option>
            <option value="Weekly" ${repeat === 'Weekly' ? 'selected': ''}>Weekly</option>
            <option value="Monthly" ${repeat === 'Monthly' ? 'selected': ''}>Monthly</option>
            <option value="Yearly" ${repeat === 'Yearly' ? 'selected': ''}>Yearly</option>
          </select>
        </div>
        <div>
          <textarea id="details2" placeholder="Enter details...">${details ? details : ''}</textarea>
        </div>
        <div class="fixed">
          <div>
            <button type="submit" onclick="editEntry('${key}')">Edit Task</button>
          </div>
        </div>
      </form>`
  }).then((value) => {
    showThings('edit');
  })
}

function showEditBox2(key) {
  database.ref("/todo/tasks/"+key).once("value").then((snap) => {
    var title = snap.child("title").val();
    var importance = snap.child("importance").val();
    var repeat = snap.child("repeat").val();
    var when = snap.child("when").val();
    var details = snap.child("details").val();

    document.getElementById('edit').innerHTML = `
      <form class="new-entry" onSubmit="return false;">
        <div class="input-title">
          <input type="text" id="title2" placeholder="Edit Task..." autocomplete="off" value="${title}"  onkeyup="showSuggestion()" required />
          <div class="suggestions" id="suggestions2">
            <div class="suggest" id="suggest2"></div>
            <div class="addsugg" id="addsugg2"></div>
          </div>
        </div>
        <div>
          <input type="date" id="dodate2" autocomplete="off" value="${moment(when, 'LT, DD MMMM YYYY').format('YYYY-MM-DD')}"/>
          <input type="time" id="dotime2" autocomplete="off" value="${moment(when, 'LT, DD MMMM YYYY').format('HH:mm')}"/>
        </div>
        <div>
          <select id="importance2" required>
            <option value="false" ${importance === 'false' ? 'selected': ''}>Select Importance</option>
            <option value="1" ${importance === '1' ? 'selected': ''}>Not important</option>
            <option value="2" ${importance === '2' ? 'selected': ''}>Slightly important</option>
            <option value="3" ${importance === '3' ? 'selected': ''}>Moderately important</option>
            <option value="4" ${importance === '4' ? 'selected': ''}>Important</option>
            <option value="5" ${importance === '5' ? 'selected': ''}>Very important</option>
          </select>
          <select id="repeat2">
            <option value="false" ${repeat === 'false' ? 'selected': ''}>Select Recurrence</option>
            <option value="Once" ${repeat === 'Once' ? 'selected': ''}>Once</option>
            <option value="Daily" ${repeat === 'Daily' ? 'selected': ''}>Daily</option>
            <option value="Weekly" ${repeat === 'Weekly' ? 'selected': ''}>Weekly</option>
            <option value="Monthly" ${repeat === 'Monthly' ? 'selected': ''}>Monthly</option>
            <option value="Yearly" ${repeat === 'Yearly' ? 'selected': ''}>Yearly</option>
          </select>
        </div>
        <div>
          <textarea id="details2" placeholder="Enter details...">${details ? details : ''}</textarea>
        </div>
        <div class="fixed">
          <div>
            <button type="submit" onclick="editEntry2('${key}')">Edit Task</button>
          </div>
        </div>
      </form>`
  }).then((value) => {
    showThings('edit');
  })
}


function editEntry(key) {
  var title = document.getElementById("title2").value;
  var dodate = document.getElementById("dodate2").value;
  var dotime = document.getElementById("dotime2").value;
  var importance = document.getElementById("importance2").value;
  var repeat = document.getElementById("repeat2").value;
  var details = document.getElementById("details2").value;
  
  if (title && importance !== 'false' && repeat !== 'false') {
    database.ref("/todo/tasks/" + key).update({
      title: title,
      importance: importance,
      repeat: repeat,
      when: getWhen(dodate,dotime),
      details: details,
    });
    showSingle(key);
  }
}

function editEntry2(key) {
  var title = document.getElementById("title2").value;
  var dodate = document.getElementById("dodate2").value;
  var dotime = document.getElementById("dotime2").value;
  var importance = document.getElementById("importance2").value;
  var repeat = document.getElementById("repeat2").value;
  var details = document.getElementById("details2").value;
  
  if (title && importance !== 'false' && repeat !== 'false') {
    database.ref("/todo/tasks/" + key).update({
      title: title,
      importance: importance,
      repeat: repeat,
      when: getWhen(dodate,dotime),
      details: details,
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
  database.ref("/todo/tasks/"+id).once("value").then((snap) => {
    var title = snap.child("title").val();
    var importance = snap.child("importance").val();
    var repeat = snap.child("repeat").val();
    var when = snap.child("when").val();
    var details = snap.child("details").val();

    document.getElementById('single').innerHTML = `
    <div class="single-item">
      <div class="single-item-flex">
        <div class="tick" onclick="event.stopPropagation();">
          <i class="far fa-circle" onclick="itsDone('${snap.key}')"></i>
        </div>
        <div class="item-info">
          <span>${when}</span>
          <b>${title}</b>
          <p><span>${imp[importance]}</span><span><i class="fas fa-redo"></i> ${repeat}</span></p>
        </div>
        <div class="item-edit" id="item-single-${snap.key}" onclick="event.stopPropagation();">
          <i class="fas fa-edit" onclick="showEditBox2('${snap.key}')"></i>
          <i class="fas fa-trash-alt" onclick="delPop2('${snap.key}')"></i>
        </div>
      </div>
      <div class="details" id="deets">${details ? marked.parse(details) : ''}</div>
    </div>`;
  })
  showThings('single');
}

function itsDone(id) {
  database.ref("/todo/tasks/"+id).once("value").then((snap) => {
    var title = snap.child("title").val();
    var importance = snap.child("importance").val();
    var repeat = snap.child("repeat").val();
    var when = snap.child("when").val();
    var details = snap.child("details").val();

    let time = moment(when, 'LT, DD MMMM YYYY').format('LT') === 'Invalid date' ? moment().format('LT') : moment(when, 'LT, DD MMMM YYYY').format('LT');
    let tomorrow = moment().add(1, 'd').format('DD MMMM YYYY');
    let nextweek = moment().add(1, 'w').format('DD MMMM YYYY');
    let nextmonth = moment().add(1, 'M').format('DD MMMM YYYY');
    let nextyear = moment().add(1, 'y').format('DD MMMM YYYY');

    database.ref("/todo/done/" + id).update({
      title: title,
      importance: importance,
      repeat: repeat,
      when: when,
      details: details,
    });

    if (repeat === 'Daily') {
      database.ref("/todo/tasks/" + moment(time+" "+tomorrow, 'LT DD MMMM YYYY').format('x')).update({
        title: title,
        importance: importance,
        repeat: repeat,
        when: moment(time+" "+tomorrow, 'LT DD MMMM YYYY').format('LT, DD MMMM YYYY'),
        details: details,
      });
    } else if (repeat === 'Weekly') {
      database.ref("/todo/tasks/" + moment(time+" "+nextweek, 'LT DD MMMM YYYY').format('x')).update({
        title: title,
        importance: importance,
        repeat: repeat,
        when: moment(time+" "+nextweek, 'LT DD MMMM YYYY').format('LT, DD MMMM YYYY'),
        details: details,
      });
    } else if (repeat === 'Monthly') {
      database.ref("/todo/tasks/" + moment(time+" "+nextmonth, 'LT DD MMMM YYYY').format('x')).update({
        title: title,
        importance: importance,
        repeat: repeat,
        when: moment(time+" "+nextmonth, 'LT DD MMMM YYYY').format('LT, DD MMMM YYYY'),
        details: details,
      });
    } else if (repeat === 'Yearly') {
      database.ref("/todo/tasks/" + moment(time+" "+nextyear, 'LT DD MMMM YYYY').format('x')).update({
        title: title,
        importance: importance,
        repeat: repeat,
        when: moment(time+" "+nextyear, 'LT DD MMMM YYYY').format('LT, DD MMMM YYYY'),
        details: details,
      });
    }
    handleStat(id);
  }).then((value) => {
    database.ref("/todo/tasks/"+id).remove();
    showMain();
  })
}

let monthdays = [0,31,28,31,30,31,30,31,31,30,31,30,31]

function handleStat(id) {
  database.ref("/todo/tasks/"+id).once("value").then((snap) => {
    var title = snap.child("title").val();
    var year = moment().format('YYYY');
    var month = moment().format('M');

    database.ref("/todo/stats/"+year+"/"+month+"/").once("value").then((snap3) => {
      var num = snap3.child(title).val();

      if (num < monthdays[parseInt(month)]) {
        database.ref("/todo/stats/"+year+"/"+month+"/" + title).set(num+1);
      }
    })
  })
}

function showStat(year) {
  document.getElementById('statmark').innerHTML = ``;
  document.getElementById('stats').innerHTML = `
    <div class="column top">
      <div class="category">Task Name</div>
      <div class="month">January</div>
      <div class="month">February</div>
      <div class="month">March</div>
      <div class="month">April</div>
      <div class="month">May</div>
      <div class="month">June</div>
      <div class="month">July</div>
      <div class="month">August</div>
      <div class="month">September</div>
      <div class="month">October</div>
      <div class="month">November</div>
      <div class="month">December</div>
    </div>
  `;
  database.ref("/todo/suggestions/").orderByKey().once("value").then((snap) => {
    snap.forEach(function (childSnap) {
      var ifstat = snap.child(childSnap.key+"/stat").val();
      var title = childSnap.key.length < 22 ? childSnap.key : childSnap.key.substring(0, 23)+"..."
      document.getElementById('statmark').innerHTML += `
        <div class="statmarkitem">
          <div class="stattitle">${childSnap.key}</div>
          <label class="switch">
            <input type="checkbox" ${ifstat === 'yes' ? 'checked' : ''}>
            <span class="slider round" onclick="whatStat('${childSnap.key}','${ifstat}','${year}')"></span>
          </label>
        </div>
      `;
      if (ifstat === 'yes') {
        database.ref("/todo/stats/"+year).once("value").then((snap3) => {
          var text = "style='background-color: rgba(40, 184, 0, "

          document.getElementById('stats').innerHTML += `
            <div class="column data">
              <div class="category">${title}</div>
              <div class="month" ${snap3.child('1/'+childSnap.key).val() !== null ? text+snap3.child('1/'+childSnap.key).val()/monthdays[1]+")'" : ""}></div>
              <div class="month" ${snap3.child('2/'+childSnap.key).val() !== null ? text+snap3.child('2/'+childSnap.key).val()/monthdays[2]+")'" : ""}></div>
              <div class="month" ${snap3.child('3/'+childSnap.key).val() !== null ? text+snap3.child('3/'+childSnap.key).val()/monthdays[3]+")'" : ""}></div>
              <div class="month" ${snap3.child('4/'+childSnap.key).val() !== null ? text+snap3.child('4/'+childSnap.key).val()/monthdays[4]+")'" : ""}></div>
              <div class="month" ${snap3.child('5/'+childSnap.key).val() !== null ? text+snap3.child('5/'+childSnap.key).val()/monthdays[5]+")'" : ""}></div>
              <div class="month" ${snap3.child('6/'+childSnap.key).val() !== null ? text+snap3.child('6/'+childSnap.key).val()/monthdays[6]+")'" : ""}></div>
              <div class="month" ${snap3.child('7/'+childSnap.key).val() !== null ? text+snap3.child('7/'+childSnap.key).val()/monthdays[7]+")'" : ""}></div>
              <div class="month" ${snap3.child('8/'+childSnap.key).val() !== null ? text+snap3.child('8/'+childSnap.key).val()/monthdays[8]+")'" : ""}></div>
              <div class="month" ${snap3.child('9/'+childSnap.key).val() !== null ? text+snap3.child('9/'+childSnap.key).val()/monthdays[9]+")'" : ""}></div>
              <div class="month" ${snap3.child('10/'+childSnap.key).val() !== null ? text+snap3.child('10/'+childSnap.key).val()/monthdays[10]+")'" : ""}></div>
              <div class="month" ${snap3.child('11/'+childSnap.key).val() !== null ? text+snap3.child('11/'+childSnap.key).val()/monthdays[11]+")'" : ""}></div>
              <div class="month" ${snap3.child('12/'+childSnap.key).val() !== null ? text+snap3.child('12/'+childSnap.key).val()/monthdays[12]+")'" : ""}></div>
            </div>
          `;
        })
      }
    })
  })
  document.getElementById('graph-year').innerHTML = year;
}

function whatStat(key,value,year) {
  let newvalue = value === 'yes' ? 'no' : 'yes';
  database.ref("/todo/suggestions/"+key+'/stat').set(newvalue);
  showStat(year);
}

function changeYear(key) {
  var myDiv = document.getElementById("graph-year");
  var year = parseInt(myDiv.innerHTML);
  if (key === 'left') {
    setTimeout(function() {
      myDiv.innerHTML = year-1;
      showStat(year-1);
    }, 500);
  } else if (key === 'right') {
    setTimeout(function() {
      myDiv.innerHTML = year+1;
      showStat(year+1);
    }, 500);
  }
}

