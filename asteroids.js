

// MODEL

//--------------------------------------------
// CLASS CARTESIAN
//--------------------------------------------
var Cartesian =function(x,y){
    this.x=x;
    this.y=y;
}

Cartesian.prototype ={
    x: 0,
    y: 0,
    toPolar: function(){
        var r = Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
        var theta = Math.atan2(this.y, this.x);
        return new Polar(r,theta);
    },
    addAngle:function(angle){
        var polar=this.toPolar();
        polar.theta=polar.theta+angle;
        var aux=polar.toCartesian();
        this.x=aux.x;
        this.y=aux.y;
    },
    add:function(cartesian){
        this.x+=cartesian.x;
        this.y+=cartesian.y;
    },
    clone:function(){
        return new Cartesian(this.x,this.y);
    }
}

//--------------------------------------------
// CLASS POLAR
//--------------------------------------------
var Polar = function(r,theta){
    this.r=r;
    this.theta=theta;
}

Polar.prototype ={
theta: 0,
r: 0,
toCartesian: function(){
    var x=this.r * Math.cos(this.theta);
    var y=this.r * Math.sin(this.theta);
    return new Cartesian(x,y);
}
}

//--------------------------------------------
// CLASS PhysicObject
//--------------------------------------------
var PhysicObject = function(size,position,acceleration,rotation,speed,shape,lineWidth){
    this.size=size;
    this.position=position;
    this.acceleration=acceleration;
    this.rotation=rotation;
    this.speed=speed;
    this.shape=shape;
    this.lineWidth=lineWidth;
}
PhysicObject.prototype = {
    size:0,
    position:new Cartesian(0,0),
    acceleration:0,
    rotation:0,
    speed:new Cartesian(0,0),
    ttl:-1,
    resistance:0,
    limitSpeed:false,
    calcNewPosition:function(time){
        // d=vi*t+1/2*a*t^2
        var acceleration=new Polar(this.acceleration,this.rotation).toCartesian();
        var speed=this.speed.toPolar();
        if(speed.r>0){
            var resistance=new Polar(-this.resistance*speed.r,speed.theta).toCartesian();
            acceleration.add(resistance);
        }
        this.position.x=this.speed.x*time+1/2*acceleration.x*time*time+this.position.x;
        this.position.y=this.speed.y*time+1/2*acceleration.y*time*time+this.position.y;
    },
    calcNewSpeed:function(time){
        // vf=vi+a*t
        var acceleration=new Polar(this.acceleration,this.rotation).toCartesian();
        var speed=this.speed.toPolar();
        if(speed.r>0){
        	
            var resistance=new Polar(-this.resistance*speed.r,speed.theta).toCartesian();
            acceleration.add(resistance);
        }
        this.speed.x=this.speed.x+acceleration.x*time;
        this.speed.y=this.speed.y+acceleration.y*time;
    
        if(this.limitSpeed){
            speed=this.speed.toPolar();
            if(speed.r > .7){
                speed.r=.7;
                this.speed=speed.toCartesian();
            }
        }
    
    },
    doPhysics:function(time){
        this.calcNewSpeed(time);
        this.calcNewPosition(time);
    },
    paint:function(context){
        
        if(this.collides()){
            context.fillStyle = 'red';
            context.fillRect(this.position.x-5, this.position.y-5, 10, 10);
        }
        
        context.strokeStyle = 'green';
        context.fillStyle='transparent';
        context.lineWidth   = this.lineWidth;
    
        var firstPoint=null;
        
        for(var index in this.shape){
            //never change shape
            var point=this.shape[index].clone();
            //ROTATION
            point.addAngle(this.rotation);
            //LOCATION
            point.add(this.position);
            //PAINT
            if(firstPoint == null){
                firstPoint=point;
                context.moveTo(firstPoint.x,firstPoint.y);
            }else{
                context.lineTo(point.x,point.y);
            }
        
        }
        //Close Path
        context.lineTo(firstPoint.x,firstPoint.y);
        context.fill();
        context.stroke();
        
    },
    collides:function(){
        for(var index in this.shape){
            var point=this.shape[index].clone();
            //ROTATION
            point.addAngle(this.rotation);
            //LOCATION
            point.add(this.position);
            //Colission
            if(isColission(point)){
                return true;
            }
        }
        return false;
    }
    ,
    log:function(){
        return "X:"+this.position.x+"<br />"+
            "Y:"+this.position.y+"<br />"+
            "Acc:"+this.acceleration+"<br />"+
            "Speed:"+this.speed.toPolar().r+"<br />"+
            "Points:"+points+"<br />";
    }
}
//--------------------------------------------
//--------------------------------------------
//END MODEL
//--------------------------------------------
//--------------------------------------------




// SHIP MODEL
var shipRotationAcc=0;
var shipSize=20;
var clickX=100;
var clickY=100;
var points=0;
var ship=new PhysicObject(shipSize,new Cartesian(100,100),0,0,new Cartesian(0,0),[new Cartesian(+shipSize,0),
                                                                            new Cartesian(-shipSize,-2*shipSize/3),
                                                                            new Cartesian(-shipSize,+2*shipSize/3)],2);
ship.resistance=.0015;
ship.limitSpeed=true;

var forwardFire=new PhysicObject(shipSize,new Cartesian(100,100),0,0,new Cartesian(0,0),[new Cartesian(-ship.size,-ship.size/2),
                                                                                   new Cartesian(-ship.size-20,0),
                                                                                   new Cartesian(-ship.size,+ship.size/2)],2);
var brakeFire=new PhysicObject(shipSize,new Cartesian(100,100),0,0,new Cartesian(0,0), [new Cartesian(-ship.size,-ship.size/2),
                                                                                  new Cartesian(-ship.size+20,0),
                                                                                  new Cartesian(-ship.size,+ship.size/2)],2);

brakeFire.collides = function(){
    return false;
}
forwardFire.collides = function(){
    return false;
}

var asteroid1Shape=[new Cartesian(-10,10),
                      new Cartesian(5,20),
                      new Cartesian(10,20),
                      new Cartesian(10,5),
                      new Cartesian(20,-10),
                      new Cartesian(10,-20),
                      new Cartesian(5,-10),
                      new Cartesian(-10,-20),
                      new Cartesian(-10,-10),
                      new Cartesian(-5,5)];
var asteroid1=new PhysicObject(20,new Cartesian(200,200),0,0,new Cartesian(0.06,0.02), asteroid1Shape,2);

var asteroid2=new PhysicObject(20,new Cartesian(200,200),0,1,new Cartesian(-.06,-.01), [new Cartesian(-110,100),
                                                                                  new Cartesian(70,230),
                                                                                  new Cartesian(110,180),
                                                                                  new Cartesian(120,80),
                                                                                  new Cartesian(190,-90),
                                                                                  new Cartesian(110,-220),
                                                                                  new Cartesian(50,-120),
                                                                                  new Cartesian(-120,-200),
                                                                                  new Cartesian(-110,-100),
                                                                                  new Cartesian(-30,50)],2);
                                                                                  
                                                       


var asteroids=new Array();//=[asteroid1];//,asteroid2];
var shoots=new Array();
// SIMULATOR MODEL
var time=new Date().getTime();
var diffTime=0;
var context;
var canvas = document.getElementById('myCanvas');
var FPS=40;
var jsInterval;
var nAsteroids=5;
var nAsteroidsLeft;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight-10;

window.addEventListener('keydown',doKeyDown,false);
window.addEventListener('keyup',doKeyUp,false);

window.addEventListener('click',onclick,false);

// Always check for properties and methods, to make sure your code doesn't break
// in other browsers.
if (canvas && canvas.getContext) {
    // Get the 2d context.
    // Remember: you can only initialize one context per element.
    context = canvas.getContext('2d');
    if (context) {
        
        canvas.style.height=""+canvas.height+"px";
        canvas.style.width=""+canvas.width+"px";
        
        canvas.width=canvas.width * window.devicePixelRatio;
        canvas.height= canvas.height * window.devicePixelRatio;
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        ramdomizeAsteroids();
        
        ship.position.x = canvas.width /(2*window.devicePixelRatio);
        ship.position.y = canvas.height /(2*window.devicePixelRatio);
        
        jsInterval=setInterval(gameLoop,1/FPS*1000);
        
        //gameLoop();
        
    }
}

function doKeyUp(evt){
    switch (evt.keyCode) {
        case 38:  /* Up arrow was pressed */
        case 40:  /* Down arrow was pressed */
            ship.acceleration=0;
            break;
        case 37:  /* Left arrow was pressed */
        case 39:  /* Right arrow was pressed */
            shipRotationAcc=0;
            break;
    }
}

function doKeyDown(evt){
    switch (evt.keyCode) {
        case 38:  /* Up arrow was pressed */
            ship.acceleration=.001;
            break;
        case 40:  /* Down arrow was pressed */
            ship.acceleration=-.001;
            break;
        case 37:  /* Left arrow was pressed */
            shipRotationAcc=-1;
            break;
        case 39:  /* Right arrow was pressed */
            shipRotationAcc=1;
            break;
        case 32: /* space */
            var sp=ship.speed.toPolar();
            sp.r=sp.r+.5;
            sp.theta=ship.rotation;
            var shoot=new PhysicObject(1,ship.position.clone(),0,0,sp.toCartesian(), [new Cartesian(1,1),
                                                                                      new Cartesian(1,-1),
                                                                                      new Cartesian(-1,-1),
                                                                                      new Cartesian(-1,1),
                                                                                      ],2);
            shoot.ttl=800;
            shoots.push(shoot);
           
            break;

    }
}


function ramdomizeAsteroids(){
	asteroids=new Array();
	nAsteroidsLeft=nAsteroids;
	for(var i=0;i<nAsteroids;i++){
		var x=Math.floor(Math.random()*canvas.width/ window.devicePixelRatio);
		var spX=Math.random()/20;
		var y=Math.floor(Math.random()*canvas.height/ window.devicePixelRatio);
		
		var spY=Math.random()/20;
		
		if(Math.random()>0.5){
			spX*=-1;
		}
		if(Math.random()>0.5){
			spY*=-1;
		}
		
		var rotation=Math.random();
		
	
	
		asteroids.push(new PhysicObject(20,new Cartesian(x,y),0,rotation,new Cartesian(spX,spY), asteroid1Shape,2));
	}
	
	
	
	
}


function clear() {
    context.clearRect(0, 0, canvas.width , canvas.height);
}

function gameLoop(){
    
	var newtime=new Date().getTime()
	diffTime=newtime-time;
	time=newtime;
	
	ship.rotation+=0.1*shipRotationAcc;
	
	collisionDetection();
	clear();
	context.beginPath();
	
	physics(ship);
	
	// Then asteroids
	
	for(var index in asteroids){
	    var asteroid=asteroids[index];
	    if(asteroid != undefined){
	        physics(asteroid);
	        asteroid.paint(context);
	    }
	}
	
	//drawColissionMap();
	
	// Then Ships
	//if(ship.collides()){
	drawShip();
	//clearInterval(jsInterval);
	//}
	
	// First paint shoots
	for(var index in shoots){
	    var shoot=shoots[index];
	    shoot.ttl-=diffTime;
	    if(shoot.ttl<0){
	        delete shoots[index];
	    }
	    if(shoot != undefined){
	        physics(shoot);
	        shoot.paint(context);
	    }
	}
	
	
	if(nAsteroidsLeft== 0){
	  nAsteroids++;
	  ramdomizeAsteroids();
	}
	
	
	context.closePath();
    
}
function collisionDetection(){
    for(var asteroidsIndex in asteroids){
        var asteroid=asteroids[asteroidsIndex];
        
        clear();
        context.beginPath();
        asteroid.paint(context);
        for(var shootsIndex in shoots){
            var shoot=shoots[shootsIndex];
            if(shoot != undefined && shoot.collides()){
                delete asteroids[asteroidsIndex];
                nAsteroidsLeft--;
                points+=20;
            }
        }
        context.closePath();
    }
}
function physics(object){
    
    object.doPhysics(diffTime);
    
    if(object.position.x<0){
        object.position.x=canvas.width/window.devicePixelRatio;
    }
    if(object.position.x>canvas.width/window.devicePixelRatio){
        object.position.x=0;
    }
    
    if(object.position.y<0){
        object.position.y=canvas.height/window.devicePixelRatio;
    }
    if(object.position.y>canvas.height/window.devicePixelRatio){
        object.position.y=0;
    }
    
}
function drawShip(){
    // SHAPE
    ship.paint(context);
    
    //FIRE
    
    
    if(ship.acceleration < 0 && time%2==0){
        brakeFire.position=ship.position;
        brakeFire.rotation=ship.rotation;
        brakeFire.paint(context);
    }else if(ship.acceleration > 0 && time%2==0){
        forwardFire.position=ship.position;
        forwardFire.rotation=ship.rotation;
        forwardFire.paint(context);
    }
    
    //Log
    document.getElementById("log").innerHTML=ship.log();
}

function isColission(point){
    return context.isPointInPath(point.x*window.devicePixelRatio,point.y*window.devicePixelRatio)?true:false;
}

function drawColissionMap(){
    for (clickX=0;clickX<canvas.width;clickX=clickX+5)
    {
        for (clickY=0;clickY<canvas.height;clickY=clickY+5)
        {
            if(isColission(new Cartesian(clickX,clickY))) {
                //alert(clickX+" "+clickY);
                var blockColour = "rgb(255, 0, 0)";
            }
            else {
                var blockColour = "rgb(0, 255, 0)";
            }
            context.fillStyle = blockColour;
            context.fillRect(clickX-5/2, clickY-5/2, 5, 5);
        }
    }
    
}


