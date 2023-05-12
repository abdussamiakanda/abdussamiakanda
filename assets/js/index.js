function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const myEl = document.querySelectorAll('.floating');
const topPosition = [];
const leftPosition = [];

for (let i = 0; i < myEl.length; i++) {
  let T = randomInt(100, 350);
  let L = randomInt(10, 90)
  myEl[i].style.top = T + 'px';
  myEl[i].style.left = L + '%';
  topPosition[i] = T;
  leftPosition[i] = myEl[i].offsetLeft;
}

if (window.innerWidth >= 640) {
  document.addEventListener('mousemove', function(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
  
    for (let i = 0; i < myEl.length; i++) {
  
      let elTop = topPosition[i] + ((50/window.innerHeight) * (mouseY - (window.innerHeight / 2)))
      let elLeft = leftPosition[i] + ((50/window.innerWidth) * (mouseX - (window.innerWidth / 2)))
  
      myEl[i].style.top = elTop + 'px';
      myEl[i].style.left = elLeft + 'px';
    }
  });
}

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

function showAcademic() {
  document.getElementById('academic').style.display = "block";
  document.getElementById('personal').style.display = "none";
  document.getElementById('menu-academic').classList.add("selected");
  document.getElementById('menu-personal').classList.remove("selected");
  document.getElementById('menu-personal-inner').classList.remove("colorful");
  document.getElementById('back1').style.visibility = "visible";
  document.getElementById('back2').style.visibility = "hidden";
  window.scrollTo(0, 0);
  document.getElementById('rightMenuOptions').innerHTML = `
    <div onclick="goTo('#research')">Research</div>
    <div onclick="goTo('#education')">Education</div>
    <div onclick="goTo('#teaching')">Teaching Experience</div>
    <div onclick="goTo('#skillset')">Skillset</div>
    <div onclick="goTo('#work-experience')">Work Experience</div>
    <div onclick="goTo('#awards')">Awards</div>
  `;
}

function showPersonal() {
  document.getElementById('academic').style.display = "none";
  document.getElementById('personal').style.display = "block";
  document.getElementById('menu-academic').classList.remove("selected");
  document.getElementById('menu-personal').classList.add("selected");
  document.getElementById('menu-personal-inner').classList.add("colorful");
  document.getElementById('back1').style.visibility = "hidden";
  document.getElementById('back2').style.visibility = "visible";
  window.scrollTo(0, 0);
  document.getElementById('rightMenuOptions').innerHTML = `
    <div onclick="goTo('#programming')">Programming</div>
    <div onclick="goTo('#webdevelopment')">Web Development</div>
    <div onclick="goTo('#scribbling')">Scribbling</div>
    <div onclick="goTo('#gallary')">Gallary</div>
    <div onclick="goTo('#posts')">Posts</div>
  `;
}

const menuToggle = document.getElementById('menu-toggle');
menuToggle.addEventListener('click', function() {
  this.classList.toggle('active');
  let element = document.getElementById('rightMenuOptions');
  if (window.getComputedStyle(element).getPropertyValue("display") === 'none'){
    document.getElementById('rightMenuOptions').style.display = 'block';
  } else {
    document.getElementById('rightMenuOptions').style.display = 'none';
  }
});

// function goToTo(path){
//   window.location.assign(path);
//   document.getElementById('moblie').classList.remove('hide');
//   document.getElementById('navigator').classList.add('hide');
// }

// function showMenu(){
//   document.getElementById('moblie').classList.add('hide');
//   document.getElementById('navigator').classList.remove('hide');
// }

// function hide(){
//   document.getElementById('moblie').classList.remove('hide');
//   document.getElementById('navigator').classList.add('hide');
// }





// function hideImageView(){
//   document.getElementById('imageview').classList.add('hide');
// }

// var images = [
//   'https://drive.google.com/uc?export=download&id=11vNrrxWdIBalmOtzHSl48G0By65oecql',
//   'https://drive.google.com/uc?export=download&id=133aBeYfYveZ7RjXYSbxeoEgQBSsylW1Y',
//   'https://drive.google.com/uc?export=download&id=11yBxD2JaudHfEYzv8LKKzp5jzKr9Ic_b',
//   'https://drive.google.com/uc?export=download&id=1224-pji1P-GuBBEnUI8INAmcartUk3lU',
//   'https://drive.google.com/uc?export=download&id=12WzAulmDTKUz68ZDErcEnAUguwaKvP7c',
//   'https://drive.google.com/uc?export=download&id=12eEZ-A29ickJBB0EepKkvnR-1KpdZpg7',
//   'https://drive.google.com/uc?export=download&id=12p1qyPDJjXqNx0_LbyKd4MBIMGo2dAVB',
//   'https://drive.google.com/uc?export=download&id=12xeiThi3j6hf6qGRJfXjUiEoxB7CUUfg'
// ]

// var doodles = [
//   'https://drive.google.com/uc?export=download&id=1xavCaAEFj40oPsrMPNGUQdGaK2FqPv_X',
//   'https://drive.google.com/uc?export=download&id=13U7eMtVgyQxl9rksscjv0o27yPlog7Ze',
//   'https://drive.google.com/uc?export=download&id=13YDwAQAQMcRt7mRh12qr3rDNtC--_D6H',
//   'https://drive.google.com/uc?export=download&id=13_IuH7dU1YELOfbYxZUSxgV7MOp6UNPo',
//   'https://drive.google.com/uc?export=download&id=13VYin15hHPmN7Y_ihVcz__vz_ZK0pTkp'
// ]

// function showIMG(type,id){
//   document.getElementById('imageview').classList.remove('hide');
//   if (type === 'img'){
//     var imgEl = `
//       <i onclick="hideImageView()" class="times fas fa-times"></i>
//       <img src="${images[id]}" alt="">
//     `
//     if (id === '0'){
//       imgEl += `
//         <i onclick="showIMG('img','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
//       `
//     }else if(id === '7'){
//       imgEl += `
//         <i onclick="showIMG('img','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
//       `
//     } else {
//       imgEl += `
//         <i onclick="showIMG('img','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
//         <i onclick="showIMG('img','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
//       `
//     }
//     document.getElementById('imageview').innerHTML = imgEl;
//   } else if (type === 'doodle'){
//     var imgEl = `
//       <i onclick="hideImageView()" class="times fas fa-times"></i>
//       <img src="${doodles[id]}" alt="">
//     `
//     if (id === '0'){
//       imgEl += `
//         <i onclick="showIMG('doodle','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
//       `
//     }else if(id === '4'){
//       imgEl += `
//         <i onclick="showIMG('doodle','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
//       `
//     } else {
//       imgEl += `
//         <i onclick="showIMG('doodle','${parseInt(id)-1}')" class="goleft fas fa-angle-left"></i>
//         <i onclick="showIMG('doodle','${parseInt(id)+1}')" class="goright fas fa-angle-right"></i>
//       `
//     }
//     document.getElementById('imageview').innerHTML = imgEl;
//   }
// }

// document.addEventListener('contextmenu', function(e) {
//   e.preventDefault();
// });

// document.onkeydown = function(e) {
//   if(event.keyCode == 123) {
//      return false;
//   }
//   if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
//      return false;
//   }
//   if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
//      return false;
//   }
//   if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
//      return false;
//   }
//   if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
//      return false;
//   }
// }
