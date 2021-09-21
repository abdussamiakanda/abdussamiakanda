function goTo(path){
  window.location.assign(path);
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
