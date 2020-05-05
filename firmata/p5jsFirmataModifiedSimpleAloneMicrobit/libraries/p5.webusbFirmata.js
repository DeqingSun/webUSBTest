//serial code
var serial = {};

var usbfiltersilters = [
    {vendorId: 0xD28}
];

//modified firmata
var ModifiedFirmata = function () {
    /**
     * constants
     */
    
// Firamata Channel Messages

		this.STREAM_ANALOG				= 0xC0; // enable/disable streaming of an analog channel
		this.STREAM_DIGITAL				= 0xD0; // enable/disable tracking of a digital port
		this.ANALOG_UPDATE				= 0xE0; // analog channel update
		this.DIGITAL_UPDATE				= 0x90; // digital port update

		this.SYSEX_START				= 0xF0
		this.SET_PIN_MODE				= 0xF4; // set pin mode
		this.SET_DIGITAL_PIN			= 0xF5; // set pin value
		this.SYSEX_END					= 0xF7
		this.FIRMATA_VERSION			= 0xF9; // request/report Firmata protocol version
		this.SYSTEM_RESET				= 0xFF; // reset Firmata

		// Firamata Sysex Messages

		this.EXTENDED_ANALOG_WRITE		= 0x6F; // analog write (PWM, Servo, etc) to any pin
		this.REPORT_FIRMWARE			= 0x79; // request/report firmware version and name
		this.SAMPLING_INTERVAL			= 0x7A; // set msecs between streamed analog samples

		// BBC micro:bit Sysex Messages (0x01-0x0F)

		this.MB_DISPLAY_CLEAR			= 0x01
		this.MB_DISPLAY_SHOW			= 0x02
		this.MB_DISPLAY_PLOT			= 0x03
		this.MB_SCROLL_STRING			= 0x04
		this.MB_SCROLL_INTEGER			= 0x05
		this.MB_SET_TOUCH_MODE			= 0x06
		this.MB_DISPLAY_ENABLE			= 0x07
		// 0x08-0x0C reserved for additional micro:bit messages
		this.MB_REPORT_EVENT			= 0x0D
		this.MB_DEBUG_STRING			= 0x0E
		this.MB_EXTENDED_SYSEX			= 0x0F; // allow for 128 additional micro:bit messages

		// Firmata Pin Modes

		this.DIGITAL_INPUT				= 0x00
		this.DIGITAL_OUTPUT				= 0x01
		this.ANALOG_INPUT				= 0x02
		this.PWM						= 0x03
		this.INPUT_PULLUP				= 0x0B
		this.INPUT_PULLDOWN				= 0x0F; // micro:bit extension; not defined by Firmata

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
    
    this.buttonAPressed = false;
    this.buttonBPressed = false;
    this.isScrolling = false;

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
        //console.log(this.receiveBuffer);
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
        if (validTarget) validTarget.serialWrite( String.fromCharCode(this.SET_PIN_MODE,pin,mode) );
    };

    this.digitalWrite = function (pin, value) {
        var port = Math.floor(pin / 8);
        var portValue = 0;
        if (this.pins[pin] == null) this.pins[pin] = {};
        this.pins[pin].value = value;
        if (validTarget) validTarget.serialWrite( String.fromCharCode(this.SET_DIGITAL_PIN,pin,value?1:0) );
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
        if ((pin < 0) || (pin > 15)) return;
        if (validTarget) validTarget.serialWrite( String.fromCharCode(this.STREAM_ANALOG | pin, value ? 1 : 0) ); 
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
        if ((validTarget) && (pin < 20)) {
            this.pinMode(pin, 2, false);
            this.setAnalogReport(pin, true);
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
        if (this.pins[pin] && this.pins[pin].mode == 2) {
            if (simpleAnalogValue[pin] != null) {
                pinValue = simpleAnalogValue[pin];
            }
        } else {
            this.readAnalogPin(pin, simpleAnalogCallBack);
            if (validTarget) console.log("set to analog");
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
    
    this.microbitEnableDisplay = function(flag) {
        var enable = flag ? 1 : 0;
		if (validTarget) validTarget.serialWrite( String.fromCharCode(this.SYSEX_START, this.MB_DISPLAY_ENABLE, enable, this.SYSEX_END) );    
    }
    
    this.microbitDisplayPlot = function(x, y, brightness){
        this.isScrolling = false;
        if (validTarget) validTarget.serialWrite( String.fromCharCode(this.SYSEX_START, this.MB_DISPLAY_PLOT, x, y, (brightness / 2) & 0x7F, this.SYSEX_END) );    
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
var validTarget = null;
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
        
        //check if there is paired device already
        navigator.usb.getDevices()
        .then(devices => {
            if (devices.length > 0 ){
                //use first device   
                createDAPLink(devices[0]);
            }else{
                console.log('No devices found.');
            }
        });
    };

    var createDAPLink = function(device){
        //console.log(device);
        const transport = new DAPjs.WebUSB(device);
        validTarget = new DAPjs.DAPLink(transport);
        validTarget.on(DAPjs.DAPLink.EVENT_SERIAL_DATA, data => {
            modifiedFirmata.recvNewData(data);
        });

        validTarget.connect()
        .then(_ => validTarget.setSerialBaudrate(57600))
        .then(_ => validTarget.getSerialBaudrate())
        .then(_ => console.log('buad rate is: '+_))
    }

    p5.WebusbFirmata.prototype.connect = function () {
        if (validTarget) { // do nothing
        } else {
            navigator.usb.requestDevice({
                'filters': usbfiltersilters
            }).then(
                device => createDAPLink(device)
            ).catch(error => {
                console.log('Connection error: ' + error);
            });
        }
    }


}));

// EOF