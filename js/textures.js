var THREE = require('three');

var TEXTURE_WIDTH = 512;
var TEXTURE_HEIGHT = 32;
var LINES = 5;
//var BACKGROUND_COLOR = 'gold';
var LINE_COLOR = 'black';
var LINE_WIDTH = 1;

function canvasToTexture(canvas) {
    
    var texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;
    return texture;
    
}

function getCanvas( fill ) {
    
    var canvas = document.createElement('canvas');
    
    canvas.width = TEXTURE_WIDTH;
    canvas.height = TEXTURE_HEIGHT;
    
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return [ canvas, ctx ];

}

function drawLines( ctx, offset ) {
    
    ctx.beginPath();
    
    for( var i = 1; i < LINES; i++ ) {
        
        let x = (TEXTURE_WIDTH / LINES) * i + offset;
        
        ctx.moveTo( x, 0 );
        ctx.lineTo( x, TEXTURE_HEIGHT );
        
    }
    
    ctx.stroke();

}

function getMap( color ) {
    
    var [canvas, ctx] = getCanvas( color );
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    
    drawLines(ctx, 0);
    
    return canvasToTexture( canvas );
    
}

function getNormals() {
    
    var [canvas, ctx] = getCanvas( 'rgb(128,128,255)' );
    
    ctx.lineWidth = LINE_WIDTH * 1.5;
    
    ctx.strokeStyle = 'rgb(242,128,185)';
    drawLines( ctx, LINE_WIDTH * -.75 );

    ctx.strokeStyle = 'rgb(13,128,185)';
    drawLines( ctx, LINE_WIDTH * .75 );
    
    return canvasToTexture( canvas );
    
}

module.exports = {getMap, getNormals};