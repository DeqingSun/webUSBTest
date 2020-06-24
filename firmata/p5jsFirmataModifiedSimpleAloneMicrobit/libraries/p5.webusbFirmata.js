//serial code
var dapLinkSerial = {};
var usbfilters = [{
    'vendorId': 0xD28
        }]; //daplink
var validPort = null;

(function () {
    'use strict';

    const DAPLinkSerial_READ_SETTINGS = 0x81;
    const DAPLinkSerial_WRITE_SETTINGS = 0x82;
    const DAPLinkSerial_READ = 0x83;
    const DAPLinkSerial_WRITE = 0x84;

    const GET_REPORT = 0x01;
    const SET_REPORT = 0x09;
    const OUT_REPORT = 0x200;
    const IN_REPORT = 0x100;

    dapLinkSerial.getPorts = async function () {
        var devices = await navigator.usb.getDevices();
        return devices.map(device => new dapLinkSerial.Port(device));
    };

    dapLinkSerial.requestPort = async function () {
        var device = await navigator.usb.requestDevice({
            'filters': usbfilters
        });
        return new dapLinkSerial.Port(device);
    }

    dapLinkSerial.Port = function (device) {
        this.device_ = device;
        this.interfaceNumber_ = undefined;
        this.endpointIn_ = undefined;
        this.endpointOut_ = undefined;
        this.packetSize = 64;
    };

    dapLinkSerial.Port.prototype.connect = async function () {
        /*let readLoop = () => {
            this.device_.transferIn(this.endpointIn_, 64).then(result => {
                this.onReceive(result.data);
                readLoop();
            }, error => {
                this.onReceiveError(error);
            });
        };*/

        await this.device_.open();
        if (this.device_.configuration === null) {
            await this.device_.selectConfiguration(1);
        }
        var configurationInterfaces = this.device_.configuration.interfaces;
        //find interface with Class #0xFF (vendor specified), if multiple exists, the last one will be used.
        configurationInterfaces.forEach(element => {
            //console.log("DEBUG","iteration interface",element.interfaceNumber)
            element.alternates.forEach(elementalt => {
                //console.log("DEBUG","iteration alternates",elementalt)
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
        
        if (!this.interfaceNumber_){
            alert("The connected micro:bit does not have WebUSB interface. Please upgrade firmware and try again. Refer to:https://microbit.org/get-started/user-guide/firmware/");
            throw "WEBUSB not found, maybe your bootloader is old."
        }
        
        //console.log("DEBUG","claimInterface",this.interfaceNumber_)
        await this.device_.claimInterface(this.interfaceNumber_)
        //console.log("DEBUG","claimedInterface",this.interfaceNumber_)

        await this.setSerialBaud(57600)

        var baudrate = await this.getSerialBaud()
        console.log("baudrate is set to " + baudrate)

        return;
    };

    dapLinkSerial.Port.prototype.disconnect = async function () {
        return (await this.device_.close());
    };

    dapLinkSerial.Port.prototype.write = async function (buffer) {
        if (this.interfaceNumber_ === undefined) {
            throw new Error('No device opened');
        }

        if (this.endpointOut_) {
            // Use endpoint if it exists
            return (await this.device_.transferOut(this.endpointOut_, buffer));
        } else {
            // Fallback to using control transfer
            return (await this.device_.controlTransferOut({
                requestType: 'class'
                , recipient: 'interface'
                , request: SET_REPORT
                , value: OUT_REPORT
                , index: this.interfaceNumber_
            }, buffer));
        }
        return;
    }

    dapLinkSerial.Port.prototype.read = async function () {
        if (this.interfaceNumber_ === undefined) {
            throw new Error('No device opened');
        }

        let result;

        if (this.endpointIn_) {
            // Use endpoint if it exists
            result = await this.device_.transferIn(this.endpointIn_, this.packetSize);
        } else {
            // Fallback to using control transfer
            result = await this.device_.controlTransferIn({
                    requestType: 'class'
                    , recipient: 'interface'
                    , request: GET_REPORT
                    , value: IN_REPORT
                    , index: this.interfaceNumber_
                }
                , this.packetSize
            );
        }
        return result.data;
    }


    dapLinkSerial.Port.prototype.sendSerialArray = async function (arrayData) {
        arrayData.unshift(arrayData.length);
        arrayData.unshift(DAPLinkSerial_WRITE);
        return (await this.write(new Uint8Array(arrayData)).buffer);
    }

    dapLinkSerial.Port.prototype.readSerialArray = async function () {
        var arrayData = [DAPLinkSerial_READ];
        await this.write(new Uint8Array(arrayData)).buffer;
        var result = await this.read()
        var resultBuf = result.buffer;
        if (resultBuf.byteLength > 2) {
            if (result.getUint8(0) == DAPLinkSerial_READ) {
                var recvLength = result.getUint8(1);
                const offset = 2;
                return (new Uint8Array(resultBuf.slice(offset, offset + recvLength)))
            }
        }
        return null;
    }

    dapLinkSerial.Port.prototype.setSerialBaud = async function (baud) {
        var arrayData = [DAPLinkSerial_WRITE_SETTINGS, (baud >> 0) & 0xFF, (baud >> 8) & 0xFF, (baud >> 16) & 0xFF, (baud >> 24) & 0xFF];
        await this.write(new Uint8Array(arrayData)).buffer;
        var result = await this.read()
        return (result);
    }

    dapLinkSerial.Port.prototype.getSerialBaud = async function () {
        var arrayData = [DAPLinkSerial_READ_SETTINGS];
        await this.write(new Uint8Array(arrayData)).buffer
        var result = await this.read()
        return (result.getUint32(1, true));
    }

})();

//modified firmata
var MicrobitFirmataClient = function () {

    this.inbuf = new Uint8Array(1000);
    this.inbufCount = 0;

    this.boardVersion = '';
    this.firmataVersion = '';
    this.firmwareVersion = '';

    this.buttonAPressed = false;
    this.buttonBPressed = false;
    this.isScrolling = false;

    this.digitalInput = new Array(21).fill(false);
    this.analogChannel = new Array(16).fill(0);
    this.eventListeners = new Array();
    this.updateListeners = new Array();

    // statistics:
    this.analogUpdateCount = 0;
    this.channelUpdateCounts = new Array(16).fill(0);

    // Firamata Channel Messages

    this.STREAM_ANALOG = 0xC0; // enable/disable streaming of an analog channel
    this.STREAM_DIGITAL = 0xD0; // enable/disable tracking of a digital port
    this.ANALOG_UPDATE = 0xE0; // analog channel update
    this.DIGITAL_UPDATE = 0x90; // digital port update

    this.SYSEX_START = 0xF0
    this.SET_PIN_MODE = 0xF4; // set pin mode
    this.SET_DIGITAL_PIN = 0xF5; // set pin value
    this.SYSEX_END = 0xF7
    this.FIRMATA_VERSION = 0xF9; // request/report Firmata protocol version
    this.SYSTEM_RESET = 0xFF; // reset Firmata

    // Firamata Sysex Messages

    this.EXTENDED_ANALOG_WRITE = 0x6F; // analog write (PWM, Servo, etc) to any pin
    this.REPORT_FIRMWARE = 0x79; // request/report firmware version and name
    this.SAMPLING_INTERVAL = 0x7A; // set msecs between streamed analog samples

    // BBC micro:bit Sysex Messages (0x01-0x0F)

    this.MB_DISPLAY_CLEAR = 0x01
    this.MB_DISPLAY_SHOW = 0x02
    this.MB_DISPLAY_PLOT = 0x03
    this.MB_SCROLL_STRING = 0x04
    this.MB_SCROLL_INTEGER = 0x05
    this.MB_SET_TOUCH_MODE = 0x06
    this.MB_DISPLAY_ENABLE = 0x07
        // 0x08-0x0C reserved for additional micro:bit messages
    this.MB_REPORT_EVENT = 0x0D
    this.MB_DEBUG_STRING = 0x0E
    this.MB_EXTENDED_SYSEX = 0x0F; // allow for 128 additional micro:bit messages

    // Firmata Pin Modes

    this.DIGITAL_INPUT = 0x00
    this.DIGITAL_OUTPUT = 0x01
    this.ANALOG_INPUT = 0x02
    this.PWM = 0x03
    this.INPUT_PULLUP = 0x0B
    this.INPUT_PULLDOWN = 0x0F; // micro:bit extension; not defined by Firmata
    this.INPUT_PULLDOWN = 0x0F; // micro:bit extension; not defined by Firmata

    this.dataReceived = function (data) {
        //console.log(data)
        if ((this.inbufCount + data.length) < this.inbuf.length) {
            this.inbuf.set(data, this.inbufCount);
            this.inbufCount += data.length;
            this.processFirmatMessages();
        }
    }

    this.requestFirmataVersion = function () {
        this.myPort_write([this.FIRMATA_VERSION, 0, 0]);
    }

    this.requestFirmwareVersion = function () {
        this.myPort_write([this.SYSEX_START, this.REPORT_FIRMWARE, this.SYSEX_END]);
    }

    this.myPort_write = function (data) {
        if (validPort && validPort.interfaceNumber_!=undefined) validPort.sendSerialArray(data)
        //    console.log(data);
    }

    // Internal: Parse Incoming Firmata Messages

    this.processFirmatMessages = function () {
        // Process and remove all complete Firmata messages in inbuf.

        if (!this.inbufCount) return; // nothing received
        var cmdStart = 0;
        while (true) {
            cmdStart = this.findCmdByte(cmdStart);
            if (cmdStart < 0) {; // no more messages
                this.inbufCount = 0;
                return;
            }
            var skipBytes = this.dispatchCommand(cmdStart);
            if (skipBytes < 0) {
                // command at cmdStart is incomplete: remove processed messages and exit
                if (0 == cmdStart) return; // cmd is already at start of inbuf
                var remainingBytes = this.inbufCount - cmdStart;
                this.inbuf.copyWithin(0, cmdStart, cmdStart + remainingBytes);
                this.inbufCount = remainingBytes;
                return;
            }
            cmdStart += skipBytes;
        }
    }

    this.findCmdByte = function (startIndex) {
        for (var i = startIndex; i < this.inbufCount; i++) {
            if (this.inbuf[i] & 0x80) return i;
        }
        return -1;
    }

    this.dispatchCommand = function (cmdStart) {
        // Attempt to process the command starting at the given index in inbuf.
        // If the command is incomplete, return -1.
        // Otherwise, process it and return the number of bytes in the entire command.

        var cmdByte = this.inbuf[cmdStart];
        var chanCmd = cmdByte & 0xF0;
        var argBytes = 0;
        var nextCmdIndex = this.findCmdByte(cmdStart + 1);
        if (nextCmdIndex < 0) {; // no next command; current command may not be complete
            if (this.SYSEX_START == cmdByte) return -1; // incomplete sysex
            argBytes = this.inbufCount - (cmdStart + 1);
            var argsNeeded = 2;
            if (0xFF == cmdByte) argsNeeded = 0;
            if ((0xC0 == chanCmd) || (0xD0 == chanCmd)) argsNeeded = 1;
            if (argBytes < argsNeeded) return -1;
        } else {
            argBytes = nextCmdIndex - (cmdStart + 1);
        }

        if (this.SYSEX_START == cmdByte) {; // system exclusive message: SYSEX_START ...data ... SYSEX_END
            if (this.SYSEX_END != this.inbuf[cmdStart + argBytes + 1]) {
                // last byte is not SYSEX_END; skip this message
                return argBytes + 1; // skip cmd + argBytes
            }
            this.dispatchSysexCommand(cmdStart + 1, argBytes - 1);
            return argBytes + 2; // skip cmd, arg bytes, and final SYSEX_END
        }

        var chan = cmdByte & 0xF;
        var arg1 = (argBytes > 0) ? this.inbuf[cmdStart + 1] : 0;
        var arg2 = (argBytes > 1) ? this.inbuf[cmdStart + 2] : 0;

        if (this.DIGITAL_UPDATE == chanCmd) this.receivedDigitalUpdate(chan, (arg1 | (arg2 << 7)));
        if (this.ANALOG_UPDATE == chanCmd) this.receivedAnalogUpdate(chan, (arg1 | (arg2 << 7)));
        if (this.FIRMATA_VERSION == cmdByte) this.receivedFirmataVersion(arg1, arg2);

        return argBytes + 1;
    }

    this.dispatchSysexCommand = function (sysexStart, argBytes) {
        var sysexCmd = this.inbuf[sysexStart];
        switch (sysexCmd) {
        case this.MB_REPORT_EVENT:
            this.receivedEvent(sysexStart, argBytes);
            break;
        case this.MB_DEBUG_STRING:
            var buf = this.inbuf.slice(sysexStart + 1, sysexStart + 1 + argBytes);
            console.log('DB: ' + new TextDecoder().decode(buf));
            break;
        case this.REPORT_FIRMWARE:
            this.receivedFirmwareVersion(sysexStart, argBytes);
            break;
        }
    }

    // Internal: Handling Messages from the micro:bit

    this.receivedFirmataVersion = function (major, minor) {
        this.firmataVersion = 'Firmata Protocol ' + major + '.' + minor;
    }

    this.receivedFirmwareVersion = function (sysexStart, argBytes) {
        var major = this.inbuf[sysexStart + 1];
        var minor = this.inbuf[sysexStart + 2];
        var utf8Bytes = new Array();
        for (var i = sysexStart + 3; i <= argBytes; i += 2) {
            utf8Bytes.push(this.inbuf[i] | (this.inbuf[i + 1] << 7));
        }
        var firmwareName = new TextDecoder().decode(Buffer.from(utf8Bytes));
        this.firmwareVersion = firmwareName + ' ' + major + '.' + minor;
    }

    this.receivedDigitalUpdate = function (chan, pinMask) {
        var pinNum = 8 * chan;
        for (var i = 0; i < 8; i++) {
            var isOn = ((pinMask & (1 << i)) != 0);
            if (pinNum < 21) this.digitalInput[pinNum] = isOn;
            pinNum++;
        }
    }

    this.receivedAnalogUpdate = function (chan, value) {
        if (value > 8191) value = value - 16384; // negative value (14-bits 2-completement)
        this.analogChannel[chan] = value;

        // update stats:
        this.analogUpdateCount++;
        this.channelUpdateCounts[chan]++;

        for (var f of this.updateListeners) f.call(); // notify all update listeners
    }

    this.receivedEvent = function (sysexStart, argBytes) {
        const MICROBIT_ID_BUTTON_A = 1;
        const MICROBIT_ID_BUTTON_B = 2;
        const MICROBIT_BUTTON_EVT_DOWN = 1;
        const MICROBIT_BUTTON_EVT_UP = 2;

        const MICROBIT_ID_DISPLAY = 6;
        const MICROBIT_DISPLAY_EVT_ANIMATION_COMPLETE = 1;

        var sourceID =
            (this.inbuf[sysexStart + 3] << 14) |
            (this.inbuf[sysexStart + 2] << 7) |
            this.inbuf[sysexStart + 1];
        var eventID =
            (this.inbuf[sysexStart + 6] << 14) |
            (this.inbuf[sysexStart + 5] << 7) |
            this.inbuf[sysexStart + 4];

        if (sourceID == MICROBIT_ID_BUTTON_A) {
            if (eventID == MICROBIT_BUTTON_EVT_DOWN) this.buttonAPressed = true;
            if (eventID == MICROBIT_BUTTON_EVT_UP) this.buttonAPressed = false;
        }
        if (sourceID == MICROBIT_ID_BUTTON_B) {
            if (eventID == MICROBIT_BUTTON_EVT_DOWN) this.buttonBPressed = true;
            if (eventID == MICROBIT_BUTTON_EVT_UP) this.buttonBPressed = false;
        }
        if ((sourceID == MICROBIT_ID_DISPLAY) &&
            (eventID == MICROBIT_DISPLAY_EVT_ANIMATION_COMPLETE)) {
            this.isScrolling = false;
        }

        // notify event listeners
        for (var f of this.eventListeners) f.call(null, sourceID, eventID);
    }

    // Display Commands

    this.enableDisplay = function (enableFlag) {
        // Enable or disable the display. When the display is disabled, the edge connector
        // pins normall used by the display can be used for other I/O functions.
        // Re-enabling the display (even when is already enabled) disables the light
        // sensor which, when running monopolizes the A/D converter preventing all pins
        // from being used for analog input. Requesting a light sensor value restarts
        // the light sensor.

        var enable = enableFlag ? 1 : 0;
        this.myPort_write([this.SYSEX_START, this.MB_DISPLAY_ENABLE, enable, this.SYSEX_END]);
    }

    this.displayClear = function () {
        // Clear the display and stop any ongoing animation.

        this.isScrolling = false;
        this.myPort_write([this.SYSEX_START, this.MB_DISPLAY_CLEAR, this.SYSEX_END]);
    }

    this.displayShow = function (useGrayscale, pixels) {
        // Display the given 5x5 image on the display. If useGrayscale is true, pixel values
        // are brightness values in the range 0-255. Otherwise, a zero pixel value means off
        // and >0 means on. Pixels is an Array of 5-element Arrays.

        this.isScrolling = false;
        this.myPort_write([this.SYSEX_START, this.MB_DISPLAY_SHOW]);
        this.myPort_write([useGrayscale ? 1 : 0]);
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                var pix = pixels[y][x];
                if (pix > 1) pix = pix / 2; // transmit as 7-bits
                this.myPort_write([pix & 0x7F]);
            }
        }
        this.myPort_write([this.SYSEX_END]);
    }

    this.displayPlot = function (x, y, brightness) {
        // Set the display pixel at x, y to the given brightness (0-255).

        this.isScrolling = false;
        this.myPort_write([this.SYSEX_START, this.MB_DISPLAY_PLOT, x, y, (brightness / 2) & 0x7F, this.SYSEX_END]);
    }

    this.scrollString = function (s, delay) {
        // Scroll the given string across the display with the given delay.
        // Omit the delay parameter to use the default scroll speed.
        // The maximum string length is 100 characters.

        this.isScrolling = true;
        if (null == delay) delay = 120;
        if (s.length > 100) s = s.slice(0, 100);
        var buf = new TextEncoder().encode(s);
        this.myPort_write([this.SYSEX_START, this.MB_SCROLL_STRING, delay]);
        for (var i = 0; i < buf.length; i++) {
            var b = buf[i];
            this.myPort_write([b & 0x7F, (b >> 7) & 0x7F]);
        }
        this.myPort_write([this.SYSEX_END]);
    }

    this.scrollInteger = function (n, delay) {
        // Scroll the given integer value across the display with the given delay.
        // Omit the delay parameter to use the default scroll speed.
        // Note: 32-bit integer is transmitted as five 7-bit data bytes.

        this.isScrolling = true;
        if (null == delay) delay = 120;
        this.myPort_write([this.SYSEX_START, this.MB_SCROLL_INTEGER, delay, n & 0x7F, (n >> 7) & 0x7F, (n >> 14) & 0x7F, (n >> 21) & 0x7F, (n >> 28) & 0x7F, this.SYSEX_END]);
    }


    // Pin and Sensor Channel Commands

    this.setPinMode = function (pinNum, mode) {
        if ((pinNum < 0) || (pinNum > 20)) return;
        this.myPort_write([this.SET_PIN_MODE, pinNum, mode]);
    }

    this.trackDigitalPin = function (pinNum, optionalMode) {
        // Start tracking the given pin as a digital input.
        // The optional mode can be 0 (no pullup or pulldown), 1 (pullup resistor),
        // or 2 (pulldown resistor). It defaults to 0.

        if ((pinNum < 0) || (pinNum > 20)) return;
        var port = pinNum >> 3;
        var mode = this.DIGITAL_INPUT; // default
        if (0 == optionalMode) mode = this.DIGITAL_INPUT;
        if (1 == optionalMode) mode = this.INPUT_PULLUP;
        if (2 == optionalMode) mode = this.INPUT_PULLDOWN;
        this.myPort_write([this.SET_PIN_MODE, pinNum, mode]);
        this.myPort_write([this.STREAM_DIGITAL | port, 1]);
    }

    this.stopTrackingDigitalPins = function () {
        // Stop tracking all digital pins.

        for (var i = 0; i < 3; i++) {
            this.myPort_write([this.STREAM_DIGITAL | i, 0]);
        }
    }

    this.clearChannelData = function () {
        // Reset analog channel values and statistics.

        this.analogChannel.fill(0);
        this.analogUpdateCount = 0; // statistic: total number of analog updates received
        this.channelUpdateCounts.fill(0); // statistic: number of updates received for each analog channel
    }

    this.streamAnalogChannel = function (chan) {
        // Start streaming the given analog channel.

        if ((chan < 0) || (chan > 15)) return;
        this.myPort_write([this.STREAM_ANALOG | chan, 1]);
    }

    this.stopStreamingAnalogChannel = function (chan) {
        // Stop streaming the given analog channel.

        if ((chan < 0) || (chan > 15)) return;
        this.myPort_write([this.STREAM_ANALOG | chan, 0]);
    }

    this.setAnalogSamplingInterval = function (samplingMSecs) {
        // Set the number of milliseconds (1-16383) between analog channel updates.

        if ((samplingMSecs < 1) || (samplingMSecs > 16383)) return;
        this.myPort_write([this.SYSEX_START, this.SAMPLING_INTERVAL, samplingMSecs & 0x7F, (samplingMSecs >> 7) & 0x7F, this.SYSEX_END]);
    }

    this.enableLightSensor = function () {
        // Enable the light sensor.
        // Note: When running, the light sensor monopolizes the A/D converter, preventing
        // use of the analog input pins. Thus, the light sensor is disabled by default.
        // This method can be used to enable it.

        this.myPort_write([this.SET_PIN_MODE, 11, this.ANALOG_INPUT]);
    }

    this.setTouchMode = function (pinNum, touchModeOn) {
        // Turn touch mode on/off for a pin. Touch mode is only supported for pins 0-2).
        // When touch mode is on, the pin generates events as if it were a button.

        if ((pinNum < 0) || (pinNum > 2)) return;
        var mode = touchModeOn ? 1 : 0;
        this.myPort_write([this.SYSEX_START, this.MB_SET_TOUCH_MODE, pinNum, mode, this.SYSEX_END]);
    }

    // Event/Update Listeners

    this.addFirmataEventListener = function (eventListenerFunction) {
        // Add a listener function to handle micro:bit DAL events.
        // The function arguments are the sourceID and eventID (both numbers).

        this.eventListeners.push(eventListenerFunction);
    }

    this.addFirmataUpdateListener = function (updateListenerFunction) {
        // Add a listener function (with no arguments) called when sensor or pin updates arrive.

        this.updateListeners.push(updateListenerFunction);
    }

    this.removeAllFirmataListeners = function () {
        // Remove all event and update listeners. Used by test suite.

        this.eventListeners = [];
        this.updateListeners = [];
    }

    // Digital and Analog Outputs

    this.setDigitalOutput = function (pinNum, turnOn) {
        // Make the given pin an output and turn it off (0 volts) or on (3.3 volts)
        // based on the boolean turnOn parameter.
        // This can be used, for example, to turn an LED on or off.

        if ((pinNum < 0) || (pinNum > 20)) return;
        this.myPort_write([this.SET_PIN_MODE, pinNum, this.DIGITAL_OUTPUT]);
        this.myPort_write([this.SET_DIGITAL_PIN, pinNum, (turnOn ? 1 : 0)]);
    }

    this.setAnalogOutput = function (pinNum, level) {
        // Output a simulated analog voltage level on the given pin,
        // where level (0-1023) maps to a simulated voltage of 0 to 3.3 volts.
        // Since micro:bit pins can only be on or off, the voltage level is simulated
        // using "pulse width modulation" (PWM). That is, the pin is turned and off
        // rapidly, using the level to determine what fraction of time the pin is on.
        // PWM can be used, for example, to control the brightness of an LED.

        if ((pinNum < 0) || (pinNum > 20)) return;
        this.myPort_write([this.SET_PIN_MODE, pinNum, this.PWM]);
        this.myPort_write([this.SYSEX_START, this.EXTENDED_ANALOG_WRITE, pinNum, (level & 0x7F), ((level >> 7) & 0x7F), this.SYSEX_END]);
    }

    this.turnOffOutput = function (pinNum) {
        // Turn off either the digital or analog output of the given pin.
        // (The pin reverts to being an input pin with no pullup.)

        if ((pinNum < 0) || (pinNum > 20)) return;
        this.myPort_write([this.SET_PIN_MODE, pinNum, this.DIGITAL_INPUT]);
    }
}

/////////global////////
var microbitFirmataClient = new MicrobitFirmataClient();

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

    var connect = async function () {
        console.log('Connecting to ' + validPort.device_.productName + '...');
        try {
            await validPort.connect();
            console.log(validPort);
            console.log('Connected.');
            await setTimeout(ownSerialPoll, 0)
            await setTimeout(checkFirmataVersionBootup, 1000)

        } catch (err) {
            console.log('Connection error: ' + err);
        }
    };

    async function initFunc() {
        ports = await dapLinkSerial.getPorts();
        if (ports.length == 0) {
            console.log('No devices found.');
        } else {
            validPort = ports[0];
            connect();
        }
    }

    async function connectDAPLink() {
        if (validPort) { // do nothing
        } else {
            try {
                validPort = await dapLinkSerial.requestPort()
                connect();
            } catch (err) {
                console.log('Connection error: ' + err);
            }
        }
    }

    async function ownSerialPoll() {
        while (true) {
            const serialData = await validPort.readSerialArray();
            if (serialData != null && serialData.length > 0) {
                //console.log(serialData)
                microbitFirmataClient.dataReceived(serialData);
            }
            await new Promise(resolve => setTimeout(resolve, 30));
        };
    }

    async function checkFirmataVersionBootup() {
        while (microbitFirmataClient.firmataVersion == '') {
            console.log('checkFirmataVersionBootup ')
            microbitFirmataClient.requestFirmataVersion(); //F9
            await new Promise(resolve => setTimeout(resolve, 50));
        };
        console.log('checkFirmataVersion OK')
    }

    p5.WebusbFirmata = function () {
        var self = this;
        initFunc();
    };

    p5.WebusbFirmata.prototype.connect = function () {
        connectDAPLink();
    }


}));

// EOF