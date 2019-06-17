var THREE = require('three');
require('three-canvas-renderer');
require('./vendor/css3drenderer.js');

var Promise = require('promise');
var eases = require('eases');
//var helvetiker = require('./lib/helvetiker_bold.typeface.json');
//var lubalin = require('./lib/lubalin-graph-bold.json');

var PREFIXED_TRANSFORM = require('detectcss').prefixed('transform');

var cursor = require('./cursor.js');
var textures = require('./textures.js');
var template = require('./template.js');
var tween = require('./lib/tween.js');
var { clamp, scale, findIndex } = require('./lib/utils.js');

var HAIR_RATIO = 530 / 1302;
var DEFAULT_ENV_MAP = 'assets/midtown.jpg';

var WEBGL_SUPPORT = (function () { 
  try {
    var canvas = document.createElement( 'canvas' );
    return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
  } catch(e) { 
    return false; 
  } 
})();

module.exports = class Tower {
    
    constructor ( container, data ) {
        
        this.container = container;
        this.data = data;
        
        this.elements = this.data.map(template);
        this.floors = [];
        this.envMaps = {};
        
        var renderer;
        
        if( WEBGL_SUPPORT ) {
            renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        } else {
            this.usingCanvas = true;
            renderer = new THREE.CanvasRenderer({antialias: true, alpha: true});
        }
        
        this.webGLRenderer = renderer;
        this.cssRenderer = new THREE.CSS3DRenderer();
        
        this.cssRenderer.domElement.classList.add( 'tower__css-renderer' );
        
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 30000);
        this.camera.position.z = 10000;
        
        this.pointLight = new THREE.PointLight( 0xffffff, 1, 0 );
        this.pointLight.position.set( 500, 0, 300 );
        this.scene.add( this.pointLight );
        
        this.ambientLight = new THREE.AmbientLight(0x555555);
        this.scene.add( this.ambientLight );
        
        this.raycaster = new THREE.Raycaster();
        
        this.tower = new THREE.Object3D();
        
        this.scene.add(this.tower);
        
        this.y = 0;
        this.floorHeight = 1;

        this.cursor = cursor( this.container );
        
    }
    
    loadEnvMap ( src ) {
        
        return new Promise( resolve => {
            
            if( this.envMaps[src] ) {
                
                resolve(this.envMaps[src]);
                
            } else {
                
                var img = new Image();
                
                img.onload = () => {
                    
                    var envMap = new THREE.CubeTexture([img, img, img, img, img, img]);
                    envMap.needsUpdate = true;
                    this.envMaps[src] = envMap;
                    resolve( envMap );
                    
                }
                
                img.src = src;

                
            }
            
        })
        
    }
    
    setEnvMap( src ) {
        
        if ( this.usingCanvas ) return;
        
        this.currEnvMap = src;
        
        return this.loadEnvMap( src )
            .then( envMap => {
                
                var phong = this.material.materials[0];
                
                if( phong.envMap && envMap.images[0].src === phong.envMap.images[0].src ) return;
                
                if(src !== this.currEnvMap) return;
                
                phong.envMap = envMap;
                phong.needsUpdate = true;
                
                this.material.materials[1].envMap = envMap;
                this.material.materials[1].needsUpdate = true;
                
                this.render();
                
            })
        
    }
    
    init () {
        
        var goldMaterial = new THREE.MeshPhongMaterial({
            color: 0xaa8800,
            specular: 0x888888,
            shininess: 100,
            overdraw: this.usingCanvas ? .5 : 0
        })
        
        this.material = new THREE.MultiMaterial([
            goldMaterial,
            new THREE.MeshPhongMaterial({
                color: 0xaa8800,
                map: textures.getMap( '#aa8800' ),
                normalMap: textures.getNormals(),
                specular: 0x888888,
                shininess: 100,
                overdraw: this.usingCanvas ? .5 : 0
            }),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                overdraw: this.usingCanvas ? .5 : 0
            })
        ]);
        
//         var textGeometry = [{
//             content: 'INSIDE',
//             font: helvetiker,
//             size: 25,
//             y: 0
//         },{
//             content: 'TRUMP',
//             font: lubalin,
//             size: 80,
//             y: 115
//         },{
//             content: 'TOWER',
//             font: lubalin,
//             size: 80,
//             y: 215
//         },{
//             content: 'THE SKYSCRAPER WHERE',
//             font: helvetiker,
//             size: 25,
//             y: 260
//         },{
//             content: 'TRUMP IS ALREADY KING',
//             font: helvetiker,
//             size: 25,
//             y: 300
//         }].map( line => {
//             var geometry = new THREE.TextGeometry( line.content, {
//                 font: new THREE.Font( line.font ),
//                 size: line.size,
//                 height: 20,
//                 curveSegments: 4
//             });
//             geometry.computeBoundingBox();
//             var {min, max} = geometry.boundingBox;
//             var w = max.x - min.x;
//             geometry.translate(-w/2, -line.y, 0);
// 			return geometry;
//         }).reduce((memo, geometry) => {
//             memo.merge(geometry);
//             return memo;
//         });
        
//         textGeometry.computeBoundingBox();
//         var {min, max} = textGeometry.boundingBox;
//         var cx = (max.x - min.x) / 2;
//         var cy = (max.y - min.y) / 2;
//         textGeometry.translate( -min.x - cx, -min.y - cy, 0 );
        
        var textGeometry = new THREE.JSONLoader().parse( require('./title.js').data ).geometry;
        
        textGeometry.computeBoundingBox();
        var {min, max} = textGeometry.boundingBox;
        
        //console.log(textGeometry.toJSON());
        
        this.textSize = new THREE.Vector2( max.x - min.x, max.y - min.y );
        this.text = new THREE.Mesh( textGeometry, goldMaterial );

        // this.hairMaterial = new THREE.SpriteMaterial({
        //     map: new THREE.TextureLoader().load('./assets/hair2.png'),
        //     color: 0xffff00
        // })
        
        // this.flagMaterial = new THREE.SpriteMaterial({
        //     map: new THREE.TextureLoader().load('./assets/flag.png')
        // })
        
        window.addEventListener( 'resize', this.onResize.bind(this) );
        this.webGLRenderer.domElement.addEventListener('click', this.onClick.bind(this) );
        this.webGLRenderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this) );
        this.container.appendChild( this.webGLRenderer.domElement );
        this.container.appendChild( this.cssRenderer.domElement );
        this.onResize( true );
        this.zoomIn();
        

    }
    
    zoomIn () {
        
        return tween( 5000, 0, 5000, 'cubicOut', z => {
            this.camera.position.z = z;
            this.render();
        })
        
    }
    
    onResize ( goToTop ) {
        
        var {width, height} = this.container.getBoundingClientRect();
        
        this.cssRenderer.setSize(width, height);
        this.webGLRenderer.setSize(width, height);
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.width = width;
        this.height = height;
        
        if( this.text && this.y === this.text.position.y ) goToTop = true;
        
        var prevPosition = this.y / this.floorHeight;
        
        this.demolish();
        this.build();
        this.setY( goToTop === true ? this.text.position.y : prevPosition * this.floorHeight );
        
    }
    
    getMouseIntersection ( e ) {
        
        e.preventDefault();
		
		var x = ( e.offsetX / this.width ) * 2 - 1;
		var y = - ( e.clientY / this.height ) * 2 + 1;
		
		var mouse = new THREE.Vector2(x, y);
		
        this.raycaster.setFromCamera( mouse, this.camera );
        
        var intersects = this.raycaster.intersectObjects( this.scene.children, true );
        
        return intersects[0] ? intersects[0].object : false;
        
    }
    
    onClick ( e ) {
        
        var object = this.getMouseIntersection( e );
        
        if( object ) {
            
            if( object.label === '3dfloor' ) {
                
                this.animateToName( object.parent.name );
                
            } else if(object.label === 'lobby') {
                
                this.animateTo( -this.floorHeight / 6, 400 )
                    .then(() => {
                        this.animateTo(0, 400)
                    })
                
            } else if ( object === this.text ) {
                
                this.animateTo(object.position.y);
                
            }
            
        }
        
    }
    
    onMouseMove ( e ) {
        
        var object = this.getMouseIntersection( e );
        
        var element = this.webGLRenderer.domElement;
        
        if(e.target !== element) return;
        
        if( 
            object &&
            object.label === '3dfloor' &&
            object.parent.position.y !== this.y
        ) {
            
            this.cursor.setClass(object.parent.position.y > this.y ? 'tower__cursor_up' : 'tower__cursor_down');
            
        } else {
            
            this.cursor.setClass('');
            
        }
        
    }
    
    demolish () {
        
        this.tower.remove( ...this.tower.children );
        
    }
    
    build () {
        
        var h = this.floorHeight = this.getFloorHeight();
        var w = this.width * .75;
        var z = -( this.height / 2 ) / Math.tan( THREE.Math.degToRad( this.camera.fov / 2 ) );
        
        this.floors = this.elements.map( (element, i) => {
            
            return this.createFloor( w, h, w, 0, i * h, z, i );
            
        });
        
        this.tower.add( ...this.floors );
        
        var lobby = this.create3dFloor( w, this.height, w, 0 );
        
        lobby.rotation.y = Math.PI;
        
        lobby.position.set(0, -h/2 - this.height/2, z - w/2 );
        
        lobby.label = 'lobby';
        
        this.tower.add( lobby );
        
        var roofY = this.floors[ this.floors.length - 1 ].position.y + this.floorHeight / 2;
        
        var textScale = this.width / this.textSize.x;
        
        this.text.scale.set( textScale, textScale, textScale );
        
        this.text.position.set( 0, roofY + this.textSize.y * textScale / 1.4, z - w / 2 );
    
        this.tower.add( this.text );

        // var flag = new THREE.Sprite( this.flagMaterial );
        
        // var flagWidth = this.width * .3;
        
        // flag.position.set(flagWidth / 2, topFloor.position.y + h/2 + flagWidth/2, topFloor.position.z);
        
        // flag.scale.set(flagWidth, flagWidth, 1);
        
        // flag.label = 'hair';
        
        // this.tower.add( flag );

        
        // var topFloor = this.floors[ this.floors.length - 1 ];

        // var hair = new THREE.Sprite( this.hairMaterial );
        
        // var hairHeight = this.width * HAIR_RATIO;
        
        // hair.position.set(0, topFloor.position.y + h/2 + hairHeight/2, topFloor.position.z);
        
        // hair.scale.set(this.width, hairHeight, 1);
        
        // hair.label = 'hair';
        
        // this.tower.add( hair );
        
    }
    
    getFloorHeight () {
        
        return this.elements.reduce( (memo, element) => {
            
            this.container.appendChild( element );
            
            element.style[ PREFIXED_TRANSFORM ] = '';
            element.style.height = '';
            
            var {height} = element.getBoundingClientRect();
            
            return Math.max( height, memo );
            
        }, 0 );
        
    }
    
    createFloor ( w, h, d, x, y, z, i ) {
        
        var group = new THREE.Object3D();
        
        group.add( this.create3dFloor( w, h, d, i ) );
        group.add( this.createDOMWall( i, h, d/2 ) )
        
        group.position.set( x, y, z - d/2 );
        
        group.name = this.data[i].name;
        
        group.label = 'floor';
        
        return group;
        
    }
    
    create3dFloor ( w, h, d, i ) {
        
        var geometry = new THREE.BoxGeometry( w, h, d );
        
        geometry.faces.forEach( (face, i) => {
            
            if( [4,5,6,7].indexOf(i) > -1 ) {
                face.materialIndex = 0;
            } else if ( [8,9].indexOf(i) > -1 ) {
                face.materialIndex = 2;
            } else {
                face.materialIndex = 1;
            }
            
        });
        
        var mesh = new THREE.Mesh(geometry, this.material);
        
        mesh.label = '3dfloor';
        
        return mesh;
        
    }
    
    createDOMWall ( i, h, z ) {
        
        var element = this.elements[i];
        
        element.style.height = h + 'px';
        
        var object = new THREE.CSS3DObject( element );
        
        object.position.z = z;
        
        return object;
        
    }
    
    createFloorNumber () {}

    render () {
        
        this.webGLRenderer.render( this.scene, this.camera );
        this.cssRenderer.render( this.scene, this.camera );
        
    }
    
    setY ( y ) {
        
        this.camera.position.y = y;
        this.pointLight.position.y = y;
        
        var topFloorY = this.floors[ this.floors.length - 1 ].position.y;
        
        var overTop = Math.max( y - topFloorY, 0 ) / (this.height/4) + 1;
        
        var range = this.height * .5// * overTop;
        var deg90 = Math.PI / 2;
        
        this.tower.children.forEach( obj => {
            
            if(obj.label === 'lobby') return;
            
            var d = obj.position.y - y;
            var r = Math.abs(d) / range;
            
            if(obj.label === 'floor') r = Math.max(0, Math.min( eases.expoOut( r ), 1 ) );
            r *= deg90;
            
            if(d < 0) r = -r;
            
            obj.rotation.y = r;
                
        });
        
        var topFloorY = this.floors[ this.floors.length - 1 ].position.y;
        
        //this.text.rotation.y = (y - topFloorY) / -50;
        
        var floorIndex = Math.min( Math.round( y / this.floorHeight ), this.floors.length - 1 );
        
        var person = this.data[ floorIndex ];
        
        this.onPositionChange( y / topFloorY, person.floor );
        
        this.y = y;
        
        var image = person && person.image;
        
        this.setEnvMap( image || DEFAULT_ENV_MAP );
        
        this.render();
        
    }
    
    animateTo( y, speed ) {
        
        var d = Math.abs(this.y - y);
        
        return tween( 'animateTower', this.y, y, Math.max(d, speed || 800), 'cubicInOut', x => this.setY(x) );
        
    }
    
    animateToName( name ) {
        
        var idx = findIndex( this.data, d => d.name === name );
        
        var image = this.data[idx].image;
        
        return this.animateTo( this.floorHeight * idx );
        
    }
    
}