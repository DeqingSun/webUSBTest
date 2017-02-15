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

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

function connect() {
    log('Connecting to ' + validPort.device_.productName + '...');
    validPort.connect().then(() => {
        console.log(validPort);
        log('Connected.');
        document.getElementById('connect').textContent = 'Disconnect';
        modifiedFirmata.setSerialConnection(connection, log);
        validPort.onReceive = data => {
            //let textDecoder = new TextDecoder();
            //t.io.print(textDecoder.decode(data));
            var bufView = new Uint8Array(data.buffer);
            modifiedFirmata.recvNewData(bufView);
        }
        validPort.onReceiveError = error => {
            log('Receive error: ' + error);
        };
    }, error => {
        log('Connection error: ' + error);
    });
};

function connectWebUSB() {
    if (validPort) {
        validPort.disconnect();
        document.getElementById('connect').textContent = 'Connect';
    } else {
        serial.requestPort().then(selectedPort => {
            validPort = selectedPort;
            connect();
        }).catch(error => {
            log('Connection error: ' + error);
        });
    }
};


if (!navigator.usb){
    setTimeout(function(){ log("navigator.usb ERROR") }, 0);
}else{
    serial.getPorts().then(ports => {
        if (ports.length == 0) {
            log('No devices found.');
        } else {
            validPort = ports[0];
            connect();
        }
    });
}

if ('BlocklyStorage' in window) {
    BlocklyStorage.HTTPREQUEST_ERROR = 'There was a problem with the request.\n';
    BlocklyStorage.LINK_ALERT = 'Share your blocks with this link:\n\n%1';
    BlocklyStorage.HASH_ERROR = 'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
    BlocklyStorage.XML_ERROR = 'Could not load your saved file.\nPerhaps it was created with a different version of Blockly?';
} else {
	setTimeout(function(){log("Sorry, cloud storage is not available.")},0);
}

var SerialConnection = function () {

};

SerialConnection.prototype.send = function (msg) {
    validPort.send(str2ab(msg));
};

SerialConnection.prototype.sendRaw = function (rawMsg) {
    if (this.connectionId < 0) {
        throw 'Invalid connection';
    }
    validPort.send(rawMsg.buffer);
};

var connection = new SerialConnection();

function log(msg) {
    var buffer = document.querySelector('#buffer');
    buffer.innerHTML = msg + '<br>' + buffer.innerHTML;
    var lines = buffer.innerHTML.split('<br>');
    if (lines.length > 10 - 1) {
        lines.pop();
        buffer.innerHTML = lines.join('<br>');
    }
}