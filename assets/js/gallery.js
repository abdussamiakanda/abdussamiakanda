function goTo(path){
  window.location.assign(path);
}

var gallery = document.querySelector('#gallery');
var getVal = function (elem, style) { return parseInt(window.getComputedStyle(elem).getPropertyValue(style)); };
var getHeight = function (item) { return item.querySelector('.content').getBoundingClientRect().height; };
var resizeAll = function () {
    var altura = getVal(gallery, 'grid-auto-rows');
    var gap = getVal(gallery, 'grid-row-gap');
    gallery.querySelectorAll('.gallery-item').forEach(function (item) {
        var el = item;
        el.style.gridRowEnd = "span " + Math.ceil((getHeight(item) + gap) / (altura + gap));
    });
};

gallery.querySelectorAll('img').forEach(function (item) {
    item.classList.add('byebye');
    if (item.complete) {
        console.log(item.src);
    }
    else {
        item.addEventListener('load', function () {
            var altura = getVal(gallery, 'grid-auto-rows');
            var gap = getVal(gallery, 'grid-row-gap');
            var gitem = item.parentElement.parentElement;
            gitem.style.gridRowEnd = "span " + Math.ceil((getHeight(gitem) + gap) / (altura + gap));
            item.classList.remove('byebye');
        });
    }
});

window.addEventListener('resize', resizeAll);

gallery.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
        showItem(item);
    });
});

var currentItem = '';

document.getElementById('canvas').addEventListener('click', function () {
    document.getElementById('insider').innerHTML = '';
    document.getElementById('leftSlider').innerHTML = '';
    document.getElementById('rightSlider').innerHTML = '';
})

function showItem(item) {
    currentItem = item;
    const imageSrc = item.querySelector('img').getAttribute('src');
    const nextItem = item.nextElementSibling;
    const prevItem = item.previousElementSibling;

    document.getElementById('insider').innerHTML = `
        <div class="gallery-item full">
            <div class="content"><img src="${imageSrc}" alt=""></div>
        </div>
    `;
    document.getElementById('leftSlider').innerHTML = `
        ${prevItem ? `<div class="slider left-slider"><i class="fas fa-chevron-left"></i></div>` : ''}
    `;
    document.getElementById('rightSlider').innerHTML = `
        ${nextItem ? '<div class="slider right-slider"><i class="fas fa-chevron-right"></i></div>' : ''}
    `;
}

document.getElementById('leftSlider').addEventListener('click', function (e) {
    e.stopPropagation();
    showPrevItem(currentItem);
})

document.getElementById('rightSlider').addEventListener('click', function (e) {
    e.stopPropagation();
    showNextItem(currentItem);
})

function showPrevItem(item) {
    const prevItem = item.previousElementSibling;
    showItem(prevItem);
}

function showNextItem(item) {
    const nextItem = item.nextElementSibling;
    showItem(nextItem);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight' && document.getElementById('insider').innerHTML !== '') {
        const nextItem = currentItem.nextElementSibling;
        showItem(nextItem);
    } else if (event.key === 'ArrowLeft' && document.getElementById('insider').innerHTML !== '') {
        const prevItem = currentItem.previousElementSibling;
        showItem(prevItem);
    } else if (event.key === 'Escape' && document.getElementById('insider').innerHTML !== '') {
        document.getElementById('insider').innerHTML = '';
        document.getElementById('leftSlider').innerHTML = '';
        document.getElementById('rightSlider').innerHTML = '';
    }
});
