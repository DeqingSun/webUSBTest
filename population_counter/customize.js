

document.getElementById('updateTime').addEventListener('click', function () {
    counterBoard.sendTime();
});

document.getElementById('sendData').addEventListener('click', function () {
    for (i=2017;i<2037;i++){
        var command = "D:"+i+","+ document.getElementById('pop'+i).value + "\n";
        counterBoard.serialconnection.send(command);
    }
});



/*document.getElementById('test').addEventListener('click', function () {
    counterBoard.serialconnection.send("T:2001/01/01 00:00:00" + "\n");;
});*/

//USB DEBUG
function getChromeVersion () {     
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9\.]+)\./);

    return raw ? (raw[2]) : false;
}
log('Chrome Version: '+getChromeVersion());
if (!navigator.usb) log("navigator.usb ERROR")
