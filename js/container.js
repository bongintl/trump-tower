var outer = document.querySelector('.bong-intl');
var inner = outer.querySelector('.tower');

var currClass = 'tower_abs-top';

function onScroll() {
    
    var scrollTop = window.pageYOffset;
    var scrollBottom = scrollTop + window.innerHeight;
    
    var containerTop = outer.offsetTop;
    var containerBottom = containerTop + outer.clientHeight;
    
    var newClass;
    
    if(window.innerWidth <= 768) {
        
        newClass = 'tower_fixed';
        
    } else if ( scrollTop < containerTop ) {
        
        newClass = 'tower_abs-top';
        
    } else if ( scrollBottom > containerBottom ) {
        
        newClass = 'tower_abs-bottom';
        
    } else {
        
        newClass = 'tower_fixed';
        
    }
    
    if( newClass !== currClass ) {
        
        inner.classList.remove( currClass );
        inner.classList.add( newClass );
        
        currClass = newClass;
        
    }
    
}

document.addEventListener('scroll', onScroll);
document.addEventListener('DOMContentLoaded', onScroll);
