var lastLEDTime = 0;
var io1circleColor;

function setup() {
    createCanvas(640, 360);
    io1circleColor = color(0, 0, 0);
}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 1000) {
        lastLEDTime = timeNow;
        if (Math.round(timeNow / 1000) & 1) { //alternatively
            digitalWrite(10, true);
            io1circleColor = color(255, 255, 255);
        } else {
            digitalWrite(10, false);
            io1circleColor = color(0, 0, 0);
        }
    }
    
    fill(0);
    text("IO 10", 10, 30);
    fill(io1circleColor);
    ellipse(30, 50, 30, 30);
    fill(0);
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
