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

$(window).on("orientationchange", function(){
    orient();
    adapt();
    window.scrollTo(0,0);
});
