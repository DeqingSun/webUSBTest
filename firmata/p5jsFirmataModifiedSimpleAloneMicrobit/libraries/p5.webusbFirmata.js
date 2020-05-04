//serial code
var serial = {};

var usbfiltersilters = [
    {
        'vendorId': 0x20A0
        , 'productId': 0x4267
    }, //Architectronics Funkey Funkey
    {
        'vendorId': 0x239a
        , 'productId': 0x8011
    }, //circuit playground classic
];

(function () {
    'use strict';

    serial.getPorts = function () {
        return navigator.usb.getDevices().then(devices => {
            return devices.map(device => new serial.Port(device));
        });
    };

    serial.requestPort = function () {
        return navigator.usb.requestDevice({
            'filters': usbfiltersilters
        }).then(
            device => new serial.Port(device)
        );
    }

    serial.Port = function (device) {
        this.device_ = device;
        this.interfaceNumber_ = 2; // original interface number of WebUSB Arduino demo
        this.endpointIn_ = 5; // original in endpoint ID of WebUSB Arduino demo
        this.endpointOut_ = 4; // original out endpoint ID of WebUSB Arduino demo
    };

    serial.Port.prototype.connect = function () {
        let readLoop = () => {
            this.device_.transferIn(this.endpointIn_, 64).then(result => {
                this.onReceive(result.data);
                readLoop();
            }, error => {
                this.onReceiveError(error);
            });
        };

        return this.device_.open()
            .then(() => {
                if (this.device_.configuration === null) {
                    return this.device_.selectConfiguration(1);
                }
            })
            .then(() => {
                var configurationInterfaces = this.device_.configuration.interfaces;
                configurationInterfaces.forEach(element => {
                    element.alternates.forEach(elementalt => {
                        if (elementalt.interfaceClass == 0xff) {
                            this.interfaceNumber_ = element.interfaceNumber;
                            elementalt.endpoints.forEach(elementendpoint => {
                                if (elementendpoint.direction == "out") {
                                    this.endpointOut_ = elementendpoint.endpointNumber;
                                }
                                if (elementendpoint.direction == "in") {
                                    this.endpointIn_ = elementendpoint.endpointNumber;
                                }
                            })
                        }
                    })
                })
            })
            .then(() => this.device_.claimInterface(this.interfaceNumber_))
            .then(() => this.device_.selectAlternateInterface(this.interfaceNumber_, 0))
            .then(() => this.device_.controlTransferOut({
                'requestType': 'class'
                , 'recipient': 'interface'
                , 'request': 0x22
                , 'value': 0x01
                , 'index': this.interfaceNumber_
            }))
            .then(() => {
                readLoop();
            });
    };

    serial.Port.prototype.disconnect = function () {
        return this.device_.controlTransferOut({
                'requestType': 'class'
                , 'recipient': 'interface'
                , 'request': 0x22
                , 'value': 0x00
                , 'index': this.interfaceNumber_
            })
            .then(() => this.device_.close());
    };

    serial.Port.prototype.send = function (data) {
        return this.device_.transferOut(this.endpointOut_, data);
    };
})();

//modified firmata
var ModifiedFirmata = function () {
    /**
     * constants
     */

    var PIN_MODE = 0xF4
        , REPORT_DIGITAL = 0xD0
        , REPORT_ANALOG = 0xC0
        , DIGITAL_MESSAGE = 0x90
        , START_SYSEX = 0xF0
        , END_SYSEX = 0xF7
        , QUERY_FIRMWARE = 0x79
        , REPORT_VERSION = 0xF9
        , ANALOG_MESSAGE = 0xE0
        , CAPABILITY_QUERY = 0x6B
        , CAPABILITY_RESPONSE = 0x6C
        , PIN_STATE_QUERY = 0x6D
        , PIN_STATE_RESPONSE = 0x6E
        , ANALOG_MAPPING_QUERY = 0x69
        , ANALOG_MAPPING_RESPONSE = 0x6A
        , I2C_REQUEST = 0x76
        , I2C_REPLY = 0x77
        , I2C_CONFIG = 0x78
        , STRING_DATA = 0x71
        , SYSTEM_RESET = 0xFF
        , PULSE_OUT = 0x73
        , PULSE_IN = 0x74;

    var serialconnection = null;

    var analogLut = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]; //leonardo https://github.com/arduino/Arduino/blob/master/hardware/arduino/avr/variants/leonardo/pins_arduino.h


    this.digitalCallBack = [];
    this.analogCallBack = [];
    this.pins = [];
    this.analogPins = [];
    this.receiveBuffer = Array(32).fill(0);
    this.bufferLen = this.receiveBuffer.length;
    this.accelStream = false;
    this.accelVal = [0,0,0];
    this.temperature = NaN;
    this.capacitiveTouchValue = [];

    var simpleDigitalValue = [];
    var simpleAnalogValue = [];


    this.setSerialConnection = function (_serialconnection) {
        this.serialconnection = _serialconnection;
    }

    this.recvNewData = function (data) {
        //console.log(data);
        for (var i = 0; i < data.length; i++) {
            //console.log(this.receiveBuffer);
            this.receiveBuffer.shift();
            this.receiveBuffer.push(data[i]);
            this.checkReceivedData();
        }
        //console.log(this.receiveBuffer);
    }

    this.checkReceivedData = function () {
        
        if (this.receiveBuffer[this.bufferLen-29]==START_SYSEX && this.receiveBuffer[this.bufferLen-1]==END_SYSEX) {
            if (this.receiveBuffer[this.bufferLen-28]==0x40 && this.receiveBuffer[this.bufferLen-27]==0x36){
                this.accelStream = true;
                for (var i=0;i<3;i++){
                    var floatBuffer = new ArrayBuffer(4);
                    var floatView = new DataView(floatBuffer);
                    for (var j=0;j<4;j++){
                        var onebyte = (this.receiveBuffer[this.bufferLen-25+i*8+j*2]&0x7F) + ((this.receiveBuffer[this.bufferLen-25+i*8+j*2+1]&0x1)<<7);
                        floatView.setUint8(3-j,onebyte);
                    }
                    this.accelVal[i]=floatView.getFloat32(0);
                }        
            }
        }
        
        if (this.receiveBuffer[this.bufferLen-15]==START_SYSEX && this.receiveBuffer[this.bufferLen-1]==END_SYSEX){
            if (this.receiveBuffer[this.bufferLen-14]==0x40 && this.receiveBuffer[this.bufferLen-13]==0x43){
                var inputPin = (this.receiveBuffer[this.bufferLen-11] & 0x7F) | ((this.receiveBuffer[this.bufferLen-10] & 0x01) << 7);
                var longBuffer = new ArrayBuffer(4);
                var longView = new DataView(longBuffer);
                for (var i=0;i<4;i++){
                    var onebyte = (this.receiveBuffer[this.bufferLen-9+i*2]&0x7F) + ((this.receiveBuffer[this.bufferLen-9+i*2+1]&0x1)<<7);
                    longView.setUint8(3-i,onebyte);
                }
                var sensorValue=longView.getUint32(0);
                this.capacitiveTouchValue[inputPin]=sensorValue;
            }
        }

        /*if (this.receiveBuffer[this.bufferLen-6]==START_SYSEX && this.receiveBuffer[this.bufferLen-5]==PIN_STATE_RESPONSE){
            console.log(this.receiveBuffer);
        }*/
        
        if ((this.receiveBuffer[this.bufferLen - 3] & 0xF0) == DIGITAL_MESSAGE) {
            var port = this.receiveBuffer[this.bufferLen - 3] & 0x0F;
            var portValue = this.receiveBuffer[this.bufferLen - 2] | (this.receiveBuffer[this.bufferLen - 1] << 7);
            var binaryStr = portValue.toString(2);
            binaryStr = "00000000".substr(binaryStr.length) + binaryStr;
            for (var i = 0; i < 8; i++) {
                if (this.digitalCallBack[i + port * 8] != null) this.digitalCallBack[i + port * 8](i + port * 8, (portValue & (1 << i)) != 0);
            }
            //console.log(portValue);
        }
        if ((this.receiveBuffer[this.bufferLen - 3] & 0xF0) == ANALOG_MESSAGE) {
            var pin = this.receiveBuffer[this.bufferLen - 3] & 0x0F;
            var pinValue = this.receiveBuffer[this.bufferLen - 2] | (this.receiveBuffer[this.bufferLen - 1] << 7);
            if (this.analogCallBack[pin] != null) this.analogCallBack[pin](pin, pinValue);
        }
    }

    this.pinMode = function (pin, mode) {
        if (this.pins[pin] == null) this.pins[pin] = {};
        this.pins[pin].mode = mode;
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([PIN_MODE, pin, mode]));
    };

    this.digitalWrite = function (pin, value) {
        var port = Math.floor(pin / 8);
        var portValue = 0;
        if (this.pins[pin] == null) this.pins[pin] = {};
        this.pins[pin].value = value;
        for (var i = 0; i < 8; i++) {
            if (this.pins[8 * port + i] != null && this.pins[8 * port + i].value) {
                portValue |= (1 << i);
            }
        }
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([DIGITAL_MESSAGE | port, portValue & 0x7F, (portValue >> 7) & 0x7F]));
    }
    this.analogWrite = function (pin, value) {
        if (this.pins[pin] == null) this.pins[pin] = {};
        this.pins[pin].value = value;
        if (pin >= 0 && pin <= 15) {
            if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([ANALOG_MESSAGE | pin, value & 0x7F, (value >> 7) & 0x7F]));
        }
    }

    this.queryPinState = function (pin) {
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, PIN_STATE_QUERY, pin, END_SYSEX]));
    };

    this.setDigitalReport = function (port, value) {
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([REPORT_DIGITAL | (port & 0x0F), value ? 1 : 0]));
    };

    this.setAnalogReport = function (pin, value) {
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([REPORT_ANALOG | (pin & 0x0F), value ? 1 : 0]));
    };

    this.sendKeycode = function (keycode) {
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x0F, keycode, END_SYSEX]));
    };

    this.sendString = function (str) {
        for (var i = 0, len = str.length; i < len; i++) {
            this.sendKeycode(str.charCodeAt(i));
        }
    };

    this.readAnalogPin = function (pin, analogCallBack) {
        if ((this.serialconnection) && (pin < analogLut.length)) {
            this.setAnalogReport(pin, true);
            this.pinMode(analogLut[pin], 2);
            this.analogCallBack[pin] = analogCallBack;
        }
    }

    this.readDigitalPin = function (pin, digitalCallBack) {
        this.pinMode(pin, 0);
        this.setDigitalReport(Math.floor(pin / 8), true);
        this.digitalCallBack[pin] = digitalCallBack;
    }

    this.writeDigitalPin = function (pin, level) {
        this.pinMode(pin, 1);
        this.digitalWrite(pin, level);
    }

    var simpleAnalogCallBack = function (pin, value) {
        //var printMsg = "Analog Msg, Pin: " + pin + " PortValue: " + value;
        simpleAnalogValue[pin] = value;
    }

    var simpleDigitalCallBack = function (pin, value) {
        //var printMsg = "Digital Msg, pin: " + pin + " PortValue: " + value;
        simpleDigitalValue[pin] = value;
        //console.logsimpleDigitalValue);

    }

    this.simpleReadDigital = function (pin) {
        var pinValue = false;
        if (this.pins[pin] && this.pins[pin].mode == 0) {
            if (simpleDigitalValue[pin] != null) {
                pinValue = simpleDigitalValue[pin];
            }
        } else {
            this.pinMode(pin, 0);
            this.setDigitalReport(Math.floor(pin / 8), true);
            this.digitalCallBack[pin] = simpleDigitalCallBack;
            //console.log("set to input");
        }
        return pinValue;
    }
    this.simpleWriteDigital = function (pin, value) {
        if (this.pins[pin] && this.pins[pin].mode == 1) {} else {
            this.pinMode(pin, 1);
            //console.log("set to output");
        }
        this.digitalWrite(pin, value);
    }
    this.simpleReadAnalog = function (pin) {
        var pinValue = 0;
        if (this.pins[analogLut[pin]] && this.pins[analogLut[pin]].mode == 2) {
            if (simpleAnalogValue[pin] != null) {
                pinValue = simpleAnalogValue[pin];
            }
        } else {
            this.readAnalogPin(pin, simpleAnalogCallBack);
            if (this.serialconnection) console.log("set to analog");
        }
        return pinValue;
    }
    this.simpleWriteAnalog = function (pin, value) {
        if (this.pins[pin] && this.pins[pin].mode == 3) {} else {
            this.pinMode(pin, 3);
        }
        this.analogWrite(pin, value);
    }
    this.simpleWriteServo = function (pin, value) {
        var pinValue = 0;
        if (this.pins[pin] && this.pins[pin].mode == 4) {} else {
            this.pinMode(pin, 4);
        }
        this.analogWrite(pin, value);
    }
    
    this.circuitPlaygroundSetAccelStream = function (enableVal) {
        if (enableVal && !this.accelStream){
            if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x3A, END_SYSEX]));
            //this.accelStream = true; //do it in receive event
        }else if (!enableVal && this.accelStream){
            if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x3B, END_SYSEX]));
            this.accelStream = false;
        }
    };
    
    this.circuitPlaygroundSimpleReadAccel = function(){
        this.circuitPlaygroundSetAccelStream(true);
        return this.accelVal;
    }
    this.circuitPlaygroundSimpleReadTemperature = function(){
        var analog0Value = this.simpleReadAnalog(0);
        if (analog0Value != 0){
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
            this.temperature = Math.round(steinhart * 10) / 10
        }
        return this.temperature;
    }
    
    this.circuitPlaygroundSetOneNeoPixel = function (r, g, b, index) {
        r &= 0xFF;
        g &= 0xFF;
        b &= 0xFF;
        index &= 0x7F;
        var b1 = r >> 1;
        var b2 = ((r & 0x01) << 6) | (g >> 2);
        var b3 = ((g & 0x03) << 5) | (b >> 3);
        var b4 = (b & 0x07) << 4;
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x10, index, b1, b2, b3, b4, END_SYSEX]));
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x11, END_SYSEX]));
    };
    
    this.circuitPlaygroundReadCapacitiveTouch = function (pin) {
        var validPins = [0, 1, 2, 3, 6, 9, 10, 12];
        if(validPins. indexOf(pin) == -1){
            return 0;
        }
        if (this.pins[pin] == null) this.pins[pin] = {};
        if (this.pins[pin].capStreaming && this.pins[pin].capStreaming == true) {
            if (this.capacitiveTouchValue[pin]){
                return this.capacitiveTouchValue[pin];    
            }
        } else {
            this.pins[pin].capStreaming = true;
            if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x41, pin & 0x7F, END_SYSEX]));
        }
        return 0;
    }
    
    this.circuitPlaygroundPlayTone = function (freq, durationMs) {
        var frequency_hz = freq & 0x3FFF
        var f1 = frequency_hz & 0x7F
        var f2 = frequency_hz >> 7
        var duration_ms = durationMs & 0x3FFF
        var d1 = duration_ms & 0x7F
        var d2 = duration_ms >> 7
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x20, f1, f2, d1, d2, END_SYSEX]));
    }

    this.circuitPlaygroundStopTone = function (freq, durationMs) {
        if (this.serialconnection) this.serialconnection.sendRaw(new Uint8Array([START_SYSEX, 0x40, 0x21, END_SYSEX]));
    }
    
}

/////////global////////
var validPort = null;
var modifiedFirmata = new ModifiedFirmata();

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function (buf) {
    var bufView = new Uint8Array(buf);
    var encodedString = String.fromCharCode.apply(null, bufView);
    return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function (str) {
    var encodedString = unescape(encodeURIComponent(str));
    var bytes = new Uint8Array(encodedString.length);
    for (var i = 0; i < encodedString.length; ++i) {
        bytes[i] = encodedString.charCodeAt(i);
    }
    return bytes.buffer;
};


/////////////////////////////////////////////////////////////////////////////////////
/*
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd)
        define('p5.WebusbFirmata', ['p5'], function (p5) {
            (factory(p5));
        });
    else if (typeof exports === 'object')
        factory(require('../p5'));
    else
        factory(root['p5']);
}(this, function (p5) {

    // =============================================================================
    //                         p5.WebusbFirmata
    // =============================================================================



    p5.WebusbFirmata = function () {
        var self = this;
        serial.getPorts().then(ports => {
            if (ports.length == 0) {
                console.log('No devices found.');
            } else {
                validPort = ports[0];
                connect();
            }
        });
    };

    p5.WebusbFirmata.prototype.simpleWriteDigital = function (_pin, _level) {
        modifiedFirmata.simpleWriteDigital(_pin, _level);
    }

    p5.WebusbFirmata.prototype.simpleReadAnalog = function (pinNumber) {
        return modifiedFirmata.simpleReadAnalog(pinNumber);
    };

    p5.WebusbFirmata.prototype.simpleWriteServo = function (_pin, _value) {
        modifiedFirmata.simpleWriteServo(_pin, _value);
    }

    var SerialConnection = function () {};

    SerialConnection.prototype.send = function (msg) {
        if (validPort) validPort.send(str2ab(msg));
    };

    SerialConnection.prototype.sendRaw = function (rawMsg) {
        if (validPort) validPort.send(rawMsg.buffer);
    };

    var connection = new SerialConnection();

    var connect = function () {
        console.log('Connecting to ' + validPort.device_.productName + '...');
        validPort.connect().then(() => {
            console.log(validPort);
            console.log('Connected.');
            modifiedFirmata.setSerialConnection(connection);
            validPort.onReceive = data => {
                var bufView = new Uint8Array(data.buffer);
                //console.log(bufView);
                modifiedFirmata.recvNewData(bufView);
            }
            validPort.onReceiveError = error => {
                console.log('Receive error: ' + error);
            };
        }, error => {
            console.log('Connection error: ' + error);
        });
    };

    p5.WebusbFirmata.prototype.connect = function () {
        if (validPort) { // do nothing
        } else {
            serial.requestPort().then(selectedPort => {
                validPort = selectedPort;
                connect();
            }).catch(error => {
                console.log('Connection error: ' + error);
            });
        }
    }


}));

// EOF