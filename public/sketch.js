// Create a new connection using socket.io (imported in index.html)
let socket = io();
let fps = 20;
let welcomeMessage = ["imagine that","there was no pandemic","there was no lockdown","and you could travel","travel everywhere","where would you go?"]
let secondsPerMessage = 2.5;
let world, paintheadmenu, win95topright;
let cameraPosition = [2000,500];
let cameraZoom = 4;
let cameraSpeed = [10,10,-0.1];
let lastMousePos = [-1,-1];
let paletteColors;
let selectedTool = 0; // TB a number
let eTools = [];
let drawingData = [];

// define the function that will be called on a new newConnection
socket.on("connect", newConnection);

class editingTool {
  constructor(pos = [0,0], type = "palette", color = color(200), selected = false) {
    this.color = color;
    this.pos = pos;
    this.width = 48;
    this.bdist = 8;
    this.bangle = random(0,2*PI);
    this.bwidth = 60;
    this.brotsp = random([-1,1])*random(0.2,1)*PI/4/fps;
    this.selected = selected;
    this.type = type;
  }
  printout() {
    this.bangle += this.brotsp; // rotate border
    push();
    noStroke();
    fill(0);
    if (this.selected) {
      stroke(255);
      strokeWeight(2);
    }
    ellipse(this.pos[0]+this.bdist*cos(this.bangle),windowHeight+this.pos[1]+this.bdist*sin(this.bangle),this.bwidth);
    fill(this.color);
    ellipse(this.pos[0],windowHeight+this.pos[1],this.width);

    if (this.type == "move") {
      stroke(0);
      fill(0);
      line(this.pos[0]-this.width/3,this.pos[1],this.pos[0]+this.width/3,this.pos[1]);
      line(this.pos[0],this.pos[1]-this.width/3,this.pos[0],this.pos[1]+this.width/3);
    }

    if (this.isHover()) {
      stroke(255);
      fill(255,255,255,150);
      ellipse(this.pos[0],windowHeight+this.pos[1],this.width);
    }
    pop();
  }
  isHover() {
    let result = false;
    if (dist(mouseX,mouseY,this.pos[0],windowHeight+this.pos[1]) <= this.width/2) {
      result = true;
    }
    return result;
  }
}

function newConnection() {
  console.log("your id:", socket.id);
}

// Define which function should be called when a new message
// comes from the server with type "mouseBroadcast"

socket.on("mouseBroadcast", otherMouse);

function preload(){
  degrees(radians);
  world = loadImage("https://upload.wikimedia.org/wikipedia/commons/f/f3/World_map_blank_gmt.png");
  paintheadmenu = loadImage("assets/paintheadmenu.png");
  win95topright = loadImage("assets/win95topright.png");
  // put preload code here

  paletteColors = [color(200, 10, 10),color(200, 210, 10),color(40, 204, 10),color(10, 40, 200),color(100, 10, 200)];
  eTools.push(new editingTool([60,-60],"move", color = color(200), selected = true));
  for (var i = 0; i < paletteColors.length; i++) {
    eTools.push(new editingTool([120+60*i,-60],"palette",paletteColors[i]));
  }
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  background("black");
  textFont("texturina");
  frameRate(fps);
}

function windowResized() {
  resizeCanvas(windowWidth,windowHeight);
}
// Callback function called when a new message comes from the server
// Data parameters will contain the received data
function otherMouse(data) {
  drawingData.push(data);
}

function mouseClicked() {
  lastMousePos = [mouseX,mouseY];
  eTools.forEach((itemeTools, ieTools) => {
    if (itemeTools.isHover()) {
      selectedTool = ieTools;
    }
  });
}
function mouseReleased() {
  lastMousePos = [-1,-1];
}
function mouseWheel(event) {
  if (event.delta > 0) {
    cameraZoom -= 0.4;
  }
  else if (event.delta < 0) {
    cameraZoom += 0.4;
  }
}
function mouseDragged() {
  if (eTools[selectedTool].type == "move") {
    if (lastMousePos[0] >= 0 && lastMousePos[1] >= 0) {
      cameraPosition[0] -= mouseX-lastMousePos[0];
      cameraPosition[1] -= mouseY-lastMousePos[1];
    }
    lastMousePos = [mouseX,mouseY];
    cameraSpeed = [0,0,0];
  }
  else {
    // create an object containing the mouse position
    let message = {
      t: eTools[selectedTool].type,
      c: eTools[selectedTool].color,
      x: (mouseX+cameraPosition[0])/cameraZoom,
      y: (mouseY+cameraPosition[1])/cameraZoom,
    };
    // send the object to server,
    // tag it as "mouse" event
    socket.emit("mouse", message);
    drawingData.push(message);
  }
}

function moveCamera() {
  cameraPosition[0] += cameraZoom*cameraSpeed[0]/fps;
  cameraPosition[1] += cameraZoom*cameraSpeed[1]/fps;
  cameraZoom += cameraSpeed[2]/fps;
  if (cameraZoom < 1.2) {
    cameraZoom = 1.2;
    cameraSpeed[2] = -cameraSpeed[2];
  }
  if (cameraZoom > 4) {
    cameraZoom = 4;
    cameraSpeed[2] = -cameraSpeed[2];
  }
  if (cameraPosition[0]<0) {
    cameraPosition[0] = 0;
    cameraSpeed[0] = -cameraSpeed[0];
  }
  if (cameraPosition[0]>-windowWidth+cameraZoom*windowHeight/world.height*world.width) {
    cameraPosition[0] = -windowWidth+cameraZoom*windowHeight/world.height*world.width;
    cameraSpeed[0] = -cameraSpeed[0];
  }
  if (cameraPosition[1]<0) {
    cameraPosition[1] = 0;
    cameraSpeed[1] = -cameraSpeed[1];
  }
  if (cameraPosition[1]>-windowHeight+cameraZoom*windowHeight) {
    cameraPosition[1] = -windowHeight+cameraZoom*windowHeight;
    cameraSpeed[1] = -cameraSpeed[1];
  }

}

function draw() {
  // evert draw cycle, add a background with low opacity
  // to create the "fade" effect
  lastMousePos = [-1,-1];

  if (frameCount/fps < welcomeMessage.length*secondsPerMessage+1) {
    background(0);
    push();
    noStroke();
    textAlign(CENTER,CENTER);
    for (let i = 0; i < welcomeMessage.length; i++) {
      if((frameCount/fps/secondsPerMessage-i) < 0) {
        fill(255,255,255,0);
      }
      else if((frameCount/fps/secondsPerMessage-i) < 1) {
        fill(255,255,255,((frameCount/fps/secondsPerMessage-i)*2)^0.5*255);
      }
      else {
        fill(255,255,255,2*(1.5-(frameCount/fps/secondsPerMessage-i))*255);
      }
      textSize(max(1,(frameCount/fps/secondsPerMessage-i)*80));
      text(welcomeMessage[i], windowWidth/2, windowHeight/2);
    }
    pop();
  }
  else {
    moveCamera();
    push();
    image(world,-cameraPosition[0],-cameraPosition[1],cameraZoom*windowHeight/world.height*world.width,cameraZoom*windowHeight);

    drawingData.forEach((dd, idd) => {
      if (dd.t == "palette") {
        push();
        noStroke();
        fill(t.c);
        ellipse(t.x*cameraZoom-cameraPosition[0],t.y*cameraZoom-cameraPosition[1],8);
        pop();
      }
    });


    eTools.forEach((itemeTools, ieTools) => {
      itemeTools.printout();
    });
    image(paintheadmenu,0,0,paintheadmenu.width,paintheadmenu.height);
    image(win95topright,windowWidth-win95topright.width,0,win95topright.width,win95topright.height)
    fill(255);
    stroke(0,0,0,100);
    textAlign(RIGHT,CENTER);
    textSize(20);
    text("only for creative travellers - paint responsibly", windowWidth-10, windowHeight-30);
    pop();
  }

}
