// Create a new connection using socket.io (imported in index.html)
let socket = io();
let fps = 20;
let welcomeMessage = ["imagine that","there was no lockdown","and you could travel","travel everywhere","where would you go?"]
let secondsPerMessage = 1.5;
let world;
let cameraPosition = [500,500];
let cameraZoom = 4;

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

function mouseDragged() {
  console.log("sending: ", mouseX, mouseY);
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

  ellipse(mouseX, mouseY, 20);
}

function draw() {
  // evert draw cycle, add a background with low opacity
  // to create the "fade" effect

  if (frameCount/fps < welcomeMessage.length*secondsPerMessage+1) {
    background(0);
    push();
    noStroke();
    textAlign(CENTER,CENTER);
    for (let i = 0; i < welcomeMessage.length; i++) {
      fill(255);
      if(frameCount/fps/secondsPerMessage > i) {
        fill(255,255,255,max(0,-frameCount/fps/secondsPerMessage+1+i)*255);
      }
      if(frameCount/fps/secondsPerMessage < i-1) {
        fill(255,255,255,0);
      }
      textSize(frameCount/fps*secondsPerMessage/i*windowHeight/16);
      text(welcomeMessage[i], windowWidth/2, windowHeight/2);
    }
    pop();
  }
  else {
    image(world,-cameraPosition[0]*cameraZoom,-cameraPosition[1]*cameraZoom,cameraZoom*windowHeight/world.height*world.width,cameraZoom*windowHeight);
  }

}
