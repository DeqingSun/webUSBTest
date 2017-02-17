var grassArray = [];
var grassXcount = 45;
var grassYcount = 32;

var lastMillis;

var kicked = true; //init Kick
var kickTime;

var halfRoadWidth = 24;

var fpsArray = [30, 30, 30, 30, 30];

function setup() {
  createCanvas(1024, 768, WEBGL);
  for (i = 0; i < grassXcount; i++) {
    grassArray[i] = [];
    for (j = 0; j < grassYcount; j++) {
      var xPos = (i - (grassXcount - 1) / 2) * 12;
      var yPos = (j - (grassYcount - 1) / 2) * 12;
      if (yPos <= 0) yPos -= halfRoadWidth; //add road
      else yPos += halfRoadWidth;
      grassArray[i][j] = new Grass(xPos, 0, yPos);
    }
  }
  lastMillis = millis();
  kickTime = lastMillis;

  setFrameRate(30);
}

function draw() {
  background(240);
  ambientLight(200);
  //var dirX = (mouseX / width - 0.5) *2;
  //var dirY = (mouseY / height - 0.5) *(-2);
  directionalLight(250, 250, 250, -1, -1, 0.25);
  ambientMaterial('#43a047');
  noStroke();

translate(-75, -150, 0);

  orbitControl();
  scale(1.3);
  rotateX(PI / 8+PI / 8);
  rotateY(-PI / 4-PI / 8);

  //var dirX = (mouseX / width - 0.5) *2;
  //var dirY = (mouseY / height - 0.5) *(-2);

  //rotateX(PI*dirY / 4);
  //rotateY(-PI*dirX / 4);
  var nowMillis = millis();
  var deltaPhase = TWO_PI * (nowMillis - lastMillis) / 2500;

  if (kicked) {
    kickTime = nowMillis;
    kicked = false;
  }

  var kickMax = halfRoadWidth + ((nowMillis - kickTime) * 12 / 1000); //12in per sec
  var kickMin = halfRoadWidth + ((lastMillis - kickTime) * 12 / 1000); //12in per sec


  for (i = 0; i < grassXcount; i++) {
    for (j = 0; j < grassYcount; j++) {
      var distance = dist(0, 0, grassArray[i][j].x, grassArray[i][j].z);
      if (distance > kickMin && distance < kickMax) {
        grassArray[i][j].kick();
      } else {
        grassArray[i][j].move(deltaPhase);
      }
    }
  }

  for (i = 0; i < grassXcount; i++) {
    for (j = 0; j < grassYcount; j++) {
      grassArray[i][j].display();
    }
  }

  //pave Road

  ambientMaterial('#CACBCA');
  push();
  translate(0, 24, 0);
  rotateX(HALF_PI);
  plane(grassXcount * 12, halfRoadWidth * 2);
  pop();

  lastMillis = nowMillis;

  var fps = frameRate();
  fill(255);
  stroke(0);

  fpsArray.push(fps);
  fpsArray.shift();
  var sum = 0;
  for (var i = 0; i < fpsArray.length; i++) {
    sum += fpsArray[i]; //don't forget to add the base
  }
  var avgFps = sum / fpsArray.length;

  var element = document.getElementById("info");
  element.innerHTML = "Press space to start ripple, FPS: " + fps.toFixed(2);
  if (avgFps >= 24) {
    element.innerHTML += ", Your computer is fast enough";
  } else {
    element.innerHTML += ", Your computer is slow";
  }
}

function keyTyped() {
  if (key === ' ') {
    kicked = true;
  }
}

function Grass(_x, _y, _z) {
  this.x = _x;
  this.y = _y;
  this.z = _z;
  this.kicked = false;

  this.ampScale = 0;
  this.phase = TWO_PI * 9999;

  this.kick = function() {
    this.kicked = true;

  };


  this.move = function(deltaPhase) {
    var angle = this.ampScale * sin(this.phase);
    var speed = cos(this.phase);
    var canKick = false;
    if (abs(angle) < .15 * 0.1) {
      if (this.ampScale < .15 * 0.2) {
        canKick = true;
      } else if (speed > 0) {
        canKick = true
      }
    }

    if (this.kicked && canKick) {
      this.phase = 0;
      this.kicked = false;
    } else {
      this.phase += deltaPhase;
      this.ampScale = 0.15 * (1 - this.phase / (6 * TWO_PI));
      if (this.ampScale < 0) this.ampScale = 0;
    }
  };

  this.display = function() {
    push();
    translate(this.x, this.y, this.z);
    translate(0, 16, 0);
    rotateX(this.ampScale * sin(this.phase));
    box(3, 2, 3);
    translate(0, -16, 0);
    cylinder(1, 48, 6, 2); //r,height
    pop();
  }
};