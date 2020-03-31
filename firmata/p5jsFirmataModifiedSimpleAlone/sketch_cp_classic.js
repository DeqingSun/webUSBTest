var lastLEDTime = 0;
var io13circleColor,firstNeoPixelColor;
var analog0Value = 0;

function setup() {
    createCanvas(640, 360);
    io13circleColor = color(0, 0, 0);
    firstNeoPixelColor = color(0, 0, 0); 
}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 1000) {
        lastLEDTime = timeNow;
        var roundSeconds = Math.round(timeNow / 1000);
        switch(roundSeconds % 2){ //alternatively
            case 0:
                digitalWrite(13, false);
                io13circleColor = color(0, 0, 0);
                break;
            case 1:
                digitalWrite(13, true);
                io13circleColor = color(255, 255, 255);
                break;
        }
        switch(roundSeconds % 3){ //r g b
            case 0:
                firstNeoPixelColor = color(255, 0, 0);
                neoPixelWriteOnCPC(25,0,0,0);
                break;
            case 1:
                firstNeoPixelColor = color(0, 255, 0);
                neoPixelWriteOnCPC(0,25,0,0);
                break;
            case 2:
                firstNeoPixelColor = color(0, 0, 255);
                neoPixelWriteOnCPC(0,0,25,0);
                break;

        }
        
        

    }
    
    var temperature = readTemperatureOnCPC();
    analog10Value = analogRead(10);
    
    fill(0);
    text("IO 13", 10, 30);
    text("NeoPixel 0", 100, 30);
    
    var accelerationArray = readAccelOnCPC();

    text("Temperature: " + temperature, 10, 90);
    text("Read IO A10: " + analog10Value , 10, 110);
    
    fill(io13circleColor);
    ellipse(30, 50, 30, 30);
    fill(firstNeoPixelColor);
    ellipse(130, 50, 30, 30);
    fill(0);
    rect(10, 120, analog10Value / 2, 10);
    
    fill(0);
    text("Acceleration:", 10, 150);
    text("x: " + Math.round(accelerationArray[0] * 100) / 100, 10, 160);
    text("y: " + Math.round(accelerationArray[1] * 100) / 100, 70, 160);
    text("z: " + Math.round(accelerationArray[2] * 100) / 100, 130, 160);
    
    text("Left Button Pressed: "+(readLeftButtonOnCPC()?"Yes":"No ")+", Right Button: "+(readRightButtonOnCPC()?"Yes":"No ")+", Switch: "+(readSwitchButtonOnCPC()?"Yes":"No "),10,180);
    
    text("Capacitive Touch Raw value on Pin 9: "+readCapacitiveTouchOnCPC(9),10,200);
    //console.log(digitalRead(4));
    
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
