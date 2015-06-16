var HB = {};
HB.dataBaseIp='http://192.168.0.103:1212';
HB.serverIp = 'http://192.168.0.103:8080';

HB.getCurrentTime=function() {
        var now = new Date();

        var year = now.getFullYear(); //年
        var month = now.getMonth() + 1; //月
        var day = now.getDate(); //日

        var hh = now.getHours(); //时
        var mm = now.getMinutes(); //分

        var clock = year + "-";

        if (month < 10)
            clock += "0";

        clock += month + "-";

        if (day < 10)
            clock += "0";

        clock += day + " ";

        if (hh < 10)
            clock += "0";

        clock += hh + ":";
        if (mm < 10) clock += '0';
        clock += mm;
        return (clock);
    };
HB.loadding = {
    timer: null,
    clearTimer: function() {
        if (this.timer != null) {
            clearTimeout(this.timer);
        }
    },
    timerAction: function(obj) {
        var nowV = obj.attr('aria-valuenow');
        nowV = parseInt(nowV);
        if (nowV >= 100) nowV = 0;
        nowV += 20;
        obj.attr('aria-valuenow', nowV);
        obj.css({
            'width': nowV + '%'
        });
        this.clearTimer();
        this.timer = setTimeout(function() {
            ef.loadding.timerAction(obj);
        }, 200);
    },
    show: function(message) {
        this.clearTimer();
        $.blockUI({
            showOverlay: true,
            overlayCSS: {
                cursor: 'default',
                'z-index': 9999
            },
            message: '',
            css: {
                border: 'none',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                cursor: 'default',
                '-moz-border-radius': '10px',
                'z-index': 100000,
                color: '#fff'
            }
        });
        //this.timerAction(process);
    },
    close: function() {
        this.clearTimer();
        $.unblockUI();
    }
};

