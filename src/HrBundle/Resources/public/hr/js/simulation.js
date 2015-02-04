/*
* Conways Game of Life implementation by HR
* Last change 2015-01-31 by HR
*
* For now: all rights reserved.
 */

// configuration
function GolConfig( width, height, containerid )
{
    if ( !$.isNumeric(width) ) {
        throw new Error('width is not a number!');
    }
    if ( !$.isNumeric(height) ) {
        throw new Error('height is not a number');
    }

    this.mode         = 'normal';
    this.deadColor    = '#C6C6C6';
    this.aliveColor   = '#446ED9';
    this.neutralColor = '#132042'; //'#000000';
    this.gridBorder   = 1;
    this.gridSize      = 13;
    this.width         = Math.ceil(width);
    this.height        = Math.ceil(height);
    this.canvasid    = 'canvas';
    this.containerid = 'container';

    if ( 0 < containerid.length ) {
        this.containerid = containerid;
    }

    // we have 10px padding to the left and 2px to the top
    this.leftOffset = 10;
    this.topOffset  = 2;

    // getters
    this.getName = function() {
        return 'GolConfig';
    };
    this.getCanvasId = function() {
        return this.canvasid;
    };
    this.getContainerId = function() {
        return this.containerid;
    };
    this.getWidth = function() {
        return this.width;
    };
    this.getHeight = function() {
        return this.height;
    };
    this.getDeadColor = function() {
        return this.deadColor;
    };
    this.getAliveColor = function() {
        return this.aliveColor;
    };
    this.getNeutralColor = function() {
        return this.neutralColor;
    };
    this.getLeftOffset = function() {
        return this.leftOffset;
    };
    this.getTopOffset = function() {
        return this.topOffset;
    };
    this.getHorizontalWidth = function() {
        return 35 * this.gridSize + 1;
    };
    this.getHorizontalHeight = function() {
        return 15 * this.gridSize + 1;
    };
    this.getVerticalWidth = function() {
        return 23 * this.gridSize + 1;
    };
    this.getVerticalHeight = function() {
        var height = 21 * this.gridSize + 1;
        if ( window.navigator.standalone ) {
            height = 28 * this.gridSize + 1;
        }
        return height;
    };

    //calculate number of columns canvas will have
    this.getColumnCnt = function (canvasWidth) {
        var columns = Math.floor((canvasWidth - this.gridBorder) / this.gridSize);
        return columns;
    };

    //calculate number of rows canvas will have
    this.getRowCnt = function (canvasHeight) {
        //var rows = Math.floor( (canvasHeight - this.gridBorder)/this.gridSize );
        var rows = Math.floor((canvasHeight - this.gridBorder) / this.gridSize);
        return rows;
    };

    // set the border mode, default is normal (dead cells outside)
    this.switchMode = function () {
        if ('torus' == this.mode) {
            this.mode = 'normal';
        } else {
            this.mode = 'torus'
        }
    };

    this.getMode = function() {
        return this.mode;
    };

}


function GameOfLife( config, infoHandler ) {

    this.canvas          = null;
    this.simulation      = null;
    this.lastOrientation = null;
    this.timer           = 0;

    this.getName = function() {
        return 'GameOfLife';
    };

    if ('GolConfig' != config.getName()) {
        throw new Error('Parameter config is not of type GolConfig!');
    }
    if ('InfoHandler' != infoHandler.getName()) {
        throw new Error('Parameter infoHandler is not of type infoHandler!');
    }

    //append canvas element
    this.getCanvas = function() {

        if ( null == this.canvas ) {
            if ( null == document.getElementById(config.getContainerId()) ) {
                throw new Error( "Need element with id '" + config.getContainerId() + "' for canvas!" );
            }
            if ( null != document.getElementById(config.getCanvasId())) {
                throw new Error('canvas already exists');
            }

            var container         = document.getElementById(config.getContainerId());
            container.innerHTML   = '';

            this.canvas           = document.createElement(config.getCanvasId());
            this.canvas.width     = config.getWidth();
            this.canvas.height    = config.getHeight();
            this.canvas.id        = config.getCanvasId();
            container.appendChild(this.canvas);
        }
        if ( ! this.canvas.getContext ) {
            throw new Error('Missing canvas context.');
        }
        return this.canvas;
    };

    this.setTimer = function() {
        this.timer = 0;
    };
    this.getTimer = function() {
        return this.timer;
    };

    // init canvas
    this.init = function()
    {
        window.scrollTo(0,1);
        if (  (90 == window.orientation)  || (-90 == window.orientation) ) {
            if (    (null == this.lastOrientation)
                || ('vertical' == this.lastOrientation) ) {
                this.createPad(config.getHorizontalWidth(), config.getHorizontalHeight());
            }
            this.lastOrientation = 'horizontal';
        } else {
            if (    (null == this.lastOrientation)
                || ( 'horizontal' == this.lastOrientation)
            ) {
                this.createPad(config.getVerticalWidth(), config.getVerticalHeight());
            }
            this.lastOrientation = 'vertical';
        }
        window.scrollTo(0,1);
    };

    // fill the canvas
    this.createPad = function(width, height)
    {
       // this.createPad(this.horizontal.width, this.horizontal.height);

        var canvas = this.getCanvas();
        this.simulation = doConwaysGameOfLife( //config.getColumnCnt(canvas.width),
                                               //config.getRowCnt(canvas.height),
                                               width,
                                               height,
                                               config.getDeadColor(),
                                               config.getAliveColor(),
                                               config.getNeutralColor() );

        this.simulation.draw(canvas);
    };



    this.simulationClean = function() {
        throw new Error('implement simulationClean');
    };


    //following code is executed when function is called
    //reset();
    return this;
}

//-----------------------------

// main CONWAYS simulation function
function doConwaysGameOfLife( columns, rows, deadColor, aliveColor, neutralColor )
{
    // row = y, column = x
    // one dimensional array containing cell states (true means ailve)
    // cell at (y, x) is to be found as  y * columns + x
    this.cells = new Array( rows * columns ); // y, x :1,1 -> 1,2 \n 2,1 -> 2,2

    // we need some initial state, for now randomize
    // - TODO: let user set initial state -> possible using setCell
    this.reset = function () {
        for ( var cnt = 1; cnt < rows * columns; cnt++) {
            cells[cnt] = (Math.random() * 2 > 1.0);
        }
        iterationcount = 0;
    };

    // kill all cells
    this.clean = function () {
        for ( var cnt = 0; cnt < rows * columns; cnt++) {
            cells[cnt] = false;
        }
        iterationcount = 0;
    };

    // set a living cell
    this.setCell = function( xcoord, ycoord)
    {
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        // determine which cell is addressed
        var xcnt = Math.floor( (xcoord  - 1)/width );
        var ycnt = Math.floor( (ycoord  - 1)/height );

        if (    (ycnt >= 0) && (ycnt < rows)
            && (xcnt >= 0) && (xcnt < columns) )
        {
            if (cells[ ycnt * columns + xcnt]) {
                cells[ ycnt * columns + xcnt] = false;
            } else {
                cells[ ycnt * columns + xcnt] = true;
            }
        }
    };

    this.cell = function( x, y){
        if ( 'torus' == sMode ) {
            return this.torusCell(x, y);
        } else {
            return this.normalCell(x, y);
        }
    };

    // cell must be inside the grid and tagged as alive in cells array
    this.normalCell = function( x, y ) {
        var blAlive = false;
        if (     (y >= 0) && (y < rows)
            && (x >= 0) && (x < columns)
            && this.cells[ y* columns + x ] )
        {
            blAlive = true;
        }
        return blAlive;
    };

    // cell must be inside the grid and tagged as alive in cells array
    this.torusCell = function( x, y ) {
        var blAlive = false;
        var newx = x;
        var newy = y;
        if ( 0 > x ) {
            newx = columns - 1;
        }
        if ( 0 > y ) {
            newy = rows - 1;
        }
        if ( (columns -1 ) < x ) {
            newx = 0;
        }
        if ( (rows -1 ) < y ) {
            newy = 0;
        }
        if (     (newy >= 0) && (newy < rows)
            && (newx >= 0) && (newx < columns)
            && this.cells[ newy* columns + newx ] )
        {
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
    this.nextStep = function() {
        var nextState = Array( columns * rows );
        // if at least one cell changed this will be true and indicate that the simulation is still alive
        var blSomethingChanged = false;
        for (var cellx = 0; cellx < columns; cellx++) {
            for (var celly = 0; celly < rows; celly++) {

                var livingNeighbourCount = 0;
                var blCurrentCellAlive = cell(cellx, celly);
                nextState[celly * columns + cellx] = false;

                // the current cell resides at cellx, celly
                // we need to consider the following neighbouring cells: (coordinate combinations)
                // (celly - 1), (celly), (celly + 1)
                // (cellx - 1), (cellx), (cellx + 1)
                // *** How to handle end cells? -> we should simulate a torus, currently we just do a hard cutoff
                // *** neighbouring cells of (1,1) are (1,2), (2,2), (2,1) and (columns, 1)

                // simple implementation: just count how many neighbours are alive
                for ( var i=-1; i<=1; i++ ) {
                    for ( var j=-1; j<=1; j++ ) {
                        if (    cell(cellx + i, celly + j)
                            && !( 0 == i && 0 == j )
                        ) {
                            livingNeighbourCount++;
                        }
                    }
                }
                // a dead cell with exactly three living neighbours will be reborn
                if ( (3 == livingNeighbourCount) &&  !blCurrentCellAlive) {
                    nextState[celly * columns + cellx] = true;
                }
                // a living cell with less than two living neighbours dies
                if ( (3 > livingNeighbourCount) &&  blCurrentCellAlive) {
                    nextState[celly * columns + cellx] = false;
                }
                // a living cell with two or three livin neighbours will stay alive
                if ( ( (2 == livingNeighbourCount)  || (3 == livingNeighbourCount) )
                    &&  blCurrentCellAlive) {
                    nextState[celly * columns + cellx] = true;
                }
                // a living cell with more than three living neighbours dies
                if ( (3 < livingNeighbourCount) &&  blCurrentCellAlive) {
                    nextState[celly * columns + cellx] = false;
                }
                // check if something changed for this cell
                if ( blCurrentCellAlive != nextState[celly * columns + cellx] ) {
                    blSomethingChanged = true;
                }
            }
        }
        cells = nextState;
        iterationcount++;
        return blSomethingChanged;
    };

    // draw onto a 2d canvas
    this.draw = function ( canvas ) {
        var gamepad = canvas.getContext('2d');
        var width  = Math.floor(canvas.width / columns);
        var height = Math.floor(canvas.height / rows);

        // first clear all, plus 1 is for the grid lines
        gamepad.fillStyle = this.deadColor;
        gamepad.fillRect(0, 0, columns * width, rows * height);

        //now draw the cells
        gamepad.fillStyle = this.aliveColor;
        // we need a double loop, outer loop iterates over x values
        // inner loop runs over y values
        for (var xcounter = 0; xcounter < columns; xcounter++) {
            var xcoord = xcounter*width;
            for (var ycounter = 0; ycounter < rows; ycounter++) {
                var ycoord = ycounter*height;

                gamepad.fillStyle = this.neutralColor;
                gamepad.fillRect( xcoord, ycoord, width, height);

                // draw living and dead cells
                if ( cells[ycounter*columns + xcounter] ) {

                    gamepad.fillStyle = this.aliveColor;
                    gamepad.fillRect( xcoord, ycoord, width-1, height-1);
                }
            }
        }
    };

    // return some statistics data
    this.getStatistics = function() {
        var statObject = new Object();
        statObject.cellcount = rows * columns;
        statObject.livecount = 0;
        statObject.deadcount = 0;
        statObject.iterationcount = iterationcount;

        for ( var i=0; i<statObject.cellcount; i++) {
            if ( cells[i] ) {
                statObject.livecount++;
            } else {
                statObject.deadcount++;
            }
        }
        return statObject;
    };

    //following code is executed when function is called
    reset();
    return this;
}






//-------------------------
//status information
function InfoHandler( infodivname ) {

    this.getName = function() {
        return 'InfoHandler';
    };

    this.infodiv = document.getElementById( infodivname );
    if ( ! this.infodiv instanceof HTMLDivElement ) {
        throw new Error("Cannot access infodiv!");
    }

    //show status information
    this.showInfo = function( message ) {
        this.infodiv.innerHTML = message;
    };

    this.getInfoDivId = function() {
        return this.infodiv.id;
    };
}


$( window ).load(

    function() {

        if ( 'Tests for Conways Game of Life' != document.title ) {
            try {
                var info   = new InfoHandler( 'runtimeinfo' );
                var config = new GolConfig( 100, 200, 'container' );
                var game   = new GameOfLife( config, info );

                game.init();
                //game.createPad();


                //game.createPad();
                //game.changeMode();
            }
            catch(err) { alert(err.message);
                document.getElementById("runtimeinfo").innerHTML = err.message;
            }
        }
    }
)
