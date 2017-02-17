var grassArray = [];
var grassXcount = 45 - 34 * 0;
var grassYcount = 32 - 18 * 0;

var lastMillis;

var personOnRight = false;
var personSpeed = 0;
var personPosition = 0;

//var kicked = true; //init Kick

var halfRoadWidth = 24;

var fpsArray = [30, 30, 30, 30, 30];

var currentMode = 'ripple';

function setup() {
  var canvas = createCanvas(800 / 1, 600 / 1, WEBGL);
  canvas.parent('sketch-holder');
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

  directionalLight(250, 250, 250, -1, -1, 0.25);
  ambientMaterial('#43a047');
  noStroke();

  //translate(-75, -150, 0);

  myOrbitControl();
  scale(1.0 * 1);
  rotateX(PI / 8 + PI / 8);
  rotateY(-PI / 4 - PI / 8);

  var nowMillis = millis();
  var deltaPhase = TWO_PI * (nowMillis - lastMillis) / 2500;



  for (i = 0; i < grassXcount; i++) {
    for (j = 0; j < grassYcount; j++) {
      grassArray[i][j].move(deltaPhase, nowMillis);
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

  //draw Person
  if (currentMode=='line') {
    if (personSpeed != 0) {
      var OldPosition = personPosition;
      personPosition += personSpeed;
      personPosition = constrain(personPosition, -grassXcount * 6, grassXcount * 6);

      var minPos = Math.min.apply(Math, [OldPosition, personPosition]),
        maxPos = Math.max.apply(Math, [OldPosition, personPosition]);

      if (minPos != maxPos) {
        for (i = 0; i < grassXcount; i++) {
          var grassPostion = grassArray[i][0].x;
          if (minPos < grassPostion && grassPostion <= maxPos) {
            for (j = 0; j < grassYcount; j++) {
              if ((personOnRight && (grassArray[i][j].z<0))||(!personOnRight && (grassArray[i][j].z>0))) {
                var distance = dist(grassPostion, 0, grassArray[i][j].x, grassArray[i][j].z);
                distance = distance - halfRoadWidth - 6; //grass has gap of 12
                grassArray[i][j].kick(nowMillis + distance * 1000 / 36); //36in per sec
              }
            }
          }
        }
      }

    }
    push();
    ambientMaterial('#E57373');
    translate(personPosition, 0, personOnRight ? -10 : 10);
    translate(0, -12, 0);
    cone(6, 72, 4, 1)
    translate(0, -36, 0);
    sphere(6, 4, 2);
    pop();
  }

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
  element.innerHTML = "FPS: " + fps.toFixed(2);
  if (avgFps >= 24) {
    element.innerHTML += ", Your computer is fast enough";
  } else {
    element.innerHTML += ", Your computer is slow";
  }
}

function triggerRipple() {
  var nowMillis = millis();
  for (i = 0; i < grassXcount; i++) {
    for (j = 0; j < grassYcount; j++) {
      var distance = dist(0, 0, grassArray[i][j].x, grassArray[i][j].z);
      distance = distance - halfRoadWidth - 6; //grass has gap of 12
      grassArray[i][j].kick(nowMillis + distance * 1000 / 12); ////12in per sec
    }
  }
}

function personMoving(step) {
  personSpeed = step;
}

function toggleSide() {
  personOnRight = !personOnRight;
}

function myOrbitControl() {
  if (this.mouseIsPressed) {
    if (this.mouseX > 0 && this.mouseX < this.width && this.mouseY > 0 && this.mouseY < this.height) {
      this.rotateY((this.mouseX - this.width / 2) / (this.width / 2));
      this.rotateX((this.mouseY - this.height / 2) / (this.width / 2));
    }
  }
};