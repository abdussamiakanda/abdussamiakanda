function goTo(path){
  window.location.assign(path);
}

function goToTo(path){
  window.location.assign(path);
  document.getElementById('moblie').classList.remove('hide');
  document.getElementById('navigator').classList.add('hide');
}

function showMenu(){
  document.getElementById('moblie').classList.add('hide');
  document.getElementById('navigator').classList.remove('hide');
}

function hide(){
  document.getElementById('moblie').classList.remove('hide');
  document.getElementById('navigator').classList.add('hide');
}

var social = [
  'https://www.researchgate.net/profile/Md_Akanda2',
  'https://scholar.google.com/citations?user=hCntcSgAAAAJ&hl=en',
  'https://www.linkedin.com/in/md-abdus-sami-akanda/',
  'https://orcid.org/0000-0002-6742-2158',
  'https://github.com/abdussamiakanda',
  'https://www.facebook.com/mdabdussami.akanda/',
  'https://www.youtube.com/channel/UC7yhrEJBWA5JTERVBmWNRUQ?view_as=subscriber',
  'https://soundcloud.com/abdussamiakanda'
]

function goNow(no){
  window.open(social[no], '_blank').focus();
}
