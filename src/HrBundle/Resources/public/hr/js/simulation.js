/*
 * Conway's Game of Life implementation by HR
 * Last change 2015-01-31 by HR
 *
 * For now: all rights reserved.
 */

var game = null;
var errHandler = null;
var timeoutClean = null;

// configuration
// parameter: - containerid id of container div for canvas
//
function GolConfig(containerid) {

    this.mode = 'normal';
    this.deadColor = '#C6C6C6';
    this.aliveColor = '#446ED9';
    this.neutralColor = '#132042'; //'#000000';
    this.gridBorder = 0;
    this.gridSize = 13;
    this.maxWidth = 500;
    this.minWidth = 320;

    //width available for game area
    this.width = null;

    //height available for game area
    this.height = null;

    this.canvasid = 'canvas';
    this.containerid = 'container';
    this.msgduration = 2000;

    if (0 < containerid.length) {
        this.containerid = containerid;
    }

    // we have 10px padding to the left and 2px to the top
    this.leftOffset = 0; //10;
    this.topOffset = 0; //2;

    //fontsize for infoCanvas
    this.fontSize = 30;

    // getters
    this.getName = function () {
        return 'GolConfig';
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
    this.getDeadColor = function () {
        return this.deadColor;
    };
    this.getAliveColor = function () {
        return this.aliveColor;
    };
    this.getNeutralColor = function () {
        return this.neutralColor;
    };
    this.getLeftOffset = function () {
        return this.leftOffset;
    };
    this.getTopOffset = function () {
        return this.topOffset;
    };
    this.getFontSize = function () {
        return this.fontSize;
    };
    this.getMaxWidth = function() {
        return this.maxWidth;
    };
    this.getMinWidth = function() {
        return this.minWidth;
    };
    this.getGridSize = function() {
        return this.gridSize;
    };
    this.getGridBorder = function() {
        return this.gridBorder;
    };

    //calculate number of columns canvas will have
    this.getColumnCnt = function () {
        var canvasWidth = this.getWidth() - 2 * this.getLeftOffset();
        return Math.floor((canvasWidth - this.getGridBorder()) / this.getGridSize());
    };

    //calculate number of rows canvas will have
    this.getRowCnt = function () {
        var canvasHeight = this.getHeight() - 2 * this.getTopOffset();
        return Math.floor((canvasHeight - this.getGridBorder()) / this.getGridSize());
    };

    // set the border mode, default is normal (dead cells outside)
    this.switchMode = function () {

        if ('torus' == this.mode) {
            this.mode = 'normal';
            game.printInfo('Border mode: normal');
        } else {
            this.mode = 'torus';
            game.printInfo('Border mode: torus');
        }
    };

    this.getMode = function () {
        return this.mode;
    };
    this.getMsgDuration = function () {
        return this.msgduration;
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

// game handler
function GameOfLife(config) {

    this.canvas = null;
    this.effectsCanvas = null;
    this.infoCanvas = null;
    this.core = null;
    this.base = new GameBase(config);
    this.status = null;
    this.timer = 0;

    this.getName = function () {
        return 'GameOfLife';
    };

    if ('GolConfig' != config.getName()) {
        throw new Error('Parameter config is not of type GolConfig!');
    }

    this.getStatus = function () {
        return this.status;
    };

    this.setTimer = function () {
        this.timer = 0;
    };
    this.getTimer = function () {
        return this.timer;
    };

    // fill the canvas
    this.createPad = function () {
        this.canvas = this.base.getCanvas(config.getCanvasId(), 0);
        this.effectsCanvas = this.base.getCanvas('effects', 1);
        this.infoCanvas = this.base.getCanvas('infocan', 2);

        if (null != this.core) {
            throw new Error('Game core already instantiated!');
        }

        this.core = new ConwaysSimulation(config);
        this.core.draw(this.canvas);
        this.status = 'ready';
        this.printInfo('ready');
    };

    //check mandatories
    this.checkPrerequisites = function () {
        if (null == this.canvas) {
            throw new Error('No canvas yet!');
        }
        if (null == this.infoCanvas) {
            throw new Error('No infoCanvas yet!');
        }
        if (null == this.core) {
            throw new Error('Core object missing!');
        }
    };

    // start simulation
    this.simulationStart = function () {
        this.checkPrerequisites();

        if (this.timer != 0) {
            throw new Error('Simulation already running!');
        }

        if (('ready' == this.getStatus())
            || ('stopped' == this.getStatus() )
        ) {
            this.printInfo('started');
        }

        game = this;
        this.timer = setInterval(function () {
            game.runSimulation();
        }, 500);
    };

    // function runs simulation as long as there are changes in cell state
    this.runSimulation = function () {
        this.checkPrerequisites();
        var blNextStep = this.core.nextStep();

        // as long as we have a change in state between current and next step the simulation runs
        if (blNextStep) {
            this.core.draw(this.canvas);
            this.status = 'running';
            game = this;
        } else {
            this.stopTimer();
            this.status = 'ended';
            this.printInfo('ended');
        }
    };

    // stop simulation
    this.simulationStop = function () {
        this.stopTimer();
        this.status = 'stopped';
        this.printInfo('stopped');
    };

    // do a reset, only if simulation is not running
    this.simulationReset = function () {
        this.checkPrerequisites();

        if (0 == this.timer) {
            this.core.reset();
            this.core.draw(this.canvas);
            this.status = 'reset';
            this.printInfo('reset');
        }
    };

    // kill all cells
    this.simulationClean = function (blDraw) {
        this.checkPrerequisites();
        this.core.clean();

        if (blDraw) {
            this.core.draw(this.canvas);
        }
        this.stopTimer();
        this.status = 'cleaned';
        this.printInfo('cleaned');
    };

    //Stop the timer
    this.stopTimer = function () {
        if (null == this.core) {
            throw new Error('Simulation object missing!');
        }
        if (0 != this.timer) {
            window.clearInterval(this.timer);
            this.timer = 0;
        }
    };

    // set a cell, used for manual setup
    this.setCell = function (eventsource) {
        this.checkPrerequisites();

        //check type of that event
        var eventType = eventsource.type;
        var status = this.getStatus();

        if (('ready' == status)
            || ('cleaned' == status)
            || ('stopped' == status)
        ) {
            var rawX = eventsource.clientX;
            var rawY = eventsource.clientY;

            if ('touchstart' == eventType) {
                //use this for ipod touchscreen
                rawX = eventsource.touches[0].clientX;
                rawY = eventsource.touches[0].clientY;
            }

            var boundingRect = document.getElementById(config.getCanvasId()).getBoundingClientRect();
            var offsetHeight = Math.ceil(boundingRect.top - config.getTopOffset());
            var offsetLeft = Math.ceil(boundingRect.left);
            var corX = rawX - offsetLeft;
            var corY = rawY - offsetHeight;
            var tmp  = corX;

            //correct for page orientation
            if (90 == window.orientation) {
                tmp  = corX;
                corX = (config.getWidth() - corY);
                corY = tmp;
            } else if (-90 == window.orientation) {
                tmp  = corY;
                corY = (config.getHeight() - corX);
                corX = tmp;
            }

            this.core.setCell(corX, corY);
            this.core.draw(this.canvas);
        }
    };

    this.showStatistics = function () {
        this.checkPrerequisites();
        var oStats = this.core.getStatistics();

        var message = oStats.livecount + ' of ' + oStats.cellcount + " cells alive, " +
            oStats.iterationcount + ' iterations';

        this.printInfo(message);
    };

    //print am message on the info canvas, remove after 2 seconds
    this.printInfo = function (msg) {

        var parameters = new Array();
        parameters[0] = this.base.getCanvas('infocan');
        parameters[1] = this.base.getCanvas('effects');

        //we got already one message displayed, clean immediately and show the next message
        if (null != timeoutClean) {
            clearTimeout(timeoutClean);
            cleanUp(parameters);
        }

        this.whiteWash(this.base.getCanvas('effects'));

        var canvas = this.base.getCanvas('infocan');
        var infopad = canvas.getContext('2d');
        var maxWidth = canvas.width - 20;
        var xAnchor = canvas.width / 2;
        var yAnchor = canvas.height / 2 + config.getFontSize() / 4;

        infopad.fillStyle = "#FFFFFF";
        infopad.font = "bold " + config.getFontSize() + "px Arial";
        infopad.textAlign = "center";
        infopad.fillText(msg, xAnchor, yAnchor, maxWidth);

        game = this;
        timeoutClean = setTimeout(cleanUp, config.getMsgDuration(), parameters);
    };

    // paint whitewash on a canvas
    // e.g. on a canvad layered on top of the main canvas to achieve a faded effect
    this.whiteWash = function (canvas) {
        var effectspad = canvas.getContext('2d');
        effectspad.fillStyle = "rgba(255, 255, 255, 0.60)";
        effectspad.fillRect(0, 0, canvas.width, canvas.height);
    };

    //clear a canvas
    this.clearEffects = function (canvas) {
        var pad = canvas.getContext('2d');
        pad.clearRect(0, 0, canvas.width, canvas.height);
    };

}

function cleanUp(parameters) {

    for (var i = 0; i < parameters.length; i++) {
        game.clearEffects(parameters[i]);
    }
    clearTimeout(timeoutClean);
}

// main CONWAYS simulation function
function ConwaysSimulation(config) {
    if ('GolConfig' != config.getName()) {
        throw new Error('Parameter config is not of type GolConfig!');
    }

    this.rows = config.getRowCnt();
    this.columns = config.getColumnCnt();
    this.iterationcount = null;

    // row = y, column = x
    // one dimensional array containing cell states (true means alive)
    // cell at (y, x) is to be found as  y * columns + x
    this.cells = new Array(this.rows * this.columns); // y, x :1,1 -> 1,2 \n 2,1 -> 2,2

    // we need some initial state, for now randomize
    // user can set initial state using clean and setCell
    this.reset = function () {
        for (var cnt = 1; cnt < this.rows * this.columns; cnt++) {
            this.cells[cnt] = (Math.random() * 2 > 1.0);
        }
        this.iterationcount = 0;
    };

    // kill all cells
    this.clean = function () {
        for (var cnt = 0; cnt < this.rows * this.columns; cnt++) {
            this.cells[cnt] = false;
        }
        this.iterationcount = 0;
    };

    // set a living cell
    this.setCell = function (xcoord, ycoord) {
        var width = Math.floor(canvas.width / this.columns);
        var height = Math.floor(canvas.height / this.rows);

        // determine which cell is addressed
        var xcnt = Math.floor((xcoord - 1) / width);
        var ycnt = Math.floor((ycoord - 1) / height);

        if ((ycnt >= 0) && (ycnt < this.rows)
            && (xcnt >= 0) && (xcnt < this.columns)) {
            console.log(this.cells[ycnt * this.columns + xcnt]);
            if (this.cells[ycnt * this.columns + xcnt]) {
                this.cells[ycnt * this.columns + xcnt] = false;
            } else {
                this.cells[ycnt * this.columns + xcnt] = true;
            }
        }
    };

    // cell
    this.cell = function (x, y) {
        if ('torus' == config.getMode()) {
            return this.torusCell(x, y);
        } else {
            return this.normalCell(x, y);
        }
    };

    // cell must be inside the grid and tagged as alive in cells array
    this.normalCell = function (x, y) {
        var blAlive = false;
        if ((y >= 0) && (y < this.rows)
            && (x >= 0) && (x < this.columns)
            && this.cells[y * this.columns + x]) {
            blAlive = true;
        }
        return blAlive;
    };

    // cell must be inside the grid and tagged as alive in cells array
    this.torusCell = function (x, y) {
        var blAlive = false;
        var newx = x;
        var newy = y;
        if (0 > x) {
            newx = this.columns - 1;
        }
        if (0 > y) {
            newy = this.rows - 1;
        }
        if ((this.columns - 1 ) < x) {
            newx = 0;
        }
        if ((this.rows - 1 ) < y) {
            newy = 0;
        }
        if ((newy >= 0) && (newy < this.rows)
            && (newx >= 0) && (newx < this.columns)
            && this.cells[newy * this.columns + newx]) {
            blAlive = true;
        }
        return blAlive;
    };

    //for each run check the cell status
    // a cell has 8 neighbours (how about border cells?)
    /// Here are Conways four rules:
    //     - a dead cell with exactly three living neighbours will be reborn
    //     - a living cell with less than two living neighbours dies
    //     - a living cell with two or three livin neighbours will stay alive
    //     - a living cell with more than three living neighbours dies
    this.nextStep = function () {
        var nextState = new Array(this.columns * this.rows);
        // if at least one cell changed this will be true and indicate that the simulation is still alive
        var blSomethingChanged = false;
        for (var cellx = 0; cellx < this.columns; cellx++) {
            for (var celly = 0; celly < this.rows; celly++) {

                var livingNeighbourCount = 0;
                var blCurrentCellAlive = this.cell(cellx, celly);
                nextState[celly * this.columns + cellx] = false;

                // the current cell resides at cellx, celly
                // we need to consider the following neighbouring cells: (coordinate combinations)
                // (celly - 1), (celly), (celly + 1)
                // (cellx - 1), (cellx), (cellx + 1)
                // *** How to handle end cells? -> we should simulate a torus, currently we just do a hard cutoff
                // *** neighbouring cells of (1,1) are (1,2), (2,2), (2,1) and (columns, 1)

                // simple implementation: just count how many neighbours are alive
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        if (this.cell(cellx + i, celly + j)
                            && !( 0 == i && 0 == j )
                        ) {
                            livingNeighbourCount++;
                        }
                    }
                }
                // a dead cell with exactly three living neighbours will be reborn
                if ((3 == livingNeighbourCount) && !blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = true;
                }
                // a living cell with less than two living neighbours dies
                if ((3 > livingNeighbourCount) && blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = false;
                }
                // a living cell with two or three livin neighbours will stay alive
                if (( (2 == livingNeighbourCount) || (3 == livingNeighbourCount) )
                    && blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = true;
                }
                // a living cell with more than three living neighbours dies
                if ((3 < livingNeighbourCount) && blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = false;
                }
                // check if something changed for this cell
                if (blCurrentCellAlive != nextState[celly * this.columns + cellx]) {
                    blSomethingChanged = true;
                }
            }
        }
        this.cells = nextState;
        this.iterationcount++;
        return blSomethingChanged;
    };

    // draw onto a 2d canvas
    this.draw = function (canvas) {
        var gamepad = canvas.getContext('2d');
        var width = Math.floor(canvas.width / this.columns);
        var height = Math.floor(canvas.height / this.rows);

        // first clear all, plus 1 is for the grid lines
        gamepad.fillStyle = config.getDeadColor();
        gamepad.fillRect(0, 0, this.columns * width, this.rows * height);

        //now draw the cells
        gamepad.fillStyle = config.getAliveColor();
        // we need a double loop, outer loop iterates over x values
        // inner loop runs over y values
        for (var xcounter = 0; xcounter < this.columns; xcounter++) {
            var xcoord = xcounter * width;
            for (var ycounter = 0; ycounter < this.rows; ycounter++) {
                var ycoord = ycounter * height;

                gamepad.fillStyle = config.getNeutralColor();
                gamepad.fillRect(xcoord, ycoord, width, height);

                // draw living and dead cells
                if (this.cells[ycounter * this.columns + xcounter]) {
                    gamepad.fillStyle = config.getAliveColor();
                    gamepad.fillRect(xcoord, ycoord, width - 1, height - 1);
                }
            }
        }
    };

    // return some statistics data
    this.getStatistics = function () {
        var statObject = new Object();
        statObject.cellcount = this.rows * this.columns;
        statObject.livecount = 0;
        statObject.deadcount = 0;
        statObject.iterationcount = this.iterationcount;

        for (var i = 0; i < statObject.cellcount; i++) {
            if (this.cells[i]) {
                statObject.livecount++;
            } else {
                statObject.deadcount++;
            }
        }
        return statObject;
    };

    //following code is executed when object of type ConwaysSimulation is instantiated
    this.reset();
    return this;
}

//error handler safeguard
function safeGuardErrorHandler() {
    if (null == errHandler) {
        errHandler = new ErrorHandler();
    }
}

$(window).ready(
    function () {

        if ("Tests for Conway's Game of Life" != document.title) {
            try {
                config = new GolConfig('container');
                var areawidth = Math.min(window.innerWidth, config.getMaxWidth());
                areawidth     = Math.max(areawidth, config.getMinWidth());
                areawidth = Math.floor( areawidth/config.getGridSize() ) * config.getGridSize();

                config.setWidth(areawidth);
                config.setHeight(areawidth);

                $("#container").css({
                    "width": config.getWidth(),
                    "height": config.getHeight()
                }).show();

                orient();
                adapt();
                window.scrollTo(0,0);

                game = new GameOfLife(config);
                game.createPad();
            } catch (err) {
                safeGuardErrorHandler();
                errHandler.consoleLog(err);
            }
        }
    }
);

$(window).on("orientationchange", function(){
    orient();
    adapt();
    window.scrollTo(0,0);
});

$("#container").on("click ontouchstart", function (event) {
    try {
        game.setCell(event);
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#start").on("click ontouchstart", function (event) {
    try {
        game.simulationStart();
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#stop").on("click ontouchstart", function (event) {
    try {
        game.simulationStop();
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#reset").on("click ontouchstart", function (event) {
    try {
        game.simulationReset();
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#clean").on("click ontouchstart", function (event) {
    try {
        game.simulationClean(true);
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#mode").on("click ontouchstart", function (event) {
    try {
        if (('ready' == game.getStatus())
            || ('reset' == game.getStatus())
            || ('cleaned' == game.getStatus())
        ) {
            config.switchMode();
        }
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#info").on("click ontouchstart", function (event) {
    try {
        game.showStatistics();
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});

$("#home").on("click ontouchstart", function (event) {
    try {
        window.location.href = "home";
    } catch (err) {
        safeGuardErrorHandler();
        errHandler.consoleLog(err);
    }
});
