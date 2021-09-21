var btns = ['btn0','btn1','btn2','btn3'];

var divs = ['div0','div1','div2','div3'];

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
