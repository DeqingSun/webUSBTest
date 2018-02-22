var analogRead = function(pin){
    return top.modifiedFirmata.simpleReadAnalog(pin);
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

var connectFirmata = function(){
    top.webusbFirmata.connect();
}
