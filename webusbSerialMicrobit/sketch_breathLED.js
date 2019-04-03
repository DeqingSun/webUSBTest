var lastLEDTime = 0;
var breathCounter = 0

function setup() {
    createCanvas(640, 360);
    io1circleColor = color(0, 0, 0);
}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 10) {
        lastLEDTime = timeNow;
        var brightness;
        if (breathCounter<=255) {
            brightness = breathCounter;
        }else{
            brightness = 511 - breathCounter;
        }
        breathCounter+=2;
        if (breathCounter>=512) {
            breathCounter = 0;
        }
        analogWrite(5,brightness);
        io1circleColor = color(brightness, brightness, brightness); 
    }
    
    fill(0);
    text("IO 5", 10, 30);
    fill(io1circleColor);
    ellipse(30, 50, 30, 30);
    fill(0);
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
