var lastLEDTime = 0;
var io1circleColor;
var sliderValue = 0;

function setup() {
    createCanvas(640, 360);
    io1circleColor = color(0, 0, 0);
    enableDisplay(true);
}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 1000) {
        lastLEDTime = timeNow;
        if (Math.round(timeNow / 1000) & 1) { //alternatively
            displayPlot(0,0,255);
            digitalWrite(0, true);
            io1circleColor = color(255, 255, 255);
        } else {
            displayPlot(0,0,0);
            digitalWrite(0, false);
            io1circleColor = color(0, 0, 0);
        }
    }

    fill(io1circleColor);
    ellipse(30, 50, 30, 30);
    
    /*sliderValue = analogRead(0);
    //also map analog 1 value to D0
    if ((analogRead(1)) > 512) {
        digitalWrite(1, true);
    } else {
        digitalWrite(1, false);
    }
    
    fill(0);
    text("IO 10", 10, 30);
    text("Read IO A0: " + sliderValue, 10, 90);
    fill(io1circleColor);
    ellipse(30, 50, 30, 30);
    fill(0);
    rect(10, 100, sliderValue / 2, 10);*/
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
