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

var neoPixelWrite = function(_r, _g, _b, _index){
    var isCircuitPlayground = true;
    try {
        isCircuitPlayground = (top.validPort.device_.productName=="Circuit Playground");
    } catch (e) {};
    if (isCircuitPlayground){
        return top.modifiedFirmata.circuitPlaygroundSetOneNeoPixel(_r, _g, _b, _index);
    }else{
        return;
    }   
}

var readTemperature = function(){
    var isCircuitPlayground = true;
    try {
        isCircuitPlayground = (top.validPort.device_.productName=="Circuit Playground");
    } catch (e) {};
    if (isCircuitPlayground){
        return top.modifiedFirmata.circuitPlaygroundSimpleReadTemperature();
    }else{
        return;
    }   
}

var readAccel = function(){
    var isCircuitPlayground = true;
    try {
        isCircuitPlayground = (top.validPort.device_.productName=="Circuit Playground");
    } catch (e) {};
    if (isCircuitPlayground){
        return top.modifiedFirmata.circuitPlaygroundSimpleReadAccel();
    }else{
        return;
    }   
}

var connectFirmata = function(){
    top.webusbFirmata.connect();
}
