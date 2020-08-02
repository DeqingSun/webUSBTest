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

var CPX_analog_Pin = {
    8:5,
    9:0,
    0:11,
    1:7,
    2:9,
    3:10,
    4:4,
    5:5,
    6:6,
    7:7,
};

var CPX_analog_digital = [
    12,6,9,10,3,2,0,1
];

var analogReadCPX = function(pin){
    return top.modifiedFirmata.simpleReadAnalogCPX(CPX_analog_Pin[pin]);
}

var neoPixelWriteOnCPX = function(_r, _g, _b, _index){
    return neoPixelWriteOnCPC(_r, _g, _b, _index)
}

var readTemperatureOnCPX = function(){
    return readTemperatureOnCPC();
}

var readAccelOnCPX = function(){
    return readAccelOnCPC();
}

var readLeftButtonOnCPX = function(){
    return readLeftButtonOnCPC();
}

var readRightButtonOnCPX = function(){
    return readRightButtonOnCPC();
}

var readSwitchButtonOnCPX = function(){
    return readSwitchButtonOnCPC(); 
}

var readCapacitiveTouchOnCPX = function(pin){
    if (isBoardCircuitPlayground()){
        if (CPX_analog_digital[pin]!=null){
            return top.modifiedFirmata.circuitPlaygroundReadCapacitiveTouchCPX(CPX_analog_digital[pin]);
        }else{
            return 0;
        }
    }else{
        return 0;
    }   
}

var readLightSensorOnCPX = function(){
    return readLightSensorOnCPC();
}

var readSoundSensorOnCPX = function(){
    return readSoundSensorOnCPC();
}

var playToneOnCPX = function(freq, durationMs = 0){
    return playToneOnCPC(freq, durationMs);
}

var stopToneOnCPX = function(){
    return stopToneOnCPC()
}

//resource on Circuit Playground Express END

var connectFirmata = function(){
    top.webusbFirmata.connect();
}
