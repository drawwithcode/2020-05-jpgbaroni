// Create a new connection using socket.io (imported in index.html)
let socket = io();
let fps = 20;
let welcomeMessage = ["imagine that","there was no lockdown","and you could travel","travel everywhere","where would you go?"]
let secondsPerMessage = 2.5;
let world;
let cameraPosition = [2000,500];
let cameraZoom = 4;
let cameraSpeed = [10,10,-0.1];
let lastMousePos = [-1,-1];

// define the function that will be called on a new newConnection
socket.on("connect", newConnection);

function newConnection() {
  console.log("your id:", socket.id);
}

// Define which function should be called when a new message
// comes from the server with type "mouseBroadcast"

socket.on("mouseBroadcast", otherMouse);

function preload(){
  degrees(radians);
  world = loadImage("https://upload.wikimedia.org/wikipedia/commons/f/f3/World_map_blank_gmt.png");
  // put preload code here
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
  console.log("received:", data);
  noStroke();
  fill("yellow");
  if (t == "ellipse")
    ellipse(data.x, data.y, 20);
}
function mouseClicked() {
  lastMousePos = [mouseX,mouseY];
}
function mouseReleased() {
  lastMousePos = [-1,-1];
}
function mouseDragged() {
  if (lastMousePos[0] >= 0 && lastMousePos[1] >= 0) {
    cameraPosition[0] -= mouseX-lastMousePos[0];
    cameraPosition[1] -= mouseY-lastMousePos[1];
  }
  lastMousePos = [mouseX,mouseY];
  cameraSpeed = [0,0,0];
  /*console.log("sending: ", mouseX, mouseY);
  noStroke();
  fill(255);

  // create an object containing the mouse position
  let message = {
    t: "ellipse",
    x: mouseX,
    y: mouseY,
  };
  // send the object to server,
  // tag it as "mouse" event
  socket.emit("mouse", message);

  ellipse(mouseX, mouseY, 20);*/
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
        fill(255,255,255,(frameCount/fps/secondsPerMessage-i)^0.5*255);
      }
      else {
        fill(255,255,255,2*(1.5-(frameCount/fps/secondsPerMessage-i))*255);
      }
      textSize(max(0,(frameCount/fps/secondsPerMessage-i)*100));
      text(welcomeMessage[i], windowWidth/2, windowHeight/2);
    }
    pop();
  }
  else {
    moveCamera();
    image(world,-cameraPosition[0],-cameraPosition[1],cameraZoom*windowHeight/world.height*world.width,cameraZoom*windowHeight);
  }

}
