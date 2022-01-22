var btns = ['btn0','btn1','btn2','btn3','btn4'];

var divs = ['div0','div1','div2','div3','div4'];

function show(btn){
  for(var i in btns){
    if(btns[i] === btn){
      document.getElementById(btns[i]).classList.add('item-selected');
      document.getElementById(divs[i]).classList.remove('hide');
    } else {
      document.getElementById(btns[i]).classList.remove('item-selected');
      document.getElementById(divs[i]).classList.add('hide');
    }
  }
}

function goTo(path){
  window.location.assign(path);
}

document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.onkeydown = function(e) {
  if(event.keyCode == 123) {
     return false;
  }
  if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
     return false;
  }
  if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
     return false;
  }
  if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
     return false;
  }
  if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
     return false;
  }
}
