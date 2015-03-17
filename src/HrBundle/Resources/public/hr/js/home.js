/**
 * Tiles implementation by HR
 *
 * Created by HR on 10/03/15.
 *
 * For now: all rights reserved.
 */

var errHandler = null;

//error handler safeguard
function safeGuardErrorHandler() {
    if (null == errHandler) {
        errHandler = new ErrorHandler();
    }
}

//page load
$(window).ready(
    function () {
        try {
            orient();
            adapt();
            window.scrollTo(0,0);
        } catch (err) {
            safeGuardErrorHandler();
            errHandler.consoleLog(err);
        }
    }
);

// adapt page size
function adapt() {
    if ( navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i) ){

        if (90 == Math.abs(window.orientation)) {
            $("#page_content").css({
                "height": window.innerWidth,
                "width": window.innerHeight
            }).show();
        } else {
            $("#page_content").css({
                "height": window.innerHeight,
                "width": window.innerWidth
            }).show();
        }
    } else {
        $("#page_content").css({
            "height": window.innerHeight
        }).show();
    }
}

//handle orientation changes
function orient() {

    if (isNaN(window.orientation)) {
        return;
    }

    var orient = (0 == window.orientation) ? 0 : 180 + window.orientation;
    var xtrans  = 0;
    var ytrans  = 0;
    var originx = 0;
    var originy = 0;

    if (-90 == window.orientation) {
        ytrans = 0;
        xtrans = window.innerWidth;
    }

    if (90 == window.orientation) {
        ytrans = $("#page_content").width();
        xtrans = 0;
    }

    $("#page_content").css({
        "-moz-transformOrigin": originx + "px " + originy + "px",
        "-webkit-transformOrigin": originx + "px " + originy + "px",
        "-moz-transform": "translate(" + xtrans + "px, " + ytrans + "px) rotate(" + orient + "deg)",
        "-webkit-transform": "translate(" + xtrans + "px, " + ytrans + "px) rotate(" + orient + "deg)"
    }).show();
}

$(window).on("orientationchange", function(){
    orient();
    adapt();
    window.scrollTo(0,0);
});
