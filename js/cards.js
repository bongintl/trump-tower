var element = document.querySelector('.bong-intl');

var state = 'bong-intl_article-open';

function setState( to ) {
    
    if(state === to) return;
    
    element.classList.remove(state);
    element.classList.add(to);
    
    state = to;
    
}

module.exports = {
    showArticle: () => setState('bong-intl__article-open'),
    showTower: () => setState('bong-intl__tower-open')
}