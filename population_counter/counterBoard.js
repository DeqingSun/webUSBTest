var CounterBoard = function () {


    var serialconnection = null;


    this.setSerialConnection = function (_serialconnection, _log) {
        this.serialconnection = _serialconnection;
    }

    this.recvNewData = function (data) {
        log(ab2str(data));
    }




    this.sendTime = function () {
        var date = new Date();
        var year = date.getFullYear()
            , month = date.getMonth() + 1, // months are zero indexed
            day = date.getDate()
            , hour = date.getHours()
            , minute = date.getMinutes()
            , second = date.getSeconds();
        var monthFormatted = month < 10 ? "0" + month : month;
        var dayFormatted = day < 10 ? "0" + day : day;
        var hourFormatted = hour < 10 ? "0" + hour : hour;
        var minuteFormatted = minute < 10 ? "0" + minute : minute;
        var secondFormatted = second < 10 ? "0" + second : second;

        var formatedTime = year + "/" + monthFormatted + "/" + dayFormatted + " " + hourFormatted + ":" + minuteFormatted + ":" + secondFormatted;

        console.log(formatedTime);

        this.serialconnection.send("T:" + formatedTime + "\n");
    }

}