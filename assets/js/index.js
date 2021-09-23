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

function hideImageView(){
  document.getElementById('imageview').classList.add('hide');
}

var images = [
  'https://drive.google.com/uc?export=download&id=11vNrrxWdIBalmOtzHSl48G0By65oecql',
  'https://drive.google.com/uc?export=download&id=133aBeYfYveZ7RjXYSbxeoEgQBSsylW1Y',
  'https://drive.google.com/uc?export=download&id=11yBxD2JaudHfEYzv8LKKzp5jzKr9Ic_b',
  'https://drive.google.com/uc?export=download&id=1224-pji1P-GuBBEnUI8INAmcartUk3lU',
  'https://drive.google.com/uc?export=download&id=12WzAulmDTKUz68ZDErcEnAUguwaKvP7c',
  'https://drive.google.com/uc?export=download&id=12eEZ-A29ickJBB0EepKkvnR-1KpdZpg7',
  'https://drive.google.com/uc?export=download&id=12p1qyPDJjXqNx0_LbyKd4MBIMGo2dAVB',
  'https://drive.google.com/uc?export=download&id=12xeiThi3j6hf6qGRJfXjUiEoxB7CUUfg'
]

var doodles = [
  'https://drive.google.com/uc?export=download&id=1xavCaAEFj40oPsrMPNGUQdGaK2FqPv_X',
  'https://drive.google.com/uc?export=download&id=13U7eMtVgyQxl9rksscjv0o27yPlog7Ze',
  'https://drive.google.com/uc?export=download&id=13YDwAQAQMcRt7mRh12qr3rDNtC--_D6H',
  'https://drive.google.com/uc?export=download&id=13_IuH7dU1YELOfbYxZUSxgV7MOp6UNPo',
  'https://drive.google.com/uc?export=download&id=13VYin15hHPmN7Y_ihVcz__vz_ZK0pTkp'
]

function showIMG(type,id){
  document.getElementById('imageview').classList.remove('hide');
  if (type === 'img'){
    var imgEl = `
      <i onclick="hideImageView()" class="times fas fa-times"></i>
      <img src="${images[id]}" alt="">
    `
    if (id === '0'){
      imgEl += `
        <i onclick="showIMG('img','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
      `
    }else if(id === '7'){
      imgEl += `
        <i onclick="showIMG('img','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
      `
    } else {
      imgEl += `
        <i onclick="showIMG('img','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
        <i onclick="showIMG('img','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
      `
    }
    document.getElementById('imageview').innerHTML = imgEl;
  } else if (type === 'doodle'){
    var imgEl = `
      <i onclick="hideImageView()" class="times fas fa-times"></i>
      <img src="${doodles[id]}" alt="">
    `
    if (id === '0'){
      imgEl += `
        <i onclick="showIMG('doodle','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
      `
    }else if(id === '4'){
      imgEl += `
        <i onclick="showIMG('doodle','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
      `
    } else {
      imgEl += `
        <i onclick="showIMG('doodle','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
        <i onclick="showIMG('doodle','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
      `
    }
    document.getElementById('imageview').innerHTML = imgEl;
  }
}
