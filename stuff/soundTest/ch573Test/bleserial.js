'use strict';
const bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const MTU = 20;
var bleDevice;
var bleServer;
var nusService;
var rxCharacteristic;
var txCharacteristic;
var batteryCharacteristic;
var connected = false;
var tryToReconnect = true;

function connectionToggle() {
    if (connected) {
        disconnect();
    }
    else {
        connect();
    }
}
// Sets button to either Connect or Disconnect
function setConnButtonState(enabled) {
    if (enabled) {
        document.getElementById("clientConnectButton").innerHTML = "Disconnect Arduino";
    }
    else {
        document.getElementById("clientConnectButton").innerHTML = "Connect Arduino";
    }
}

function connect() {
    if (!navigator.bluetooth) {
        console.log('WebBluetooth API is not available.\r\n' + 'Please make sure the Web Bluetooth flag is enabled.');
        return;
    }
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice({
        filters: [{
            namePrefix: "DeeeLite"
        }]
        , optionalServices: [bleNusServiceUUID,'battery_service']
        , acceptAllDevices: false
    }).then(device => {
        bleDevice = device;
        console.log('Found ' + device.name);
        console.log('Connecting to GATT Server...');
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
        return device.gatt.connect();
    }).then(server => {
        tryToReconnect = true;
        bleServer = server;
        console.log('Locate NUS service');
        return server.getPrimaryService(bleNusServiceUUID);
    }).then(service => {
        nusService = service;
        console.log('Found NUS service: ' + service.uuid);
    }).then(() => {
        console.log('Locate RX characteristic');
        return nusService.getCharacteristic(bleNusCharRXUUID);
    }).then(characteristic => {
        rxCharacteristic = characteristic;
        console.log('Found RX characteristic');
    }).then(() => {
        console.log('Locate TX characteristic');
        return nusService.getCharacteristic(bleNusCharTXUUID);
    }).then(characteristic => {
        txCharacteristic = characteristic;
        console.log('Found TX characteristic');
    }).then(server => {
        console.log('Getting Battery Service.');
        return bleServer.getPrimaryService('battery_service');
    }).then(service => {
        console.log('Getting Battery Level Characteristic.');
        return service.getCharacteristic('battery_level');
    }).then(characteristic => {
        batteryCharacteristic = characteristic;
        console.log('Found Battery Level characteristic');
    }).then(() => {
        console.log('Enable notifications');
        return txCharacteristic.startNotifications();
    }).then(() => {
        console.log('Notifications started');
        txCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        connected = true;
        console.log('\r\n' + bleDevice.name + ' Connected.');
        //nusSendString('\r');
        setConnButtonState(true);
    }).catch(error => {
        console.log('' + error);
        if (bleDevice && bleDevice.gatt.connected) {
            bleDevice.gatt.disconnect();
        }
    });
}

function disconnect() {
    if (!bleDevice) {
        console.log('No Bluetooth Device connected...');
        return;
    }
    console.log('Disconnecting from Bluetooth Device...');
    if (bleDevice.gatt.connected) {
        tryToReconnect = false;
        bleDevice.gatt.disconnect();
        connected = false;
        setConnButtonState(false);
        console.log('Bluetooth Device connected: ' + bleDevice.gatt.connected);
    }
    else {
        console.log('> Bluetooth Device is already disconnected');
    }
}

function onDisconnected() {
    connected = false;
    console.log('\r\n' + bleDevice.name + ' Disconnected.');
    setConnButtonState(false);
    if (tryToReconnect) {
        console.log("Try reconnect");
        reconnect();
    }
}

function reconnect() {
    bleDevice.gatt.connect().then(server => {
        tryToReconnect = true;
        bleServer = server;
        console.log('Locate NUS service');
        return server.getPrimaryService(bleNusServiceUUID);
    }).then(service => {
        nusService = service;
        console.log('Found NUS service: ' + service.uuid);
    }).then(() => {
        console.log('Locate RX characteristic');
        return nusService.getCharacteristic(bleNusCharRXUUID);
    }).then(characteristic => {
        rxCharacteristic = characteristic;
        console.log('Found RX characteristic');
    }).then(() => {
        console.log('Locate TX characteristic');
        return nusService.getCharacteristic(bleNusCharTXUUID);
    }).then(characteristic => {
        txCharacteristic = characteristic;
        console.log('Found TX characteristic');
    }).then(server => {
        console.log('Getting Battery Service.');
        return bleServer.getPrimaryService('battery_service');
    }).then(service => {
        console.log('Getting Battery Level Characteristic.');
        return service.getCharacteristic('battery_level');
    }).then(characteristic => {
        batteryCharacteristic = characteristic;
        console.log('Found Battery Level characteristic');
    }).then(() => {
        console.log('Enable notifications');
        return txCharacteristic.startNotifications();
    }).then(() => {
        console.log('Notifications started');
        txCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        connected = true;
        console.log('\r\n' + bleDevice.name + ' Connected.');
        //nusSendString('\r');
        setConnButtonState(true);
    }).catch(error => {
        console.log('' + error);
        if (bleDevice && bleDevice.gatt.connected) {
            bleDevice.gatt.disconnect();
        }
    });
}

function handleNotifications(event) {
    console.log('notification');
    let value = event.target.value;
    // Convert raw data bytes to character values and use these to 
    // construct a string.
    let str = "";
    for (let i = 0; i < value.byteLength; i++) {
        str += String.fromCharCode(value.getUint8(i));
    }
    console.log(str);
}

function nusSendString(s) {
    if (bleDevice && bleDevice.gatt.connected) {
        console.log("send: " + s);
        let val_arr = new Uint8Array(s.length)
        for (let i = 0; i < s.length; i++) {
            let val = s[i].charCodeAt(0);
            val_arr[i] = val;
        }
        sendNextChunk(val_arr);
    }
    else {
        console.log('Not connected to a device yet.');
    }
}

function sendNextChunk(a) {
    let chunk = a.slice(0, MTU);
    rxCharacteristic.writeValue(chunk).then(function () {
        if (a.length > MTU) {
            sendNextChunk(a.slice(MTU));
        }
    });
}

function getBatteryLevel() {
    return batteryCharacteristic.readValue().then(
        value => {
            return value.getUint8(0);
        }
    );
}