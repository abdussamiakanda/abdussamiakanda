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
  if (path[0] === '#') {
    document.getElementById('menu-toggle-click').click;
  }
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
    <div onclick="goTo('#teaching')">Teaching Experience</div>
    <div onclick="goTo('#education')">Education</div>
    <div onclick="goTo('#skillset')">Skillset</div>
    <div onclick="goTo('#co-curricular-activities')">Co-curricular Activities</div>
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
    <div onclick="goTo('#curations')">Curations</div>
    <div onclick="goTo('#gallary')">Gallary</div>
    <div onclick="goTo('#posts')">Posts</div>
  `;
}

document.addEventListener("click", function(evt) {
  let flyoutEl = document.getElementById('menu-toggle-click'),
    targetEl = evt.target,
    element = document.getElementById('rightMenuOptions');
  do {
    if(targetEl == flyoutEl) {
      document.getElementById('menu-toggle').classList.toggle('active');
      if (window.getComputedStyle(element).getPropertyValue("display") === 'none'){
        document.getElementById('rightMenuOptions').style.display = 'block';
      } else {
        document.getElementById('rightMenuOptions').style.display = 'none';
      }
      return;
    }
    targetEl = targetEl.parentNode;
  } while (targetEl);
  if (window.getComputedStyle(element).getPropertyValue("display") === 'block'){
    document.getElementById('rightMenuOptions').style.display = 'none';
    document.getElementById('menu-toggle').classList.toggle('active');
  }
});


// var doodles = [
//   'https://drive.google.com/uc?export=download&id=1xavCaAEFj40oPsrMPNGUQdGaK2FqPv_X',
//   'https://drive.google.com/uc?export=download&id=13U7eMtVgyQxl9rksscjv0o27yPlog7Ze',
//   'https://drive.google.com/uc?export=download&id=13YDwAQAQMcRt7mRh12qr3rDNtC--_D6H',
//   'https://drive.google.com/uc?export=download&id=13_IuH7dU1YELOfbYxZUSxgV7MOp6UNPo',
//   'https://drive.google.com/uc?export=download&id=13VYin15hHPmN7Y_ihVcz__vz_ZK0pTkp'
// ]

