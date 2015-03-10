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

/*

 navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i);



 */

//page load
$(window).ready(
    function () {
        try {

            alert(navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i));

            if ( navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i) ){
                $("#page_content").css({
                    "height": window.innerHeight,
                    "width": window.innerWidth
                }).show();
            } else {
                $("#page_content").css({
                    "height": window.innerHeight
                }).show();
            }

            orient();

        } catch (err) {
            safeGuardErrorHandler();
            errHandler.consoleLog(err);
        }
    }
);

function orient() {

    /*
    $("#body").css({
        "-webkit-transform": "rotate(" + new_orientation + "deg)"
    }).show();
    */
}

//function orient() {
/*
 turn left
 portrait 0
 landscape 90
 portrait 180
 landscape -90

 */
/*
 var orientation = window.orientation;
 alert(orientation);
 var new_orientation = (orientation) ? 0 : 180 + orientation;

 $("#body").css({
 "-webkit-transform": "rotate(" + new_orientation + "deg)"
 }).show();
 }*/

$(window).on("orientationchange", function(){
    //orient();
    alert(window.orientation);

    /*
     if ( 90 == window.orientation ) {
     $("#body").css({
     "-webkit-transform": "rotate(-90 deg)"
     }).show();
     } */
});
