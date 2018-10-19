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

    var analogLut = [18, 19, 20, 21, 22, 23, 4, 6, 8, 9, 10, 12]; //leonardo https://github.com/arduino/Arduino/blob/master/hardware/arduino/avr/variants/leonardo/pins_arduino.h


    this.digitalCallBack = [];
    this.analogCallBack = [];
    this.pins = [];
    this.analogPins = [];
    this.receiveBuffer = [0, 0, 0, 0, 0, 0];
    this.bufferLen = this.receiveBuffer.length;

    var simpleDigitalValue = [];
    var simpleAnalogValue = [];


    this.setSerialConnection = function (_serialconnection, _log) {
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
        if (pin < analogLut.length) {
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
        //console.log(simpleDigitalValue);

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
        var pinValue = false;
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
            console.log("set to analog");
        }
        return pinValue;
    }

    this.simpleWriteServo = function (pin, value) {
        var pinValue = 0;
        if (this.pins[pin] && this.pins[pin].mode == 4) {} else {
            this.pinMode(pin, 4);
        }
        this.analogWrite(pin, value);

    }
}