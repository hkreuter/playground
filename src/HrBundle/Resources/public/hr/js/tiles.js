/**
 * Created by heike on 20/02/15.
 */

//TODO: nicely sliding tiles ;), means: use draggable elements
// remove info thingy, not needed, rename messager to info afterwards
//check if we need ismobiledevice flag

var game = null;
var config = null;
var shuffler = null;
var messager = null;
var info = null;
var interval = null;
var timer = null;

// configuration
// parameters: - width       width available for game area
//             - height      height available for game area
//             - containerid id of container div for canvas
//
function TilesConfig(width, height, containerid) {

    this.canvasid = 'canvas';
    this.containerid = 'container';
    this.width = width;
    this.height = height;

    if (0 < containerid.length) {
        this.containerid = containerid;
    }
    if (!$.isNumeric(width)) {
        throw new Error('width is not a number!');
    }
    if (!$.isNumeric(height)) {
        throw new Error('height is not a number');
    }

    // we have 10px padding to the left and 2px to the top
    this.leftOffset = 12;
    this.topOffset = 2;
    this.gridSize = 75;
    this.gridBorder = 2;
    this.columnCount = 6;
    this.rowCount = this.columnCount;

    this.shuffleMaxCount = 200;

    this.deadColor = '#C6C6C6';
    this.aliveColor = '#9AB0E5';
    this.neutralColor = 'FF0000'; //'#446ED9';

    //fontsize for infoCanvas
    this.fontSize = 50;

    // game colors
    this.outerColors = new Array();
    this.outerColors[0] = '#FF0000';
    this.outerColors[1] = '#FF9900';
    this.outerColors[2] = '#0000AA';
    this.outerColors[3] = '#660066';

    this.innerColors = new Array();
    this.innerColors[0] = '#FFFF00';
    this.innerColors[1] = '#00FFFF';
    this.innerColors[2] = '#FF00FF';
    this.innerColors[3] = '#33FF33';

    //getters
    this.getName = function () {
        return 'TilesConfig';
    };
    this.getCanvasId = function () {
        return this.canvasid;
    };
    this.getContainerId = function () {
        return this.containerid;
    };
    this.getWidth = function () {
        return this.width;
    };
    this.getHeight = function () {
        return this.height;
    };
    this.getLeftOffset = function () {
        return this.leftOffset;
    };
    this.getTopOffset = function () {
        return this.topOffset;
    };
    this.getGridBorder = function () {
        return this.gridBorder;
    };
    this.getColumnCount = function () {
        return this.columnCount;
    };
    this.getRowCount = function () {
        return this.rowCount;
    };
    this.getOuterColors = function () {
        return this.outerColors;
    };
    this.getInnerColors = function () {
        return this.innerColors;
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
    this.getShuffleMaxCount = function () {
        return this.shuffleMaxCount;
    };
    this.getFontSize = function () {
        return this.fontSize;
    };
}

//position object
function Pos(xcnt, ycnt) {

    this.xpos = xcnt;
    this.ypos = ycnt;

    this.getXpos = function () {
        return this.xpos;
    };

    this.getYpos = function () {
        return this.ypos;
    };

    this.setXpos = function (xpos) {
        this.xpos = xpos;
    };

    this.setYpos = function (ypos) {
        this.ypos = ypos;
    };
}

//center ball color gradient
function centerBall(config, gamepad) {

    if ('TilesConfig' != config.getName()) {
        throw new Error('Parameter config is not of type TilesConfig!');
    }

    var iRanda = Math.floor(Math.random() * config.getInnerColors().length);
    var iRandb = Math.floor(Math.random() * config.getOuterColors().length);

    this.xballcoord = Math.floor(config.getWidth() / 2);
    this.yballcoord = Math.floor(config.getHeight() / 2);
    this.inner = Math.floor(config.getWidth() / 16);
    this.offcenter = Math.floor(config.getWidth() / 8);

    this.radius = Math.min(Math.floor(config.getWidth() / 2), Math.floor(config.getHeight() / 2));
    this.colora = config.getInnerColors()[iRanda];
    this.colorb = config.getOuterColors()[iRandb];

    // assign the fillstyle
    var ballGrad = gamepad.createRadialGradient((this.xballcoord + this.inner),
        (this.yballcoord + this.inner),
        this.offcenter,
        this.xballcoord,
        this.yballcoord,
        this.radius);
    ballGrad.addColorStop(0.05, this.colora);
    ballGrad.addColorStop(0.3, this.colorb);
    ballGrad.addColorStop(0.8, this.colora);
    ballGrad.addColorStop(1, config.getAliveColor());

    return ballGrad;
}

//main game handling function
function Tiles(config, info) {
    this.canvas = null;
    this.effectsCanvas = null;
    this.infoCanvas = null;
    this.core = null;
    this.base = new GameBase(config);
    this.status = 'new'; // will be one of new, ready, running, over, shuffling
    this.shuffleCount = 0;
    this.isShuffling = false;
    this.oMove = null;
    this.startPos = null;
    this.endPos = null;
    this.selectedTile = null;

    if ('TilesConfig' != config.getName()) {
        throw new Error('Parameter config is not of type TilesConfig!');
    }
    if ('InfoHandler' != info.getName()) {
        throw new Error('Parameter infoHandler is not of type infoHandler!');
    }

    //getters
    this.getName = function () {
        return 'Tiles';
    };
    this.getStatus = function () {
        return this.status;
    };
    this.isShufflingNow = function () {
        return this.isShuffling;
    };
    this.getShuffleCount = function () {
        return this.shuffleCount;
    };

    //setters
    this.setStatus = function (status) {
        this.status = status;
    };

    this.increaseShuffleCount = function () {
        this.shuffleCount++;
    };

    this.startShuffle = function () {
        if (true == this.isShufflingNow()) {
            throw new Error('Shuffling was already started!');
        }
        this.setStatus('shuffling');
        this.isShuffling = true;
        this.shuffleCount = 0;
    };

    this.stopShuffle = function () {
        if (false == this.isShufflingNow()) {
            throw new Error('Shuffling was already stopped!');
        }
        this.setStatus('ready');
        this.isShuffling = false;
    };

    //check mandatories
    this.checkPrerequisites = function () {
        if (null == this.canvas) {
            throw new Error('No canvas yet!');
        }
        if (null == this.effectsCanvas) {
            throw new Error('No effectsCanvas yet!');
        }
        if (null == this.infoCanvas) {
            throw new Error('No infoCanvas yet!');
        }
        if (null == this.core) {
            throw new Error('Game core object missing!');
        }
    };

    // fill the canvas
    this.createPad = function () {
        this.canvas = this.base.getCanvas(config.getCanvasId(), 0);
        this.effectsCanvas = this.base.getCanvas('effects', 1);
        this.infoCanvas = this.base.getCanvas('infocan', 2);

        if (null != this.core) {
            throw new Error('Game core already instantiated!');
        }

        this.core = new TilesCore(config, new Array(this.canvas, this.effectsCanvas, this.infoCanvas));
        this.core.draw(this.canvas);
        this.setStatus('new');
    };

    //set to initial state
    this.shuffle = function () {

        this.checkPrerequisites();

        if (this.isShufflingNow()
            || ( 'new' != this.getStatus() )
        ) {
            return;
        }
        this.startShuffle();

        // put a faded layer on top
        this.core.whiteWash();

        //show info on infocanvas
        this.core.printInfo("Shuffling!");

        //repeat shuffling
        game = this;
        shuffler = setTimeout(function () {
            doShuffle();
        }, 10);
    };

    //check game status
    this.checkGame = function () {

        var ret = true;
        this.checkPrerequisites();

        if ('ready' == this.getStatus()) {
            startTimer();
            this.setStatus('running');
        }

        //game is over
        if (('running' == this.getStatus())
            && (true == this.core.checkTilesPositions())
        ) {
            ret = false;
        }

        return ret;
    };

    // select a field
    this.handleMove = function (eventsource) {

        this.checkPrerequisites();

        //get type of that event
        var eventType = eventsource.type;

        //nothing to be done
        if (('ready' != this.getStatus() )
            && ('running' != this.getStatus() )) {
            // prevent default behavior
            eventsource.preventDefault();
            return false;
        }

        var res = this.checkGame();
        if (false == res) {
            // nothing to be done
            return false;
        }

        //handle depending on eventtype
        var boundingRect = document.getElementById(config.getCanvasId()).getBoundingClientRect();
        var offsetHeight = Math.ceil(boundingRect.top - config.getTopOffset());

        var mousex = eventsource.clientX;
        var mousey = eventsource.clientY;

        switch (eventType) {

            case 'mousedown':
                this.startPos = new Pos();
                this.startPos.setXpos(mousex);
                this.startPos.setYpos(mousey);
                this.core.startMove(mousex, mousey - offsetHeight - config.getTopOffset());
                break;

            case 'mouseup':
                this.endPos = new Pos();
                this.endPos.setXpos(mousex);
                this.endPos.setYpos(mousey);

                if ((this.startPos.getXpos() != this.endPos.getXpos())
                    || (this.startPos.getYpos() != this.endPos.getYpos())
                ) {
                    this.core.endMove(mousex, mousey - offsetHeight - config.getTopOffset());
                } else {
                    this.core.cancelMove();
                }
                this.oMove = null;
                this.startPos = null;
                this.endPos = null;
                break;

            case 'touchstart':
                // prevent default behavior
                eventsource.preventDefault();

                //use this for the touchscreen, we are only interested in the first finger touching the screen
                mousex = eventsource.touches[0].pageX;
                mousey = eventsource.touches[0].pageY;
                this.core.startMove(mousex, mousey - offsetHeight - config.getTopOffset());
                break;

            case 'touchmove':
                // prevent scrolling
                eventsource.preventDefault();
                // keep track of position
                this.oMove = new Pos();
                this.oMove.setxPos(eventsource.targetTouches[0].pageX);
                this.oMove.setYPos(eventsource.targetTouches[0].pageY);
                break;

            case 'touchend':
                //if we have an end position end the move, if not cancel the move
                if (null != this.oMove) {
                    this.core.endMove(this.oMove.getXpos(), this.oMove.getYpos() - offsetHeight - config.getTopOffset());
                } else {
                    this.core.cancelMove();
                }
                this.oMove = null;
                break;

            default:
                break;
        }

        if (this.core.isGameOver()) {
            this.handleGameOver();
        }
    };

    // show info that game is done
    this.handleGameOver = function () {
        this.setStatus('over');
        this.core.whiteWash();
        stopTimer();

        var messages = new Array();
        messages[0] = 'Game Over! ';
        messages[1] = 'Moves: ' + this.core.getCountOfMoves();
        messages[2] = 'Time: ' + timer.getDisplay();

        game = this;
        messager = setTimeout(doInfo, 100, messages, 0);
    };
}

//rotate messages on info canvas
function doInfo(messages, counter) {

    if (messages.length <= counter) {
        counter = 0;
    }
    game.core.clearEffects('info');
    game.core.printInfo(messages[counter]);
    counter++;
    messager = setTimeout(doInfo, 1000, messages, counter);
}

//stop info loop
function stopInfo() {
    if (typeof messager != 'undefined') {
        window.clearTimeout(messager);
    }
    game.core.clearEffects('info');
}

//shuffle the tiles
function doShuffle() {
    if (game.getShuffleCount() < config.getShuffleMaxCount()) {
        game.increaseShuffleCount();
        game.core.shuffleOnce();
        shuffler = setTimeout(function () {
            doShuffle();
        }, 10);
    } else {
        clearTimeout(shuffler);
        game.stopShuffle();
        game.core.clearEffects('effects');
        game.core.clearEffects('info');
    }
}

// tiles business model
function TilesCore(config, canvasses) {

    this.countOfMoves = 0;
    this.gamepad = canvasses[0].getContext('2d');
    this.effectspad = canvasses[1].getContext('2d');
    this.infopad = canvasses[2].getContext('2d');
    this.gameArea = new Array();
    this.shuffledTiles = new Array();
    this.emptyTile = null;
    this.gameOver = false;

    this.width = Math.floor(config.getWidth() / config.getColumnCount());
    this.height = Math.floor(config.getHeight() / config.getRowCount());

    this.ballGrad = centerBall(config, this.gamepad);

    //getters
    this.getCountOfMoves = function () {
        return this.countOfMoves;
    };
    this.isGameOver = function () {
        return this.gameOver;
    };

    // draw onto a 2d canvas
    this.draw = function () {
        // first clear all, plus gridBorder is for the grid lines
        this.gamepad.fillStyle = config.getDeadColor();
        this.gamepad.fillRect(0, 0,
            config.getColumnCount() * config.getWidth() + config.getGridBorder(),
            config.getRowCount() * config.getHeight() + config.getGridBorder());

        // we need a double loop, outer loop iterates over x values
        // inner loop runs over y values
        for (var xcounter = 0; xcounter < config.getColumnCount(); xcounter++) {
            for (var ycounter = 0; ycounter < config.getRowCount(); ycounter++) {

                this.drawField('filled', xcounter, ycounter);
                this.gameArea[ycounter * config.getColumnCount() + xcounter] = true;
                this.shuffledTiles[ycounter * config.getColumnCount() + xcounter] = new Pos(xcounter, ycounter);
            }
        }

        // we need one empty space
        var emptyX = config.getColumnCount() - 1;
        var emptyY = config.getRowCount() - 1;
        this.emptyTile = new Pos(emptyX, emptyY);
        this.drawField('empty', emptyX, emptyY);
        this.gameArea[emptyX * config.getColumnCount() + emptyY] = false;

    };

    // draw an empty field
    this.drawField = function (mode, xcounter, ycounter) {
        var xcoord = xcounter * this.width + config.getGridBorder();
        var ycoord = ycounter * this.height + config.getGridBorder();

        switch (mode) {

            case 'empty':
                this.gamepad.fillStyle = config.getDeadColor();
                this.gamepad.fillRect(xcoord,
                    ycoord,
                    this.width - config.getGridBorder(),
                    this.height - config.getGridBorder());
                break;

            case 'filled':
                this.gamepad.fillStyle = this.ballGrad;
                this.gamepad.fillRect(xcoord,
                    ycoord,
                    this.width - config.getGridBorder(),
                    this.height - config.getGridBorder());
                break;

            case 'complete':
                this.gamepad.fillStyle = this.ballGrad;
                this.gamepad.fillRect(config.getGridBorder(),
                    config.getGridBorder(),
                    this.width - config.getGridBorder(),
                    this.height - config.getGridBorder());
                break;

            default:
                throw new Error('drawField mode missing or unknown');
        }

    };

    // fade part or all of effects canvas
    this.whiteWash = function (xCnt, yCnt) {

        // paint whitewash over the image to achieve a faded effect
        this.effectspad.fillStyle = "rgba(255, 255, 255, 0.60)";

        var xcoord = xCnt * this.width + config.getGridBorder();
        var ycoord = yCnt * this.height + config.getGridBorder();
        var width = this.width - config.getGridBorder();
        var height = this.height - config.getGridBorder();

        if ((typeof xCnt === "undefined" )
            || (typeof yCnt === "undefined" )
        ) {
            xcoord = 0;
            ycoord = 0;
            width = this.width * config.getColumnCount() + 2 * config.getGridBorder();
            height = this.height * config.getRowCount() + 2 * config.getGridBorder();
        }

        this.effectspad.fillRect(xcoord, ycoord, width, height);
    };

    //clear effects or info canvas
    this.clearEffects = function (name) {
        var width = this.width * config.getColumnCount() + 2 * config.getGridBorder();
        var height = this.height * config.getRowCount() + 2 * config.getGridBorder();

        switch (name) {
            case 'effects':
                this.effectspad.clearRect(0, 0, width, height);
                break;

            case 'info':
                this.infopad.clearRect(0, 0, width, height);
                break;

            default:
                throw new Error('Called clearEffects on unknown context ' + name + '!');
        }
    };

    //print am message on the info canvas
    this.printInfo = function (msg) {

        var width = this.width * config.getColumnCount() + 2 * config.getGridBorder();
        var height = this.height * config.getRowCount() + 2 * config.getGridBorder();
        var maxWidth = width - 20;
        var xAnchor = width / 2;
        var yAnchor = height / 2 + config.getFontSize() / 4;

        this.infopad.fillStyle = "#FFFFFF";
        this.infopad.font = "bold " + config.getFontSize() + "px Arial";
        this.infopad.textAlign = "center";
        this.infopad.fillText(msg, xAnchor, yAnchor, maxWidth);
    };

    // place switch filled tile with empty one
    this.switchTiles = function (xFrom, yFrom) {

        //keep track of tiles positions on gamepad
        var target = this.emptyTile.getYpos() * config.getRowCount() + this.emptyTile.getXpos();
        var source = yFrom * config.getRowCount() + xFrom;
        var temp = this.shuffledTiles[target];
        this.shuffledTiles[target] = this.shuffledTiles[source];
        this.shuffledTiles[source] = temp;

        var oPos = this.shuffledTiles[this.emptyTile.getYpos() * config.getRowCount() + this.emptyTile.getXpos()];
        var xcoordTo = oPos.getXpos() * this.width + config.getGridBorder();
        var ycoordTo = oPos.getYpos() * this.height + config.getGridBorder();

        var xdiff = this.emptyTile.getXpos() - oPos.getXpos();
        var ydiff = this.emptyTile.getYpos() - oPos.getYpos();

        //paint
        this.gamepad.save();
        this.gamepad.fillStyle = this.ballGrad;
        this.gamepad.translate(xdiff * this.width, ydiff * this.height);

        this.gamepad.fillRect(xcoordTo,
            ycoordTo,
            this.width - config.getGridBorder(),
            this.height - config.getGridBorder());
        this.gamepad.restore();

        //this.drawEmptyField( gamepad, iXPosFrom, iYPosFrom );
        this.drawField('empty', xFrom, yFrom);

        //keep track of empty tile
        this.emptyTile.setXpos(xFrom);
        this.emptyTile.setYpos(yFrom);
    };

    //function runs a check if all tiles are restored to their initial positions
    this.checkTilesPositions = function () {
        var blAllOrig = true;

        //run over this.shuffledTiles array and check if they are in the correct position
        for (var xcnt = 1; xcnt < config.getColumnCount(); xcnt++) {
            for (var ycnt = 1; ycnt < config.getRowCount(); ycnt++) {
                var oPos = this.shuffledTiles[ycnt * config.getRowCount() + xcnt];
                if (( xcnt != oPos.getXpos() )
                    || ( ycnt != oPos.getYpos() )) {
                    blAllOrig = false;
                }
            }
        }
        return blAllOrig;
    };

    //The empty tile is the lower right one when starting.
    // We need to keep track where that one currently resides
    //and randomly chose one of the neighboring tiles (not the diagonally adjacent ones) to be moved (max 4)
    this.shuffleOnce = function () {
        // choose coord (x/0 or y/1), choose sign _(+ or 1)
        var iRandCoord = Math.floor(Math.random() * 2);
        var iRandSign = Math.floor(Math.random() * 2) * 2 - 1;

        var iXPlus = 0;
        var iYPlus = 0;
        if (0 == iRandCoord) {
            iXPlus = 1;
        } else {
            iYPlus = 1;
        }

        var iXPosFrom = (this.emptyTile.getXpos() + iRandSign * iXPlus);
        var iYPosFrom = (this.emptyTile.getYpos() + iRandSign * iYPlus);

        if (( 0 <= iXPosFrom )
            && ( 0 <= iYPosFrom )
            && ( iXPosFrom < config.getColumnCount())
            && ( iYPosFrom < config.getRowCount())
            && this.gameArea[iYPosFrom * config.getRowCount() + iXPosFrom]
        ) {
            // switch the tiles
            this.switchTiles(iXPosFrom, iYPosFrom);
        }
    };

    //start the move
    this.startMove = function (xpos, ypos) {

        // check if we already have a selected tile ( an unfinished move)
        if (null != this.selectedTile) {
            return;
        }

        // determine which field is addressed
        var xcnt = Math.floor((xpos - config.getGridBorder()) / this.width);
        var ycnt = Math.floor((ypos - config.getGridBorder()) / this.height);

        // the empty tile field cannot be selected
        if (( xcnt == this.emptyTile.getXpos() )
            && ( ycnt == this.emptyTile.getYpos() )
        ) {
            return;
        }

        // set selected tile object
        this.selectedTile = new Pos();
        this.selectedTile.setXpos(xcnt);
        this.selectedTile.setYpos(ycnt);

        this.whiteWash(xcnt, ycnt);
    };

    // end the move
    this.endMove = function (xpos, ypos) {

        //we need a selected tile
        if (null == this.selectedTile) {
            return;
        }

        //determine which field is addressed, this is the move's end position
        var xcnt = Math.floor((xpos - config.getGridBorder()) / this.width);
        var ycnt = Math.floor((ypos - config.getGridBorder()) / this.height);

        //coordinate diff
        var totaldiff = Math.abs(this.selectedTile.getXpos() - xcnt) +
            Math.abs(this.selectedTile.getYpos() - ycnt);

        //Only move to empty tile field is possible
        //Diagonal moves are forbidden so totaldiff MUST be 1
        if (( xcnt == this.emptyTile.getXpos() )
            && ( ycnt == this.emptyTile.getYpos() )
            && (1 == totaldiff)
        ) {
            this.switchTiles(this.selectedTile.getXpos(), this.selectedTile.getYpos());
            this.clearEffects('effects');
            this.countOfMoves++;
            this.selectedTile = null;
            this.gameOver = this.checkTilesPositions();
        }
        this.clearEffects('effects');
    };

    // cancel a move
    this.cancelMove = function () {
        this.clearEffects('effects');
        this.selectedTile = null;
    };

}

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

    if (typeof interval != 'undefined') {
        window.clearInterval(interval);
    }

    if (( null != timer )
        && haltTimeTracker
    ) {
        timer.stopTimer(true);
        timer.showDisplay();
        timer = null;
    }
}

//page load
$(window).ready(
    function () {
        try {
            info = new InfoHandler('runtimeinfo');
            config = new TilesConfig(400, 400, 'container');
            game = new Tiles(config, info);
            game.createPad();

            $("#controls").css({
                position: "absolute",
                top: ( $("#canvas").height() + $("#index_main_top").height() ) + "px"
            }).show();

        } catch (err) {
            document.getElementById("errorinfo").innerHTML = err.message;
        }
    }
);

//attach events
$("#container").bind("mousedown mouseup touchstart touchmove touchend", function (event) {
    try {
        if (true != game.isShufflingNow()) {
            game.handleMove(event);
        }
    } catch (err) {
        document.getElementById("errorinfo").innerHTML = err.message;
    }
});

$("#shuffle").bind("click ontouchstart", function (event) {
    try {
        if (( true != game.isShufflingNow() )
            && ('running' != game.getStatus() )
        ) {
            game.shuffle();
        }
    } catch (err) {
        document.getElementById("errorinfo").innerHTML = err.message;
    }
});

$("#reset").bind("click ontouchstart", function (event) {
    try {
        if (true != game.isShufflingNow()) {
            stopTimer(true);
            stopInfo();
            game = new Tiles(config, info);
            game.createPad();
        }
    } catch (err) {
        document.getElementById("errorinfo").innerHTML = err.message;
    }
});