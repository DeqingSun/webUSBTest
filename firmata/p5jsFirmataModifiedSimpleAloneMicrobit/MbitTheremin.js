var x = 0;
var y = 0;
var xwas = 0;
var ywas = 0;
var xspacing = 1;
var xAccel = 0;
var yAccel = 0;
var xAccelAvg = [];
var yAccelAvg = [];
var avgLength = 25;  // averaging array length
var osc;
var freq;

function setup() {
    createCanvas(640, 400);
    // create and populate arrays for moving average calcuations
      for (var i = 0;i < avgLength;i++){
      xAccelAvg.push(0);
      yAccelAvg.push(0);
    }
    osc = new p5.Oscillator('sine');
    osc.start();
}

function draw() {
    //background(255);
    calculateXY();  // get x and y values from onboard accelerometer
    //text(x + " " + y, 20,20);
    ellipse(x,y,10,10);
    osc.freq(x);
    // line(xwas,ywas,x,y);
    // xwas = x;
    // ywas = y;
    
    if (getButtonAPressed() === true){  // clear screen and recenter
      x = width/2;
      y = height/2
      // xwas = x
      // ywas = y
      background(255);
    }
    // keep from going off canvase
    if (x > width){x = width}
    if (x < 0){x = 0}
    if (y > height){y = height}
    if (y < 0){y = 0}
}

function calculateXY(){
  // compute  average to reduce natural jitter of accelerometer readings
  var xtot = 0;
    var ytot = 0;
    // custom functions to read accelerometer
    xAccel = accelerometerRead(0);
    yAccel = accelerometerRead(1);
    x = xAccel;
    y = yAccel;
    x = map(x,-1024,1024,0,width)
    y = map(y,-1024,1024,0,height)
    xAccelAvg.push(x);
    yAccelAvg.push(y);
    xAccelAvg.splice(0,1);
    yAccelAvg.splice(0,1);
    for (var i = 0;i < xAccelAvg.length;i++){
      xtot += xAccelAvg[i];
    }
    x = round(xtot/xAccelAvg.length);
   for (var i = 0;i < yAccelAvg.length;i++){
      ytot += yAccelAvg[i];
    }
    y = round(ytot/yAccelAvg.length);
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
