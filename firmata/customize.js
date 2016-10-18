var timeLeft = 3;
var countingDown = function () {
    if (timeLeft > 0) {
        log('countdown: ' + timeLeft);
        timeLeft--;
        window.setTimeout(countingDown, 1000);
    } else {
        log('send: ' + 'ABC');
        modifiedFirmata.sendString("ABC");
    }
}

var timeLeftArrow = 3;
var countingDownArrow = function () {
    if (timeLeftArrow > 0) {
        log('countdown: ' + timeLeftArrow);
        timeLeftArrow--;
        window.setTimeout(countingDownArrow, 1000);
    } else {
        log('send: ' + 'Arrow Left');
        modifiedFirmata.sendKeycode(0xD8);
    }
}

document.getElementById('sendABC').addEventListener('click', function () {
    timeLeft = 3;
    window.setTimeout(countingDown, 0);
});

document.getElementById('p10high').addEventListener('click', function () {
    modifiedFirmata.simpleWriteDigital(10, true);
});
document.getElementById('p10low').addEventListener('click', function () {
    modifiedFirmata.simpleWriteDigital(10, false);
});
document.getElementById('p10input').addEventListener('click', function () {
    log("pin10:"+modifiedFirmata.simpleReadDigital(10));
});
document.getElementById('readA0').addEventListener('click', function () {
    log("pinA0:"+modifiedFirmata.simpleReadAnalog(0));
});

document.getElementById('readA6').addEventListener('click', function () {
    log("pinA6:"+modifiedFirmata.simpleReadAnalog(6));
});

document.getElementById('readPollA6').addEventListener('click', function () {
    function readA6Func() {
        log("pinA6:"+modifiedFirmata.simpleReadAnalog(6));
    }
    setInterval(readA6Func,250);
});

document.getElementById('sendLeftArrow').addEventListener('click', function () {
    timeLeftArrow=3;
    window.setTimeout(countingDownArrow, 0);
});
