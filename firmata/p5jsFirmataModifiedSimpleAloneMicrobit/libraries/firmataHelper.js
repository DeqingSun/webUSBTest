microbitPinMode = new Array(16).fill(0);
microbitStreamAnalogChannel = new Array(16).fill(false);
microbitStreamDigitalChannel = new Array(16).fill(false);

var analogRead = function (pin) {
    if (top.microbitFirmataClient.firmataVersion != '') {
        if (microbitPinMode[pin] != top.microbitFirmataClient.ANALOG_INPUT) {
            top.microbitFirmataClient.setPinMode(pin, top.microbitFirmataClient.ANALOG_INPUT)
            microbitPinMode[pin] = top.microbitFirmataClient.ANALOG_INPUT
        }
        if (microbitStreamAnalogChannel[pin] != true) {
            top.microbitFirmataClient.streamAnalogChannel(pin)
            microbitStreamAnalogChannel[pin] = true
        }
    }
    return top.microbitFirmataClient.analogChannel[pin];
}

var analogWrite = function (pin, value) {
    if (top.microbitFirmataClient.firmataVersion != '') {
        top.microbitFirmataClient.setAnalogOutput(pin, value);
    }
    return;
}

var temperatureRead = function (pin) {
    return analogRead(12);
}

var accelerometerRead = function (channel) {
    return analogRead(8+channel);
}

var compassRead = function (channel) {
    return analogRead(13+channel);
}

var digitalWrite = function (pin, value) {
    if (top.microbitFirmataClient.firmataVersion != '') {
        top.microbitFirmataClient.setDigitalOutput(pin, value);
    }
    return;
}

var digitalRead = function (pin) {
    if (top.microbitFirmataClient.firmataVersion != '') {
        if (microbitStreamDigitalChannel[pin] != true) {
            top.microbitFirmataClient.trackDigitalPin(pin, 0)
            microbitStreamDigitalChannel[pin] = true
        }
    }
    return top.microbitFirmataClient.digitalInput[pin];
}

var enableDisplay = function (flag) {
    // Enable or disable the display. When the display is disabled, the edge connector
    // pins normall used by the display can be used for other I/O functions.
    // Re-enabling the display (even when is already enabled) disables the light
    // sensor which, when running monopolizes the A/D converter preventing all pins
    // from being used for analog input. Requesting a light sensor value restarts
    // the light sensor.
    return top.microbitFirmataClient.enableDisplay(flag);
}

var displayClear = function () {
    // Clear the display and stop any ongoing animation.
    return top.microbitFirmataClient.displayClear();
}

var displayShow = function (useGrayscale, pixels) {
    // Display the given 5x5 image on the display. If useGrayscale is true, pixel values
    // are brightness values in the range 0-255. Otherwise, a zero pixel value means off
    // and >0 means on. Pixels is an Array of 5-element Arrays.
    return top.microbitFirmataClient.displayShow(useGrayscale, pixels);
}

var displayPlot = function (x, y, brightness) {
    // Set the display pixel at x, y to the given brightness (0-255).
    return top.microbitFirmataClient.displayPlot(x, y, brightness);
}

var scrollString = function (s, delay) {
    // Scroll the given string across the display with the given delay.
    // Omit the delay parameter to use the default scroll speed.
    // The maximum string length is 100 characters.
    return top.microbitFirmataClient.scrollString(s, delay);
}

var scrollInteger = function (n, delay) {
    // Scroll the given integer value across the display with the given delay.
    // Omit the delay parameter to use the default scroll speed.
    // Note: 32-bit integer is transmitted as five 7-bit data bytes.
    return top.microbitFirmataClient.scrollInteger(n, delay);
}

var getButtonAPressed = function(){
    return top.microbitFirmataClient.buttonAPressed;
}

var getButtonBPressed = function(){
    return top.microbitFirmataClient.buttonBPressed;
}

//resource on Circuit Playground Classic END

var connectFirmata = function () {
    top.webusbFirmata.connect();
}