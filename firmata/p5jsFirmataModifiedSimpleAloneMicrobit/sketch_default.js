var lastLEDTime = 0;
var oneLEDColor;
var sliderValue = 0;

function setup() {
    createCanvas(640, 360);
    oneLEDColor = color(0, 0, 0);
    enableDisplay(true);
}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 1000) {
        lastLEDTime = timeNow;
        if (Math.round(timeNow / 1000) & 1) { //alternatively
            displayPlot(0,0,255);
          //  digitalWrite(0, true);  //external circuit may be needed to observe it
            oneLEDColor = color(255, 255, 255);
        } else {
            displayPlot(0,0,0);
          //  digitalWrite(0, false);
            oneLEDColor = color(0, 0, 0);
        }
    }

    fill(oneLEDColor);
    ellipse(30, 50, 30, 30);
    
    
    sliderValue = analogRead(0);
    //also map analog 1 value to D0
    if ((analogRead(1)) > 512) {
        digitalWrite(2, true);  //external circuit may be needed to observe it
    } else {
        digitalWrite(2, false);
    }
    
    fill(0);
    text("Led", 10, 30);
    text("Read IO A0: " + sliderValue, 10, 90);
    fill(oneLEDColor);
    ellipse(30, 50, 30, 30);
    fill(0);
    rect(10, 100, sliderValue / 2, 10);
    text("Button A "+(getButtonAPressed()?"Pressed":"        ") + " Button B "+(getButtonBPressed()?"Pressed":"        "), 10, 130);
    temperature = temperatureRead();    //temperature sensor in its processor
    text("Temperature on CPU is "+temperature + " Celsius", 10, 160);
    accelerometerX = accelerometerRead(0);
    accelerometerY = accelerometerRead(1);
    accelerometerZ = accelerometerRead(2);
    text("Accelerometer data , x: "+(accelerometerX/1000.0) + "g, y: "+(accelerometerY/1000.0) + "g, z: "+(accelerometerZ/1000.0) + "g", 10, 190);
    compassX = compassRead(0);
    compassY = compassRead(1);
    compassZ = compassRead(2);
    text("Compass raw data in nano Tesla, x: "+(compassX) + "nT, y: "+(compassY) + "nT, z: "+(compassZ) + "nT", 10, 220);
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
