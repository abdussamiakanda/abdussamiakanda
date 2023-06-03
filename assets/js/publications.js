var social = [
   'https://www.researchgate.net/profile/Md_Akanda2',
   'https://scholar.google.com/citations?user=hCntcSgAAAAJ&hl=en',
   'https://www.linkedin.com/in/abdussamiakanda/',
   'https://orcid.org/0000-0002-6742-2158',
   'https://github.com/abdussamiakanda',
   'https://www.facebook.com/mdabdussami.akanda/',
   'https://www.youtube.com/channel/UC7yhrEJBWA5JTERVBmWNRUQ?view_as=subscriber',
   'https://soundcloud.com/abdussamiakanda',
   'https://khulna.academia.edu/AbdusSamiAkanda',
   'mailto:abdussamiakanda@gmail.com'
]
 
function goSocial(no){
  window.open(social[no], '_blank').focus();
}
 
function goTo(path){
  window.location.assign(path);
}
 
function goBlank(url){
  window.open(url, '_blank').focus();
}

