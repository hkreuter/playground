/*
 Solitaire implementation by HR
 Last change 2015-01-30 by HR

 For now: all rights reserved.
 */

var canvas          = null;
var game            = null;
var lastOrientation = null;
var countOfMoves    = 0;
var infodiv         = null;
var possibleMoves   = 0;

// check time played
var timePlayed;
var startTime    = null;
var stopTime     = null;
var displayTimer = null;

//we forbid diagonal moves for the standard setup
var blForbidDiagonalMoves = true;

// has to be uneven numbers
var rows    = 7;
var columns = 7;

// status messages
var currentState = 'ready';

// contains basic gamepad info
var gameArea = new Array( 0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0, 0
);

var ballsDefault = new Array( 0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0, 0
);

var selectedBallDefault = new Array( 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
);

var balls        = null;
var selectedBall = null;

// we have 10px padding to the left and 2px to the top
var leftOffset = 12;
var topOffset = 2;

var gridSize = 42;
var gridBorder = 2;
var ballRadius = 18;

// object containing horizontal height and width
var horizontal = new Object();
horizontal.width  = columns * this.gridSize + 1;
horizontal.height = rows * this.gridSize + 1;

// object containing vertical height and width
var vertical = new Object();
vertical.width  = columns * this.gridSize + 1;
vertical.height = rows * this.gridSize + 1;
if (window.navigator.standalone) {
    vertical.height = 7 * this.gridSize + 1;
}

// init information stuff
function initInfo( infodivname )
{
    infodiv = document.getElementById( infodivname );
    displayTimer = document.getElementById( 'timer' );
    displayTimer.innerHTML = "00:00:00";
}

// init game
function init()
{
    window.scrollTo(0,1);
    if (  (90 == window.orientation)  || (-90 == window.orientation) ) {
        if (    (null == this.lastOrientation)
            || ('vertical' == this.lastOrientation) ) {
            this.createPad(this.horizontal.width, this.horizontal.height);
        }
        this.lastOrientation = 'horizontal';
    } else {
        if (    (null == this.lastOrientation)
            || ( 'horizontal' == this.lastOrientation)
        ) {
            this.createPad(this.vertical.width, this.vertical.height);
        }
        this.lastOrientation = 'vertical';
    }
    window.scrollTo(0,1);
}

//reset to initial state
function solitaireReset()
{
    if ( this.game && this.canvas && this.canvas.getContext ) {
        this.game.reset();
        this.game.draw(this.canvas);
        currentState = 'ready';
        stopTimer( true );
        showInfo(currentState);
    }
}

// fill the canvas
function createPad(width, height)
{
    var newcanvas = document.createElement('canvas');
    newcanvas.width = width;
    newcanvas.height = height;
    newcanvas.id = 'canvas';
    document.getElementById('container').innerHTML = "";
    document.getElementById('container').appendChild(newcanvas);
    this.canvas = document.getElementById('canvas');

    var columns = (canvas.width - this.gridBorder)/this.gridSize;
    var rows   = (canvas.height - this.gridBorder)/this.gridSize;

    this.game = hrSolitaire();

    if (    this.game
        && this.canvas
        && this.canvas.getContext
    ) {
        this.game.draw(this.canvas);
        this.game.checkPossibleMoves();
        showInfo(currentState);
    }
}

// select a ball
function gameSelectBall( eventsource )
{
    //check type of that event
    var eventType = eventsource.type;

    if (   this.game && this.canvas && this.canvas.getContext
        && ( ('ready' == currentState) || ('running' == currentState) )
    ) {

        if ( 'touchstart' == eventType) {
            //use this for ipod touchscreen
            var mousex = eventsource.touches[0].pageX;
            var mousey = eventsource.touches[0].pageY;
        } else {
            var mousex = document.all ? window.event.clientX : eventsource.pageX;
            var mousey = document.all ? window.event.clientY : eventsource.pageY;
        }

        if ('ready' == currentState ) {
            if ( null == displayTimer ) {
                displayTimer = document.getElementById( 'timer' );
            }
            startTimer();
            currentState = 'running';
        }

        this.game.selectBall(this.canvas, mousex - leftOffset, mousey - topOffset);
        this.game.checkPossibleMoves();
        showInfo( currentState );
    }
    return;
}

//main game handling function
function hrSolitaire( )
{
    this.deadColor    = '#C6C6C6';
    this.aliveColor   = '#446ED9';
    this.neutralColor = '#446ED9'; //'#000000';

    // reset to initial state
    this.reset = function() {
        balls = new Array();
        selectedBall = new Array();
        for ( var cnt = 0; cnt < rows * columns; cnt++) {
            balls[cnt] = ballsDefault[cnt];
            selectedBall[cnt] = selectedBallDefault[cnt];
        }
        countOfMoves = 0;
    }

    // count remaining balls
    this.countLeftoverBalls = function()
    {
        var leftoverBalls = 0;
        for ( var cnt = 0; cnt < rows * columns; cnt++) {
            leftoverBalls += Number(balls[cnt]);
        }
        return leftoverBalls;
    }

    // select a ball
    this.selectBall = function( canvas, xcoord, ycoord )
    {
        var gamepad = canvas.getContext('2d');
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        // determine which ball is addressed
        var xcnt = Math.floor( (xcoord  - 1)/width );
        var ycnt = Math.floor( (ycoord  - 1)/height );

        //only one ball can be selected at a time
        var selectedPos = null;
        for ( var cnt = 0; cnt < rows * columns; cnt++) {
            if ( selectedBall[cnt] ) {
                selectedPos =  cnt;
            }
        }

        //ball must be inside the game area, on an allowed field
        if (    (ycnt >= 0) && (ycnt < rows)
            && (xcnt >= 0) && (xcnt < columns)
            && gameArea[ycnt * rows + xcnt]
        )
        {
            // if we have already a formerly selected ball and click selects this one, unselect it
            if ( null != selectedPos ) {
                if ( selectedBall[ ycnt * rows + xcnt] ) {
                    selectedBall[ ycnt * rows + xcnt] = 0;
                    // and draw that ball as normal (unselected) ball
                    this.game.drawBall( gamepad, xcnt, ycnt );
                } else {
                    // check move
                    var blMoveOk = false;
                    blMoveOk = this.checkMove( canvas, selectedPos, xcnt, ycnt, true);
                    //if move is ok unset selection
                    if (blMoveOk) {
                        selectedBall[selectedPos] = 0;
                        countOfMoves++;
                    }
                }
            } else {
                // no ball selected yet, check if there is a ball at that position
                if( balls[ycnt * rows + xcnt]) {
                    selectedBall[ ycnt * rows + xcnt] = 1;
                    // and draw that ball as selected
                    this.game.drawSelected( gamepad, xcnt, ycnt );
                }
            }
        }
    }

    //check if a move is possible
    this.checkMove = function( canvas, selectedPos, xTo, yTo, blDoForReal )
    {
        var gamepad = canvas.getContext('2d');
        var yFrom = Math.floor( selectedPos/columns);
        var xFrom = Math.floor(selectedPos - yFrom*rows );

        // possible positions are xFrom+/- 2 or same, yFrom +/- 2 or same
        if (    (xTo != (xFrom + 2) )
            && (xTo != (xFrom - 2) )
            && (xTo != xFrom)
        ) {
            return false;
        }
        if (    (yTo != (yFrom + 2) )
            && (yTo != (yFrom - 2) )
            && (yTo != yFrom)
        ) {
            return false;
        }

        //diagonal moves are forbidden, so either x or y must stay the same
        if ( blForbidDiagonalMoves && (xTo != xFrom) && (yTo != yFrom) ) {
            return false;
        }

        //we got here, now check if end position is inside the game area,
        //should not happen we are outside but better check again here
        if ( !gameArea[yTo * rows + xTo] ) {
            return false;
        }

        //can only jump to empty slot
        if ( balls[yTo * rows + xTo] ) {
            return false;
        }

        //possible move, but we have to check for one ball in between
        var xDiff = ( xTo - xFrom ) > 0 ? 1 : -1;
        var yDiff = ( yTo - yFrom) > 0 ? 1 : -1;
        xDiff = ( xTo == xFrom ) ? 0 : xDiff;
        yDiff = ( yTo == yFrom ) ? 0 : yDiff;
        var xDel  = xFrom + xDiff;
        var yDel  = yFrom + yDiff;

        // check if the is a ball that can be deleted
        if ( !balls[yDel * rows + xDel]) {
            return false;
        }

        //make it a real move?
        if (blDoForReal) {
            //balls from position will be empty and balls to has to be filled
            balls[yFrom * rows + xFrom] = 0;
            balls[yTo * rows + xTo] = 1;
            balls[yDel * rows + xDel] = 0;

            // update the canvas
            this.game.deleteBall( gamepad, xFrom, yFrom );
            this.game.deleteBall( gamepad, xDel, yDel );
            this.drawBall( gamepad, xTo, yTo );
        }

        return true;
    }

    //count all possible moves, do it the stupid way for now:
    //iterate over all positions in a double loop
    //TODO: find an intelligent algorithm for this
    this.checkPossibleMoves = function()
    {
        possibleMoves = 0;

        for ( var selcnt = 0; selcnt < rows * columns; selcnt++ ) {
            //if it lies inside the game area, check for possible moves
            // AND there must be a ball at the start position
            if ( gameArea[selcnt] && balls[selcnt] ){
                for ( var mvcnt = 0; mvcnt < rows * columns; mvcnt++ ) {
                    if ( gameArea[mvcnt] ){
                        blMovePossible = false;
                        var yTo = Math.floor( mvcnt/columns);
                        var xTo = Math.floor( mvcnt - yTo*rows );
                        blMovePossible = this.checkMove( canvas, selcnt, xTo, yTo, false );
                        possibleMoves += Number( blMovePossible );
                    }
                }
            }
        }
    }

    // draw onto a 2d canvas
    this.draw = function ( canvas ) {
        var gamepad = canvas.getContext('2d');
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        // for drawing circles
        var radius     = ballRadius;            // Arc radius
        var startAngle = 0;                     // Starting point on circle
        var endAngle   = 2*Math.PI;

        // first clear all, plus 1 is for the grid lines
        gamepad.fillStyle = this.aliveColor;
        gamepad.fillRect(0, 0, columns * width + 1, rows * height + 1);

        //now draw the balls
        gamepad.fillStyle = this.aliveColor;
        // we need a double loop, outer loop iterates over x values
        // inner loop runs over y values
        for (var xcounter = 0; xcounter < columns; xcounter++) {
            for (var ycounter = 0; ycounter < rows; ycounter++) {

                var ballPos = ycounter*columns + xcounter;

                // draw gamepad
                if ( gameArea[ballPos] && !balls[ballPos] && !selectedBall[ballPos] ) {
                    this.deleteBall( gamepad, xcounter, ycounter );
                }
                // draw balls
                if( gameArea[ballPos] && balls[ballPos] && !selectedBall[ballPos]  ) {
                    this.drawBall( gamepad, xcounter, ycounter );
                }
                //selected ball
                if( gameArea[ballPos] && balls[ballPos] && selectedBall[ballPos] ) {
                    this.drawSelected( gamepad, xcounter, ycounter );
                }
            }
        }
    }

    // draw a deleted ball
    this.deleteBall = function( gamepad, xcounter, ycounter )
    {
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        var xcoord = xcounter*width + 1;
        var ycoord = ycounter*height + 1;
        var xballcoord = xcoord + width/2;
        var yballcoord = ycoord + height/2;

        // for drawing circles
        var radius     = ballRadius;            // Arc radius
        var startAngle = 0;                     // Starting point on circle
        var endAngle   = 2*Math.PI;

        var ballGrad = gamepad.createRadialGradient(xballcoord, yballcoord, radius-8, xballcoord, yballcoord, radius );
        ballGrad.addColorStop(0, '#446ED9');
        ballGrad.addColorStop(0.8, '#00B5E2');
        ballGrad.addColorStop(1, '#446ED9');
        gamepad.fillStyle = ballGrad;
        gamepad.fillRect(xcoord, ycoord, width-1, height-1);
    }

    // draw a ball
    this.drawBall = function( gamepad, xcounter, ycounter )
    {
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        var xcoord = xcounter*width + 1;
        var ycoord = ycounter*height + 1;
        var xballcoord = xcoord + width/2;
        var yballcoord = ycoord + height/2;

        // for drawing circles
        var radius     = ballRadius;            // Arc radius
        var startAngle = 0;                     // Starting point on circle
        var endAngle   = 2*Math.PI;

        var ballGrad = gamepad.createRadialGradient(xballcoord+1, yballcoord+1, radius-8, xballcoord, yballcoord, radius );
        ballGrad.addColorStop(0, '#F4F201');
        ballGrad.addColorStop(0.6, '#E4C700');
        ballGrad.addColorStop(0.8, '#E4A700');
        ballGrad.addColorStop(1, '#446ED9');
        gamepad.fillStyle = ballGrad;
        gamepad.fillRect(xcoord, ycoord, width-1, height-1);
    }

    // draw a selected ball
    this.drawSelected = function( gamepad, xcounter, ycounter )
    {
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        var xcoord = xcounter*width + 1;
        var ycoord = ycounter*height + 1;
        var xballcoord = xcoord + width/2;
        var yballcoord = ycoord + height/2;

        // for drawing circles
        var radius     = ballRadius;            // Arc radius
        var startAngle = 0;                     // Starting point on circle
        var endAngle   = 2*Math.PI;

        var ballGrad = gamepad.createRadialGradient(xballcoord, yballcoord, radius-8, xballcoord, yballcoord, radius );
        ballGrad.addColorStop(0, '#FDB000');
        ballGrad.addColorStop(0.8, '#FD5300');
        ballGrad.addColorStop(1, '#446ED9');
        gamepad.fillStyle = ballGrad;
        gamepad.fillRect(xcoord, ycoord, width-1, height-1);
    }

    //following code is executed when function is called
    this.reset();
    return this;
}

// show game status info
function showInfo( status )
{
    var sMessage = status;

    if ('running' == status) {

        if( 0 == possibleMoves ) {
            if ( this.game && (1 < this.game.countLeftoverBalls()) ) {
                sMessage = "Game over! You Lost! \n\n No more moves possible. \n\n" + this.game.countLeftoverBalls() + " balls are left.";
            } else {
                sMessage = "Game over! You won! \n\n Moves played: " + countOfMoves;
            }
            stopTimer( false );
            currentState = 'game over';
            alert(sMessage);
        }
    }
}

// start time to get time played
function startTimer()
{
    var today  = new Date();
    startTime = today.getTime();
    doTimer();
}

// stop timer
function stopTimer( blReset )
{
    if ( blReset ) {
        displayTimer.innerHTML = '00:00:00';
    }
    displayTimer = null;
}

// timer loop
function doTimer( )
{
    var today  = new Date();
    var curTime = today.getTime();
    var secs = Math.floor( (curTime - startTime)/1000 );

    var hours   = checkLeading( Math.floor(secs/3600) );
    var minutes = checkLeading( Math.floor( (secs - 3600*hours)/60) );
    var seconds = checkLeading( Math.floor( secs - 3600*hours - minutes*60) );

    timePlayed = hours + ':' + minutes + ':' + seconds;

    if ( displayTimer != null) {
        displayTimer.innerHTML = timePlayed;
        timeout = setTimeout( 'doTimer()', 50);
    }
}

// add leading zero
function checkLeading( i )
{
    if (i<10) {
        i="0" + i;
    }
    return i;
}


// stop time to get time played
function getTimePlayed()
{
    var today  = new Date();
    var milsecs = 0;
    currentTime = today.getTime();
    milsecs = startTime - currentTime;

    timePlayed = milsecs;
}

// dirty check, improve later
function checkClient(){
    if (navigator.appVersion.indexOf("iPhone") == -1){
        var sMessage = "Please access the webapp from your iPhone/iTouch!\n\n Otherwise it might not work ...";
        alert(sMessage);
        return false;
    }
}