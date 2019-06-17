window.THREE = require('three');

require('./container.js');

var data = require('./data.js');
var Tower = require('./tower.js');
var cards = require('./cards.js');
var slider = require('./slider.js');

var towerElement = document.querySelector('.tower');
var articleElement = document.querySelector('.article');

var tower = window.tower = new Tower( towerElement, data );

[].forEach.call( articleElement.querySelectorAll('a'), a => {
    
    var name = a.getAttribute('data-name');
    
    if(!name) return;
    
    a.addEventListener('click', e => {
        e.stopPropagation();
        cards.showTower();
        tower.animateToName(name)
    });
    
});

slider.onMove( y => {
    tower.setY( y * tower.floors[ tower.floors.length - 1 ].position.y );
});

slider.onClick( y => {
    
    var towerY = y * tower.floors[ tower.floors.length - 1 ].position.y;
    towerY /= tower.floorHeight;
    towerY = Math.round(towerY);
    towerY *= tower.floorHeight;
    tower.animateTo( towerY );
})

tower.onPositionChange = slider.set;

towerElement.addEventListener('click', cards.showTower)
articleElement.addEventListener('click', cards.showArticle)

tower.init();