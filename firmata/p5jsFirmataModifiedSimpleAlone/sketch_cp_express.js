var lastLEDTime = 0;
var io13circleColor,firstNeoPixelColor;
var analog1Value = 0;
var tonePlayingNow = -1;
var toneStartTime = 0;

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
                neoPixelWriteOnCPX(25,0,0,0);
                break;
            case 1:
                firstNeoPixelColor = color(0, 255, 0);
                neoPixelWriteOnCPX(0,25,0,0);
                break;
            case 2:
                firstNeoPixelColor = color(0, 0, 255);
                neoPixelWriteOnCPX(0,0,25,0);
                break;

        }
    }
    //Tone playing handler
    if (tonePlayingNow>=0){
        var lapsedTime = millis()-toneStartTime;
        if (tonePlayingNow == 0){
            playToneOnCPX(262,100); //Do for 100mS
            tonePlayingNow = 1;
        }else if(tonePlayingNow == 1 && lapsedTime>=500){
            playToneOnCPX(294,200); //Re for 200mS
            tonePlayingNow = 2;
        }else if(tonePlayingNow == 2 && lapsedTime>=1000){
            playToneOnCPX(330); //Mi forever until stopped
            tonePlayingNow = 3;
        }else if(tonePlayingNow == 3 && lapsedTime>=1500){
            stopToneOnCPX();
            tonePlayingNow = -1;
        }
    }
    
    var temperature = readTemperatureOnCPX();
    
    //read analog channel 0 will affect speakser
    //CPX only work with A0~A3
    analog1Value = analogReadCPX(1);
    
    fill(0);
    text("IO 13", 10, 30);
    text("NeoPixel 0", 100, 30);
    
    var accelerationArray = readAccelOnCPX();

    text("Temperature: " + temperature, 10, 90);
    text("Read IO A1: " + analog1Value , 10, 110);
    
    fill(io13circleColor);
    ellipse(30, 50, 30, 30);
    fill(firstNeoPixelColor);
    ellipse(130, 50, 30, 30);
    fill(0);
    rect(10, 120, analog1Value / 2, 10);
    
    fill(0);
    text("Acceleration:", 10, 150);
    text("x: " + Math.round(accelerationArray[0] * 100) / 100, 10, 160);
    text("y: " + Math.round(accelerationArray[1] * 100) / 100, 70, 160);
    text("z: " + Math.round(accelerationArray[2] * 100) / 100, 130, 160);
    
    text("Left Button Pressed: "+(readLeftButtonOnCPX()?"Yes":"No ")+", Right Button: "+(readRightButtonOnCPX()?"Yes":"No ")+", Switch: "+(readSwitchButtonOnCPX()?"Yes":"No "),10,180);
    
    text("Capacitive Touch Raw value on Pin A2: "+readCapacitiveTouchOnCPX(2),10,200);
    text("Light Sensor value: "+readLightSensorOnCPX(),10,220);
    text("Sound Sensor value: "+readSoundSensorOnCPX(),10,240);
    text("Press Space bar to play Do Re Mi",10,260);
    
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}

function keyPressed() {
  if (key == ' ') {
    console.log("Start to play");
    toneStartTime = millis();
    tonePlayingNow = 0;
  }
}
