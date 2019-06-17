function clamp(x, min, max){
	return Math.max( min, Math.min( x, max ) );
}

function normalize(x, min, max){
	return (x-min) / (max-min);
}

function scale(x, oldMin, oldMax, newMin, newMax){
    if( !(oldMin === 0 && oldMax === 1) ){
        x = normalize(x, oldMin, oldMax);
    }
    return newMin + x * (newMax - newMin);
}

function findIndex( arr, fn ) {
    
    for(var i = 0; i < arr.length; i++) {
        
        if( fn( arr[i], i ) ) return i;
        
    }
    
    return -1;
    
}

module.exports = { clamp, normalize, scale, findIndex };