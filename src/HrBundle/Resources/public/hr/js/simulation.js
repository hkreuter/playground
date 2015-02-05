/*
* Conways Game of Life implementation by HR
* Last change 2015-01-31 by HR
*
* For now: all rights reserved.
 */




// configuration
// parameters: - width       width available for game area
//             - height      height available for game area
//             - containerid id of container div for canvas
//
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
    this.gridSize     = 13;
    this.width        = Math.ceil(width);
    this.height       = Math.ceil(height);
    this.canvasid     = 'canvas';
    this.containerid  = 'container';

    if ( 0 < containerid.length ) {
        this.containerid = containerid;
    }

    // we have 10px padding to the left and 2px to the top
    this.leftOffset = 10;
    this.topOffset  = 2;

    //canvas dimensions
    this.canvasWidth  = width - 2*this.leftOffset;
    this.canvasHeight = height - this.topOffset;

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

    /*
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
    }; */

    //calculate number of columns canvas will have
    this.getColumnCnt = function () {
        var columns = Math.floor((this.canvasWidth - this.gridBorder) / this.gridSize);
        return columns;
    };

    //calculate number of rows canvas will have
    this.getRowCnt = function () {
        var rows = Math.floor((this.canvasHeight - this.gridBorder) / this.gridSize);
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

// game handler
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
/*
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
*/
    // fill the canvas
    this.createPad = function()
    {
        var canvas = this.getCanvas();
        this.simulation = new ConwaysSimlation( config, this.canvas );
        this.simulation.draw(canvas);
        infoHandler.showInfo('ready');
    };

    // kill all the cells
    this.simulationClean = function() {
        if (null == this.simulation) {
            throw new Error('simulation object missing!');
        }
        this.simulation.clean();
        this.simulation.draw(canvas);
    };

    // start simulation
    this.simulationStart = function()
    {
        if (null == this.canvas) {
            throw new Error('No canvas yet!');
        }
        if (null == this.canvas.getContext) {
            throw new Error('Canvas context is missing!');
        }
        if (null == this.simulation) {
            throw new Error('Simulation object missing!');
        }
        if (this.timer != 0) {
            throw new Error('Simulation already running!');
        }

        this.runSimulation();
        this.timer = window.setInterval('runSimulation()', 500);
    };

    // function runs simulation as long as there are changes in cell state
    this.runSimulation = function()
    {
        if (null == this.simulation) {
            throw new Error('Simulation object missing!');
        }

        var blNextStep = this.simulation.nextStep();

        // as long as we have a change in state between current and next step the simulation runs
        if ( blNextStep ) {
            this.simulation.draw(this.canvas);
            info.showInfo('running');
        } else {
            info.showInfo('ended');
            this.simulationHasEnded();
        }
    };

    //following code is executed when function is called
    //reset();
    //return this;
}

//-----------------------------

// main CONWAYS simulation function
function ConwaysSimlation( config, canvas )
{
    if ('GolConfig' != config.getName()) {
        throw new Error('Parameter config is not of type GolConfig!');
    }

    this.rows           = config.getRowCnt();
    this.columns        = config.getColumnCnt();
    this.iterationcount = null;

    // row = y, column = x
    // one dimensional array containing cell states (true means alive)
    // cell at (y, x) is to be found as  y * columns + x
    this.cells = new Array( this.rows * this.columns ); // y, x :1,1 -> 1,2 \n 2,1 -> 2,2

    // we need some initial state, for now randomize
    // - TODO: let user set initial state -> possible using setCell
    this.reset = function () {
        for ( var cnt = 1; cnt < this.rows * this.columns; cnt++) {
            this.cells[cnt] = (Math.random() * 2 > 1.0);
        }
        this.iterationcount = 0;
    };

    // kill all cells
    this.clean = function () {
        for ( var cnt = 0; cnt < this.rows * this.columns; cnt++) {
            this.cells[cnt] = false;
        }
        this.iterationcount = 0;
    };

    // set a living cell
    this.setCell = function( xcoord, ycoord)
    {
        var width  = Math.floor(canvas.width / this.columns);
        var height = Math.floor(canvas.height / this.rows);

        // determine which cell is addressed
        var xcnt = Math.floor( (xcoord  - 1)/width );
        var ycnt = Math.floor( (ycoord  - 1)/height );

        if (    (ycnt >= 0) && (ycnt < this.rows)
            && (xcnt >= 0) && (xcnt < this.columns) )
        {
            if (this.cells[ ycnt * this.columns + xcnt]) {
                this.cells[ ycnt * this.columns + xcnt] = false;
            } else {
                this.cells[ ycnt * this.columns + xcnt] = true;
            }
        }
    };

    // cell
    this.cell = function(x, y){
        if ( 'torus' == config.getMode() ) {
            return this.torusCell(x, y);
        } else {
            return this.normalCell(x, y);
        }
    };

    // cell must be inside the grid and tagged as alive in cells array
    this.normalCell = function( x, y ) {
        var blAlive = false;
        if (     (y >= 0) && (y < this.rows)
            && (x >= 0) && (x < this.columns)
            && this.cells[ y* this.columns + x ] )
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
            newx = this.columns - 1;
        }
        if ( 0 > y ) {
            newy = this.rows - 1;
        }
        if ( (this.columns -1 ) < x ) {
            newx = 0;
        }
        if ( (this.rows -1 ) < y ) {
            newy = 0;
        }
        if (     (newy >= 0) && (newy < this.rows)
            && (newx >= 0) && (newx < this.columns)
            && this.cells[ newy* this.columns + newx ] )
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
        var nextState = Array( this.columns * this.rows );
        // if at least one cell changed this will be true and indicate that the simulation is still alive
        var blSomethingChanged = false;
        for (var cellx = 0; cellx < this.columns; cellx++) {
            for (var celly = 0; celly < this.rows; celly++) {

                var livingNeighbourCount = 0;
                var blCurrentCellAlive = cell(cellx, celly);
                nextState[celly * this.columns + cellx] = false;

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
                    nextState[celly * this.columns + cellx] = true;
                }
                // a living cell with less than two living neighbours dies
                if ( (3 > livingNeighbourCount) &&  blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = false;
                }
                // a living cell with two or three livin neighbours will stay alive
                if ( ( (2 == livingNeighbourCount)  || (3 == livingNeighbourCount) )
                    &&  blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = true;
                }
                // a living cell with more than three living neighbours dies
                if ( (3 < livingNeighbourCount) &&  blCurrentCellAlive) {
                    nextState[celly * this.columns + cellx] = false;
                }
                // check if something changed for this cell
                if ( blCurrentCellAlive != nextState[celly * this.columns + cellx] ) {
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
        var width  = Math.floor(canvas.width / this.columns);
        var height = Math.floor(canvas.height / this.rows);

        // first clear all, plus 1 is for the grid lines
        gamepad.fillStyle = config.getDeadColor();
        gamepad.fillRect(0, 0, this.columns * width, this.rows * height);

        //now draw the cells
        gamepad.fillStyle = config.getAliveColor();
        // we need a double loop, outer loop iterates over x values
        // inner loop runs over y values
        for (var xcounter = 0; xcounter < this.columns; xcounter++) {
            var xcoord = xcounter*width;
            for (var ycounter = 0; ycounter < this.rows; ycounter++) {
                var ycoord = ycounter*height;

                gamepad.fillStyle = config.getNeutralColor();
                gamepad.fillRect( xcoord, ycoord, width, height);

                // draw living and dead cells
                if ( this.cells[ycounter*this.columns + xcounter] ) {
                    gamepad.fillStyle = config.getAliveColor();
                    gamepad.fillRect( xcoord, ycoord, width-1, height-1);
                }
            }
        }
    };

    // return some statistics data
    this.getStatistics = function() {
        var statObject = new Object();
        statObject.cellcount = this.rows * this.columns;
        statObject.livecount = 0;
        statObject.deadcount = 0;
        statObject.iterationcount = this.iterationcount;

        for ( var i=0; i<statObject.cellcount; i++) {
            if ( cells[i] ) {
                statObject.livecount++;
            } else {
                statObject.deadcount++;
            }
        }
        return statObject;
    };

    //following code is executed when object of type ConwaysSimlation is instantiated
    this.reset();
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
                var config = new GolConfig( 400, 400, 'container' );
                var game   = new GameOfLife( config, info );

                game.createPad();
                game.runSimulation();
            }
            catch(err) { alert(err.message);
                document.getElementById("runtimeinfo").innerHTML = err.message;
            }
        }
    }
);
