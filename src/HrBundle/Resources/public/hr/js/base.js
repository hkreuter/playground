/**
 * Created by heike on 08/02/15.
 */

//show info inside specified div
function InfoHandler(infodivname) {

    this.getName = function () {
        return 'InfoHandler';
    };

    this.infodiv = document.getElementById(infodivname);
    if (!this.infodiv instanceof HTMLDivElement) {
        throw new Error("Cannot access infodiv!");
    }

    //show status information
    this.showInfo = function (message) {
        this.infodiv.innerHTML = message;
    };

    this.getInfoDivId = function () {
        return this.infodiv.id;
    };
}

// add leading zero
function checkLeading(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

//time tracker, display time running in div id div id is suplied
function TimeTracker(displayId) {

    this.displaylive = false;
    this.displaydiv = null;
    this.startTime = null;

    if (0 < displayId.length) {
        this.displaylive = true;
        this.displaydiv = document.getElementById(displayId);

        if (undefined == this.displaydiv) {
            throw new Error('display div not found!');
        }
    }

    //set start time
    this.startTimer = function () {
        var now = new Date();
        this.startTime = now.getTime();
    };

    //get start time
    this.getStartTime = function () {
        return this.startTime;
    };

    //get time spent since start
    this.getSecondsSpent = function () {

        if (null == this.startTime) {
            return 0;
        }

        var now = new Date();
        return Math.floor((now.getTime() - this.getStartTime()) / 1000);
    };

    //get time spent since start in nice'n shiny display format
    this.getDisplay = function () {
        var secs = this.getSecondsSpent();
        var hours = checkLeading(Math.floor(secs / 3600));
        var minutes = checkLeading(Math.floor((secs - 3600 * hours) / 60));
        var seconds = checkLeading(Math.floor(secs - 3600 * hours - minutes * 60));

        return display = hours + ':' + minutes + ':' + seconds;
    };

    // stop timer
    this.stopTimer = function (blReset) {
        if (blReset) {
            this.display = '00:00:00';
        }
        this.startTime = null;
    };

    //display information
    this.showDisplay = function () {

        if (!this.displaylive) {
            throw new Error('Cannot auto display due to missing div.');
        }

        this.displaydiv.innerHTML = this.getDisplay();
    };
}

//error handling
function ErrorHandler() {

    this.getName = function () {
        return 'ErrorHandler';
    };

    // log error message to console
    this.consoleLog = function (err) {
        console.log(err.message);
    };

    //display message on screen
    this.toDiv = function (divname) {
        document.getElementById(divname).innerHTML = err.message;
    };
}

//game base functionality
function GameBase(config) {

    this.canvasses = null;

    //append canvas element
    this.getCanvas = function (canvasId, zIndex) {

        var container = document.getElementById(config.getContainerId());
        //container.style.position = "relative";
        //container.style.height = "403";
        //container.style.width = "403";

        if (typeof canvasId === "undefined") {
            canvasId = config.getCanvasId();
        }
        if (typeof zIndex === "undefined") {
            zIndex = 0;
        }
        if (null == this.canvasses) {
            this.canvasses = new Object();
            container.innerHTML = '';
        }

        if (typeof this.canvasses[canvasId] === "undefined") {
            if (null == document.getElementById(config.getContainerId())) {
                throw new Error("Need element with id '" + config.getContainerId() + "' for canvas!");
            }
            if (null != document.getElementById(canvasId)) {
                throw new Error('canvas ' + canvasId + ' already exists');
            }

            var canvas = document.createElement('canvas');
            canvas.style.top = 0;
            canvas.style.left = 0;
            canvas.style.position = 'absolute';
            canvas.style.zIndex = zIndex;
            canvas.width = config.getWidth();
            canvas.height = config.getHeight();
            canvas.id = canvasId;
            container.appendChild(canvas);

            this.canvasses[canvasId] = canvas;
        }
        if (!this.canvasses[canvasId].getContext) {
            throw new Error('Missing canvas context for ' + canvasId + '!');
        }
        return this.canvasses[canvasId];
    };
}
