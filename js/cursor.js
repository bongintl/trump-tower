var PREFIXED_TRANSFORM = require('detectcss').prefixed('transform');

module.exports = function ( container ) {
    
    var element = document.createElement('div');
    element.classList.add('tower__cursor');
    
    container.appendChild( element );
    
    container.addEventListener('mousemove', e => {
        
        //if(e.target !== container) return;
        
        element.style[ PREFIXED_TRANSFORM ] = `translate( ${e.offsetX}px, ${e.offsetY}px )`;
        
    })
    
    var currClass = '';
    
    return {
        
        element,
        
        setClass: function( newClass ){
            
            if(newClass === currClass) return;
            
            if(currClass) element.classList.remove(currClass);
            
            if(newClass) element.classList.add(newClass);

            currClass = newClass;
            
        }
    }
    
}