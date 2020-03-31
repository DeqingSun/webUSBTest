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


//resource on Circuit Playground Classic END

var connectFirmata = function(){
    top.webusbFirmata.connect();
}
