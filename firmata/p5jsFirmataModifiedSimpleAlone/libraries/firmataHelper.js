var analogRead = function(pin){
    return top.modifiedFirmata.simpleReadAnalog(pin);
}

var analogWrite = function(pin, value){
    return top.modifiedFirmata.simpleWriteAnalog(pin, value);
}

var digitalWrite = function(pin, value){
    return top.modifiedFirmata.simpleWriteDigital(pin, value);
}

var digitalRead = function(pin){
    return top.modifiedFirmata.simpleReadDigital(pin);
}

var servoWrite = function(pin, value){
    return top.modifiedFirmata.simpleWriteServo(pin, value);
}

//resource on Circuit Playground Classic

var isBoardCircuitPlayground = function(){
    var isCircuitPlayground = false;
    try {
        isCircuitPlayground = (top.validPort.device_.productName=="Circuit Playground") || (top.validPort.device_.productName=="Circuit Playground Express");
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
        return 0;
    }   
}

var readAccelOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundSimpleReadAccel();
    }else{
        return [0,0,0];
    }   
}

var readLeftButtonOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return digitalRead(4);
    }else{
        return 0;
    }   
}

var readRightButtonOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return digitalRead(19);
    }else{
        return 0;
    }   
}

var readSwitchButtonOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return digitalRead(21);
    }else{
        return 0;
    }   
}

var readCapacitiveTouchOnCPC = function(pin){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundReadCapacitiveTouch(pin);
    }else{
        return 0;
    }   
}

var readLightSensorOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return analogRead(5);
    }else{
        return 0;
    }   
}

var readSoundSensorOnCPC = function(){
    if (isBoardCircuitPlayground()){
        return analogRead(4);
    }else{
        return 0;
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

//resource on Circuit Playground Express

var CPX_Pin = {
    5:8,
    0:11,
};

var readTemperatureOnCPX = function(){
    if (isBoardCircuitPlayground()){
        return top.modifiedFirmata.circuitPlaygroundSimpleReadTemperature(0);
    }else{
        return 0;
    }   
}

//resource on Circuit Playground Express END

var connectFirmata = function(){
    top.webusbFirmata.connect();
}
