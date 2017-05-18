var lastLEDTime = 0;
var io1circleColor;
var sliderValue = 0;
var webusbFirmata;

function setup() {
    createCanvas(640, 360);
    webusbFirmata = new p5.WebusbFirmata(); // make a new instance of the Makesense library
    //webusbFirmata.easyReadsetup();

    io1circleColor = color(0, 0, 0);

}

function draw() {
    background(255);
    var timeNow = millis();
    if ((timeNow - lastLEDTime) > 1000) {
        lastLEDTime = timeNow;
        if (Math.round(timeNow / 1000) & 1) { //alternatively
            webusbFirmata.simpleWriteDigital(10,true);
            io1circleColor = color(255, 255, 255);
        } else {
            webusbFirmata.simpleWriteDigital(10,false);
            io1circleColor = color(0, 0, 0);
        }
    }
    
    sliderValue=webusbFirmata.simpleReadAnalog(0);

    fill(0);
    text("IO 10", 10, 30);
    text("Read IO A0: " + sliderValue, 10, 90);
    fill(io1circleColor);
    ellipse(30, 50, 30, 30);
    fill(0);
    rect(10, 100, sliderValue / 2, 10);
}

function mouseClicked() {
  webusbFirmata.connect();//will not reconnect if already connected
}
