var element = document.createElement('ul');
element.classList.add('tower__nav');

var lis = [];

var selectedLi = -1;

function create(data, onClick){
    
    var tooltip = document.createElement('div');
    
    tooltip.classList.add('tower__tooltip');
    
    element.appendChild(tooltip);
    
    lis = data.map( resident => {
    
        var li = document.createElement('li');
        
        li.classList.add('tower__nav-item')
        
        var floor = document.createElement('span');
        floor.innerText = resident.floor;
        floor.classList.add('tower__nav-floor');
        floor.addEventListener('mouseenter', () => li.classList.add('tower__nav-item_hover'))
        floor.addEventListener('mouseleave', () => li.classList.remove('tower__nav-item_hover'))
        
        var name = document.createElement('span');
        name.innerText = resident.name;
        name.classList.add('tower__nav-name');
        
        li.appendChild( floor );
        li.appendChild( name );
        
        li.addEventListener('click', () => onClick(resident) );
        
        // li.addEventListener('mouseenter', () => {
        //     tooltip.innerText = resident.name;
        //     tooltip.classList.add('tower__tooltip_visible');
        // })
        // li.addEventListener('mouseleave', () => tooltip.classList.remove('tower__tooltip_visible') )
        // li.addEventListener('mousemove', () => tooltip.classList.remove('tower__tooltip_visible') )
        
        element.appendChild( li );
        
        return li;
        
    })
    
    lis.map(x => x).reverse().forEach( li => element.appendChild(li) );
    
}

function select( i ) {
    
    if( i !== selectedLi ) {
        
        if( lis[selectedLi] ) lis[selectedLi].classList.remove('tower__nav-item_selected');
        lis[i].classList.add('tower__nav-item_selected');
        selectedLi = i;
        
    }

    
}

module.exports = {create, select, element};