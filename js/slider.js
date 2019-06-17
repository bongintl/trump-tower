var slider = document.querySelector('.tower__range');
var handle = document.querySelector('.tower__range-counter');

var mousedown = false;

var moveHandler, clickHandler;

handle.addEventListener('mousedown', mouseDown, false);

window.addEventListener('mouseup', mouseUp, false);

function getY( e ) {
    
    var {top, height} = slider.getBoundingClientRect();
    
    var y = (e.clientY - top) / height;
    
    y = Math.max( 0, Math.min(y, 1) );
    
    return 1 - y;
    
}

slider.addEventListener('click', e => {
    
    clickHandler( getY(e) );
    
});

function mouseUp() {
    window.removeEventListener('mousemove', counterMove, true);
}

function mouseDown(e) {
    window.addEventListener('mousemove', counterMove, true);
}

function counterMove(e) {
    
    e.preventDefault();
    
    moveHandler( getY(e) );
    
}

module.exports = {
    
    onMove: fn => {
        moveHandler = fn;
    },
    
    onClick: fn => {
        clickHandler = fn;
    },
    
    set: (y, label) => {
        
        handle.style.top = Math.max(1 - y, 0) * 100 + '%';
        
        if( typeof label !== 'number' ) {
            
            label = label.split('/');
            label = label[label.length - 1];
            label = parseInt(label);
            
        }
        
        handle.innerText = label;
        
    }
    
}
