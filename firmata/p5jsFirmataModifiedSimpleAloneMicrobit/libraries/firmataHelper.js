microbitPinMode = new Array(16).fill(0);
microbitStreamAnalogChannel = new Array(16).fill(false);

var analogRead = function(pin){
    if (top.microbitFirmataClient.firmataVersion != ''){
        if (microbitPinMode[pin]!=top.microbitFirmataClient.ANALOG_INPUT){
            top.microbitFirmataClient.setPinMode(pin, top.microbitFirmataClient.ANALOG_INPUT)
            microbitPinMode[pin]!=top.microbitFirmataClient.ANALOG_INPUT
        }
        if (microbitStreamAnalogChannel[pin]!=true){
            top.microbitFirmataClient.streamAnalogChannel(pin)
            microbitStreamAnalogChannel[pin]!=true
        }
    }
    return top.microbitFirmataClient.analogChannel[pin];
}

var analogWrite = function(pin, value){
    top.microbitFirmataClient.setPinMode(pin, top.microbitFirmataClient.ANALOG_INPUT)
    top.microbitFirmataClient.streamAnalogChannel(pin)
    
    
    //return top.modifiedFirmata.simpleWriteAnalog(pin, value);
}

var digitalWrite = function(pin, value){
    //return top.modifiedFirmata.simpleWriteDigital(pin, value);
}

var digitalRead = function(pin){
    //return top.modifiedFirmata.simpleReadDigital(pin);
}

var enableDisplay = function(flag){
    // Enable or disable the display. When the display is disabled, the edge connector
    // pins normall used by the display can be used for other I/O functions.
    // Re-enabling the display (even when is already enabled) disables the light
    // sensor which, when running monopolizes the A/D converter preventing all pins
    // from being used for analog input. Requesting a light sensor value restarts
    // the light sensor.
    return top.microbitFirmataClient.enableDisplay(flag);
}

var displayPlot = function(x, y, brightness) {
    // Set the display pixel at x, y to the given brightness (0-255).
    return top.microbitFirmataClient.displayPlot(x, y, brightness);
}


var servoWrite = function(pin, value){
    return top.modifiedFirmata.simpleWriteServo(pin, value);
}

//resource on Circuit Playground Classic

var isBoardCircuitPlayground = function(){
    var isCircuitPlayground = false;
    try {
        isCircuitPlayground = (top.validPort.device_.productName=="Circuit Playground");
    } catch (e) {};
    return isCircuitPlayground;
}

var neoPixelWriteOnCPC = function(_r, _g, _b, _index){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundSetOneNeoPixel(_r, _g, _b, _index);
    }else{
        return;
    }   
}

var readTemperatureOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundSimpleReadTemperature();
    }else{
        return;
    }   
}

var readAccelOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundSimpleReadAccel();
    }else{
        return;
    }   
}

var readLeftButtonOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return digitalRead(4);
    }else{
        return;
    }   
}

var readRightButtonOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return digitalRead(19);
    }else{
        return;
    }   
}

var readSwitchButtonOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return digitalRead(21);
    }else{
        return;
    }   
}

var readCapacitiveTouchOnCPC = function(pin){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundReadCapacitiveTouch(pin);
    }else{
        return;
    }   
}

var readLightSensorOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return analogRead(5);
    }else{
        return;
    }   
}

var readSoundSensorOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return analogRead(4);
    }else{
        return;
    }   
}

var playToneOnCPC = function(freq, durationMs = 0){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundPlayTone(freq, durationMs);
    }else{
        return;
    }   
}

var stopToneOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundStopTone();
    }else{
        return;
    }   
}

//resource on Circuit Playground Classic END

var connectFirmata = function(){
    top.webusbFirmata.connect();
}
