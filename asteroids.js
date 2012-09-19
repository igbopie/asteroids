

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
var PhysicObject = function(size,position,acceleration,rotation,speed,shape){
    this.size=size;
    this.position=position;
    this.acceleration=acceleration;
    this.rotation=rotation;
    this.speed=speed;
    this.shape=shape;
}
PhysicObject.prototype = {
size:0,
position:new Cartesian(0,0),
acceleration:0,
rotation:0,
speed:new Cartesian(0,0),
calcNewPosition:function(time){
    // d=vi*t+1/2*a*t^2
    var acceleration=new Polar(this.acceleration,this.rotation).toCartesian();
    this.position.x=this.speed.x*time+1/2*acceleration.x*time*time+this.position.x;
    this.position.y=this.speed.y*time+1/2*acceleration.y*time*time+this.position.y;
},
calcNewSpeed:function(time){
    // vf=vi+a*t
    var acceleration=new Polar(this.acceleration,this.rotation).toCartesian();
    this.speed.x=this.speed.x+acceleration.x*time;
    this.speed.y=this.speed.y+acceleration.y*time;
},
doPhysics:function(time){
    this.calcNewPosition(time);
    this.calcNewSpeed(time);
},
paint:function(context){
    context.strokeStyle = 'green';
    context.lineWidth   = 2;
   
    context.beginPath();
    
    var firstPoint=null;
    for(index in this.shape){
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
    context.closePath();
},
log:function(){
    return "X:"+this.position.x+"<br />"+
            "Y:"+this.position.y+"<br />"+
            "Acc:"+this.acceleration+"<br />"+
            "Speed:"+this.speed.toPolar().r;
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
var ship=new PhysicObject(shipSize,new Cartesian(100,100),0,.4,new Cartesian(.01,0.01),[new Cartesian(+shipSize,0),
                                                                            new Cartesian(-shipSize,-2*shipSize/3),
                                                                            new Cartesian(-shipSize,+2*shipSize/3)]);

var forwardFire=new PhysicObject(shipSize,new Cartesian(100,100),0,0,new Cartesian(0,0),[new Cartesian(-ship.size,-ship.size/2),
                                                                                   new Cartesian(-ship.size-20,0),
                                                                                   new Cartesian(-ship.size,+ship.size/2)]);
var brakeFire=new PhysicObject(shipSize,new Cartesian(100,100),0,0,new Cartesian(0,0), [new Cartesian(-ship.size,-ship.size/2),
                                                                                  new Cartesian(-ship.size+20,0),
                                                                                  new Cartesian(-ship.size,+ship.size/2)]);

var asteroid1=new PhysicObject(20,new Cartesian(0,0),0,0,new Cartesian(.05,.01), [new Cartesian(-10,10),
                                                                                  new Cartesian(5,20),
                                                                                  new Cartesian(10,20),
                                                                                  new Cartesian(10,5),
                                                                                  new Cartesian(20,-10),
                                                                                  new Cartesian(10,-20),
                                                                                  new Cartesian(5,-10),
                                                                                  new Cartesian(-10,-20),
                                                                                  new Cartesian(-10,-10),
                                                                                  new Cartesian(-5,5)]);

var asteroid2=new PhysicObject(20,new Cartesian(0,0),0,1,new Cartesian(-.06,-.01), [new Cartesian(-110,100),
                                                                                  new Cartesian(70,230),
                                                                                  new Cartesian(110,180),
                                                                                  new Cartesian(120,80),
                                                                                  new Cartesian(190,-90),
                                                                                  new Cartesian(110,-220),
                                                                                  new Cartesian(50,-120),
                                                                                  new Cartesian(-120,-200),
                                                                                  new Cartesian(-110,-100),
                                                                                  new Cartesian(-30,50)]);




var asteroids=[asteroid1,asteroid2];
// SIMULATOR MODEL
var time=new Date().getTime();
var diffTime=0;
var context;
var canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight-10;

window.addEventListener('keydown',doKeyDown,false);
window.addEventListener('keyup',doKeyUp,false);

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
        
        setInterval(gameLoop,1/60*1000);
        
    }
}

function doKeyUp(evt){
    ship.acceleration=0;
    shipRotationAcc=0;
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
    
    clear();
    physics(ship);
    for(index in asteroids){
        physics(asteroids[index]);
        asteroids[index].paint(context);
    }
    
    drawShip();
    
    
    
    
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



