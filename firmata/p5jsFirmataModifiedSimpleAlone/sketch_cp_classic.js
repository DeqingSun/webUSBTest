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
                console.log(red(firstNeoPixelColor));
                neoPixelWrite(25,0,0,0);
                break;
            case 1:
                firstNeoPixelColor = color(0, 255, 0);
                neoPixelWrite(0,25,0,0);
                break;
            case 2:
                firstNeoPixelColor = color(0, 0, 255);
                neoPixelWrite(0,0,25,0);
                break;

        }
        
        

    }

    analog0Value = analogRead(0);
    
    fill(0);
    text("IO 13", 10, 30);
    text("NeoPixel 0", 100, 30);
    
    var steinhart = "Unknown";
    
    //calc temperature
    if (analog0Value!=0){
        THERM_SERIES_OHMS  = 10000.0  // Resistor value in series with thermistor.
        THERM_NOMINAL_OHMS = 10000.0  // Thermistor resistance at 25 degrees C.
        THERM_NOMIMAL_C    = 25.0     // Thermistor temperature at nominal resistance.
        THERM_BETA         = 3950.0   // Thermistor beta coefficient.
        resistance = ((1023.0 * THERM_SERIES_OHMS)/analog0Value)
        resistance -= THERM_SERIES_OHMS
        // Now apply Steinhart-Hart equation.
        steinhart = resistance / THERM_NOMINAL_OHMS
        steinhart = Math.log(steinhart)
        steinhart /= THERM_BETA
        steinhart += 1.0 / (THERM_NOMIMAL_C + 273.15)
        steinhart = 1.0 / steinhart
        steinhart -= 273.15
        steinhart = Math.round(steinhart * 10) / 10
    }

    
    text("Read IO A0: " + analog0Value + " Temp: " + steinhart, 10, 90);
    fill(io13circleColor);
    ellipse(30, 50, 30, 30);
    fill(firstNeoPixelColor);
    ellipse(130, 50, 30, 30);
    fill(0);
    rect(10, 100, analog0Value / 2, 10);
}

function mouseClicked() {
    connectFirmata(); //will not reconnect if already connected
}
