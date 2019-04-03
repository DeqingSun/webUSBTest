var lastLEDTime = 0;
var io1circleColor;
var sliderValue = 0;

function setup() {
    createCanvas(640, 360);
    io1circleColor = color(0, 0, 0);
    top.microbitCallBack=serialCallback
}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 1000) {
        lastLEDTime = timeNow;
        if (Math.round(timeNow / 1000) & 1) { //alternatively
            if (top.microbitTarget!=null){
                top.microbitTarget.serialWrite("1\n");
            }
            io1circleColor = color(255, 255, 255);
        } else {
            if (top.microbitTarget!=null){
                top.microbitTarget.serialWrite("0\n");
            }
            io1circleColor = color(0, 0, 0);
        }
    }

    //s//liderValue = 0;
    //also map analog 1 value to D0
    
    fill(0);
    text("LED", 10, 30);
    text("Read IO 0: " + sliderValue, 10, 90);
    fill(io1circleColor);
    ellipse(30, 50, 30, 30);
    fill(0);
    rect(10, 100, sliderValue / 2, 10);
}

function serialCallback(dataNewLine){
    sliderValue = parseInt(dataNewLine.trim(), 10);
}
