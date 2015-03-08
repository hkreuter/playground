/**
 * Solitaire implementation by HR
 *
 * Created by HR on 08/02/15.
 *
 * For now: all rights reserved.
 */

var game = null;
var errHandler = null;
var interval = null;
var timer = null;
var messenger = null;

// configuration
// parameter:  - containerid id of container div for canvas
//
function SolConfig(containerid) {
    this.canvasid = 'canvas';
    this.containerid = 'container';
    this.maxWidth = 500;
    this.minWidth = 320;

    //width available for game area
    this.width = null;

    //height available for game area
    this.height = null;

    // we have 10px padding to the left and 2px to the top
    this.leftOffset = 12;
    this.topOffset = 2;
    this.gridSize = 42;
    this.gridBorder = 2;
    this.ballRadius = 18;
    this.squareCnt = 7;

    this.columnCount = 7;
    this.rowCount = this.columnCount;
    this.deadColor = '#C6C6C6';
    this.aliveColor = '#446ED9';

    //fontsize for infoCanvas
    this.fontSize = 50;

    this.blForbidDiagonalMoves = true;

    if (0 < containerid.length) {
        this.containerid = containerid;
    }

    // contains basic gamepad info
    this.gameArea = [0, 0, 1, 1, 1, 0, 0,
        0, 0, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        0, 0, 1, 1, 1, 0, 0,
        0, 0, 1, 1, 1, 0, 0];

    this.ballsDefault = [0, 0, 1, 1, 1, 0, 0,
        0, 0, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 0, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
        0, 0, 1, 1, 1, 0, 0,
        0, 0, 1, 1, 1, 0, 0];

    this.selectedBallDefault = [0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0];

    //getters
    this.getName = function () {
        return 'SolConfig';
    };
    this.getCanvasId = function () {
        return this.canvasid;
    };
    this.getContainerId = function () {
        return this.containerid;
    };
    this.getWidth = function () {
        if (!$.isNumeric(this.width)) {
            throw new Error('Need to set width, it is not a number!');
        }
        return this.width;
    };
    this.getHeight = function () {
        if (!$.isNumeric(this.height)) {
            throw new Error('Need to set height, it is not a number');
        }
        return this.height;
    };
    this.getGameArea = function () {
        var ret = new Array();
        for (var i = 0; i < this.getRowCount() * this.getColumnCount(); i++) {
            ret[i] = this.gameArea[i];
        }
        return ret;
    };
    this.getBallsDefault = function () {
        var ret = new Array();
        for (var i = 0; i < this.getRowCount() * this.getColumnCount(); i++) {
            ret[i] = this.ballsDefault[i];
        }
        return ret;
    };
    this.getSelectedBallDefault = function () {
        var ret = new Array();
        for (var i = 0; i < this.getRowCount() * this.getColumnCount(); i++) {
            ret[i] = this.selectedBallDefault[i];
        }
        return ret;
    };
    this.getLeftOffset = function () {
        return this.leftOffset;
    };
    this.getTopOffset = function () {
        return this.topOffset;
    };

    this.getGridSize = function () {
        return this.gridSize;
    };
    this.getGridBorder = function () {
        return this.gridBorder;
    };

    this.getBallRadius = function () {
        return this.ballRadius;
    };
    this.getSquareCount = function () {
        return this.squareCnt;
    };


    this.getColumnCount = function () {
        return this.columnCount;
    };
    this.getRowCount = function () {
        return this.rowCount;
    };
    this.getDeadColor = function () {
        return this.deadColor;
    };
    this.getAliveColor = function () {
        return this.aliveColor;
    };
    this.ForbidDiagonalMoves = function () {
        return this.blForbidDiagonalMoves;
    };
    this.getFontSize = function () {
        return this.fontSize;
    };
    this.getMaxWidth = function () {
        return this.maxWidth;
    };
    this.getMinWidth = function () {
        return this.minWidth;
    };

    //setters
    this.setWidth = function (width) {
        if (!$.isNumeric(width)) {
            throw new Error('Width is not a number!');
        }
        this.width = Math.floor(width);
    };
    this.setHeight = function (height) {
        if (!$.isNumeric(height)) {
            throw new Error('Height is not a number!');
        }
        this.height = Math.floor(height);
    };
}

// game controller
function Solitaire(config) {

    this.canvas = null;
    this.core = null;
    this.config = config;
    this.base = new GameBase(config);
    this.status = '';

    if ('SolConfig' != config.getName()) {
        throw new Error('Parameter config is not of type SolConfig!');
    }

    //getters
    this.getName = function () {
        return 'Solitaire';
    };
    this.getStatus = function () {
        return this.status;
    };

    this.setStatus = function (status) {
        this.status = status;
    };

    //check mandatories
    this.checkPrerequisites = function () {
        if (null == this.canvas) {
            throw new Error('No canvas yet!');
        }
        if (null == this.canvas.getContext) {
            throw new Error('Canvas context is missing!');
        }
        if (null == this.core) {
            throw new Error('Game core object missing!');
        }
    };

    // fill the canvas
    this.createPad = function () {
        this.canvas = this.base.getCanvas();

        if (null != this.core) {
            throw new Error('Game core already instantiated!');
        }

        this.core = new SolitaireCore(config, canvas);

        this.core.draw(this.canvas);
        this.setStatus('ready');
    };

    // select a ball
    this.selectBall = function (eventsource) {

        var eventType = eventsource.type;
        this.checkPrerequisites();

        if (('ready' == this.getStatus() )
            || ('running' == this.getStatus() )
        ) {

            var mousex = eventsource.clientX;
            var mousey = eventsource.clientY;

            if ('touchstart' == eventType) {
                //use this for a touchscreen
                mousex = eventsource.touches[0].clientX;
                mousey = eventsource.touches[0].clientY;
            }
            var boundingRect = document.getElementById(config.getCanvasId()).getBoundingClientRect();
            var offsetHeight = Math.ceil(boundingRect.top - config.getTopOffset());
            var offsetWidth = Math.ceil(boundingRect.left - config.getLeftOffset());

            this.core.selectBall(mousex - offsetWidth, mousey - offsetHeight);
        }
    };

    this.checkGame = function () {

        this.checkPrerequisites();

        if ('ready' == this.getStatus()) {
            startTimer();
            this.setStatus('running');
        }

        var possibleMoves = this.core.getPossibleMoves();
        var ballsLeft = this.core.countLeftoverBalls();
        var countOfMoves = this.core.getCountOfMoves();

        var messages = new Array();
        messages[0] = "Game over!";

        if (('running' == this.getStatus() )
            && ( 0 == possibleMoves )
        ) {
            stopTimer(false);
            if (1 < ballsLeft) {

                this.setStatus('lost');
                messages[1] = "You Lost! ";
                messages[2] = " No more moves possible.";
                messages[3] = ballsLeft + " balls are left.";
            } else {
                this.setStatus('won');
                messages[1] = "You won!";
                messages[2] = "Moves played: " + countOfMoves;
            }

            game = this;
            messenger = setTimeout(doInfo, 100, messages, 0);
        }
    };

    // reset game
    this.reset = function () {

        this.checkPrerequisites();
        if ('ready' != this.getStatus()) {
            this.core.reset();
            this.setStatus('ready');
            stopTimer(true);
            stopInfo();
        }
    };

    //print am message on the info canvas
    this.printInfo = function (msg) {

        var canvas = this.base.getCanvas('info');
        var infopad = canvas.getContext('2d');
        var maxWidth = canvas.width - 20;
        var xAnchor = canvas.width / 2;
        var yAnchor = canvas.height / 2 + config.getFontSize() / 4;

        infopad.fillStyle = "#FFFFFF";
        infopad.font = "bold " + config.getFontSize() + "px Arial";
        infopad.textAlign = "center";
        infopad.fillText(msg, xAnchor, yAnchor, maxWidth);

    };

    //clear a canvas
    this.clearEffects = function (name) {
        var canvas = this.base.getCanvas(name);
        var pad = canvas.getContext('2d');
        pad.clearRect(0, 0, canvas.width, canvas.height);
    };
}

//rotate messages on info canvas
function doInfo(messages, counter) {

    if (messages.length <= counter) {
        counter = 0;
    }
    game.clearEffects('info');
    game.printInfo(messages[counter]);
    counter++;
    messenger = setTimeout(doInfo, 1500, messages, counter);
}

//stop info loop
function stopInfo() {
    if (typeof messenger != 'undefined') {
        window.clearTimeout(messenger);
    }
    game.clearEffects('info');
}

// game core
SolitaireCore = function (config, canvas) {

    this.countOfMoves = 0;
    this.balls = config.getBallsDefault();
    this.selectedBall = config.getSelectedBallDefault();
    this.gameArea = config.getGameArea();
    this.gamepad = canvas.getContext('2d');
    this.width = Math.floor(canvas.width / config.getColumnCount());
    this.height = Math.floor(canvas.height / config.getRowCount());

    //getters
    this.getCountOfMoves = function () {
        return this.countOfMoves;
    };

    // draw onto a 2d canvas
    // this.draw = function (canvas) {
    this.draw = function () {

        // first clear all, plus 1 is for the grid lines
        this.gamepad.fillStyle = config.getAliveColor();
        this.gamepad.fillRect(0, 0,
            config.getColumnCount() * this.width + 1,
            config.getRowCount() * this.height + 1);

        // we need a double loop, outer loop iterates over x values
        // inner loop runs over y values
        for (var xcounter = 0; xcounter < config.getColumnCount(); xcounter++) {
            for (var ycounter = 0; ycounter < config.getRowCount(); ycounter++) {

                var ballPos = ycounter * config.getColumnCount() + xcounter;

                // draw gamepad
                if (this.gameArea[ballPos]
                    && !this.balls[ballPos]
                    && !this.selectedBall[ballPos]
                ) {
                    this.drawBall('delete', xcounter, ycounter);
                }
                // draw balls
                if (this.gameArea[ballPos]
                    && this.balls[ballPos]
                    && !this.selectedBall[ballPos]
                ) {
                    this.drawBall('draw', xcounter, ycounter);
                }
                //selected ball
                if (this.gameArea[ballPos]
                    && this.balls[ballPos]
                    && this.selectedBall[ballPos]) {
                    this.drawSelected('select', xcounter, ycounter);
                }
            }
        }
    };

    this.drawBall = function (mode, xcounter, ycounter) {
        var xcoord = xcounter * this.width + 1;
        var ycoord = ycounter * this.height + 1;
        var xballcoord = xcoord + this.width / 2;
        var yballcoord = ycoord + this.height / 2;

        var ballGrad = this.gamepad.createRadialGradient(xballcoord + 1, yballcoord + 1,
            config.getBallRadius() - 8, xballcoord, yballcoord, config.getBallRadius());

        switch (mode) {

            case 'draw':
                ballGrad.addColorStop(0, '#F4F201');
                ballGrad.addColorStop(0.6, '#E4C700');
                ballGrad.addColorStop(0.8, '#E4A700');
                ballGrad.addColorStop(1, '#446ED9');
                break;

            case 'selected':
                ballGrad.addColorStop(0, '#FDB000');
                ballGrad.addColorStop(0.8, '#FD5300');
                ballGrad.addColorStop(1, '#446ED9');
                break;

            case 'delete':
                ballGrad.addColorStop(0, '#446ED9');
                ballGrad.addColorStop(0.8, '#00B5E2');
                ballGrad.addColorStop(1, '#446ED9');
                break;

            default:
                throw new Error('Ball drawing mode missing!');
        }

        this.gamepad.fillStyle = ballGrad;
        this.gamepad.fillRect(xcoord, ycoord, this.width - 1, this.height - 1);
    };

    // count remaining balls
    this.countLeftoverBalls = function () {
        var leftoverBalls = 0;
        for (var cnt = 0; cnt < config.getRowCount() * config.getColumnCount(); cnt++) {
            leftoverBalls += Number(this.balls[cnt]);
        }
        return leftoverBalls;
    };

    // reset to initial state
    this.reset = function () {
        this.balls = config.getBallsDefault();
        this.selectedBall = config.getSelectedBallDefault();
        this.gameArea = config.getGameArea();
        this.countOfMoves = 0;
        this.status = 'ready';
        this.draw();
    };

    //crude way to determine the number of possible moves:
    //iterate over all positions in a double loop
    this.getPossibleMoves = function () {

        var possibleMoves = 0;

        for (var selcnt = 0; selcnt < config.getRowCount() * config.getColumnCount(); selcnt++) {
            //if it lies inside the game area, check for possible moves
            // AND there must be a ball at the start position
            if (this.gameArea[selcnt] && this.balls[selcnt]) {
                for (var mvcnt = 0; mvcnt < config.getRowCount() * config.getColumnCount(); mvcnt++) {
                    if (this.gameArea[mvcnt]) {
                        var blMovePossible = false;
                        var yTo = Math.floor(mvcnt / config.getColumnCount());
                        var xTo = Math.floor(mvcnt - yTo * config.getRowCount());
                        blMovePossible = this.checkMove(selcnt, xTo, yTo, false);
                        possibleMoves += Number(blMovePossible);
                    }
                }
            }
        }
        return possibleMoves;
    };

    //check if a move is possible
    this.checkMove = function (selectedPos, xTo, yTo, blDoForReal) {
        var yFrom = Math.floor(selectedPos / config.getColumnCount());
        var xFrom = Math.floor(selectedPos - yFrom * config.getRowCount());

        // possible positions are xFrom+/- 2 or same, yFrom +/- 2 or same
        if ((xTo != (xFrom + 2) )
            && (xTo != (xFrom - 2) )
            && (xTo != xFrom)
        ) {
            return false;
        }
        if ((yTo != (yFrom + 2) )
            && (yTo != (yFrom - 2) )
            && (yTo != yFrom)
        ) {
            return false;
        }

        //diagonal moves are forbidden, so either x or y must stay the same
        if (config.ForbidDiagonalMoves()
            && (xTo != xFrom)
            && (yTo != yFrom)) {
            return false;
        }

        //we got here, now check if end position is inside the game area,
        //should not happen we are outside but better check again here
        if (!this.gameArea[yTo * config.getRowCount() + xTo]) {
            return false;
        }

        //can only jump to empty slot
        if (this.balls[yTo * config.getRowCount() + xTo]) {
            return false;
        }

        //possible move, but we have to check for one ball in between
        var xDiff = ( xTo - xFrom ) > 0 ? 1 : -1;
        var yDiff = ( yTo - yFrom) > 0 ? 1 : -1;
        xDiff = ( xTo == xFrom ) ? 0 : xDiff;
        yDiff = ( yTo == yFrom ) ? 0 : yDiff;
        var xDel = xFrom + xDiff;
        var yDel = yFrom + yDiff;

        // check if the is a ball that can be deleted
        if (!this.balls[yDel * config.getRowCount() + xDel]) {
            return false;
        }

        //make it a real move?
        if (blDoForReal) {
            //balls from position will be empty and balls to has to be filled
            this.balls[yFrom * config.getRowCount() + xFrom] = 0;
            this.balls[yTo * config.getRowCount() + xTo] = 1;
            this.balls[yDel * config.getRowCount() + xDel] = 0;

            // update the canvas
            this.drawBall('delete', xFrom, yFrom);
            this.drawBall('delete', xDel, yDel);
            this.drawBall('draw', xTo, yTo);
        }

        return true;
    };

    // select a ball
    this.selectBall = function (xcoord, ycoord) {
        // determine which ball is addressed
        var xcnt = Math.floor((xcoord - 1) / this.width);
        var ycnt = Math.floor((ycoord - 1) / this.height);

        //only one ball can be selected at a time
        var selectedPos = null;
        for (var cnt = 0; cnt < config.getRowCount() * config.getColumnCount(); cnt++) {
            if (this.selectedBall[cnt]) {
                selectedPos = cnt;
            }
        }

        //ball must be inside the game area, on an allowed field
        if ((ycnt >= 0) && (ycnt < config.getRowCount())
            && (xcnt >= 0) && (xcnt < config.getColumnCount())
            && this.gameArea[ycnt * config.getRowCount() + xcnt]
        ) {
            // if we have already a formerly selected ball and click selects this one, unselect it
            if (null != selectedPos) {
                if (this.selectedBall[ycnt * config.getRowCount() + xcnt]) {
                    this.selectedBall[ycnt * config.getRowCount() + xcnt] = 0;
                    // and draw that ball as normal (unselected) ball
                    this.drawBall('draw', xcnt, ycnt);
                } else {
                    // check move
                    var blMoveOk = false;
                    blMoveOk = this.checkMove(selectedPos, xcnt, ycnt, true);

                    //if move is ok unset selection
                    if (blMoveOk) {
                        this.selectedBall[selectedPos] = 0;
                        this.countOfMoves++;
                    }
                }
            } else {
                // no ball selected yet, check if there is a ball at that position
                if (this.balls[ycnt * config.getRowCount() + xcnt]) {
                    this.selectedBall[ycnt * config.getRowCount() + xcnt] = 1;
                    // and draw that ball as selected
                    this.drawBall('selected', xcnt, ycnt);
                }
            }
        }
    }

};

//start timer
function startTimer() {
    timer = new TimeTracker('timerdiv');
    timer.startTimer();
    interval = setInterval(function () {
        timer.showDisplay();
    }, 50);
}

// stop timer
function stopTimer(haltTimeTracker) {
    window.clearInterval(interval);
    if (haltTimeTracker) {
        timer.stopTimer(true);
        timer.showDisplay();
        timer = null;
    }
};

//page load
$(window).ready(
    function () {
        try {
            config = new SolConfig('container');
            var areawidth = Math.min(window.innerWidth, config.getMaxWidth());
            areawidth = Math.max(areawidth, config.getMinWidth());
            areawidth = Math.floor(areawidth / config.getSquareCount()) * config.getSquareCount();

            config.setWidth(areawidth);
            config.setHeight(areawidth);

            $("#container").css({
                "width": config.getWidth(),
                "height": config.getHeight()
            }).show();

            $("#page_content").css({
                "height": window.innerHeight
            }).show();

            game = new Solitaire(config);
            game.createPad();
        } catch (err) {
            safeGuardErrorHandler();
            errHandler.consoleLog(err);
        }
    }
);

//error handler safeguard
function safeGuardErrorHandler() {
    if (null == errHandler) {
        errHandler = new ErrorHandler();
    }
}

//attach events
$("#container").bind("click ontouchstart", function (event) {
    try {
        game.selectBall(event);
        game.checkGame();
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#reset").bind("click ontouchstart", function (event) {
    try {
        game.reset();
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#home").bind("click ontouchstart", function (event) {
    try {
        window.location.href = "home";
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});