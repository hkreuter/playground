/**
 * Created by heike on 20/02/15.
 */

var game      = null;
var interval  = null;
var timer     = null;

// configuration
// parameters: - width       width available for game area
//             - height      height available for game area
//             - containerid id of container div for canvas
//
function TilesConfig( width, height, containerid ) {

    this.canvasid = 'canvas';
    this.containerid = 'container';
    this.width = width;
    this.height = height;

    if ( 0 < containerid.length ) {
        this.containerid = containerid;
    }
    if ( !$.isNumeric(width) ) {
        throw new Error('width is not a number!');
    }
    if ( !$.isNumeric(height) ) {
        throw new Error('height is not a number');
    }

    // we have 10px padding to the left and 2px to the top
    this.leftOffset    = 12;
    this.topOffset     = 2;
    this.gridSize      = 75;
    this.gridBorder    = 2;
    this.ballMaxRadius = 30;
    this.ballMinRadius = 10;
    this.columnCount   = 6;
    this.rowCount      = this.columnCount;

    this.shuffleMaxCount = 200;

    this.deadColor    = '#C6C6C6';
    this.aliveColor   = '#9AB0E5';
    this.neutralColor = '#446ED9';

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
    this.getName = function() {
        return 'TilesConfig';
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
    this.getLeftOffset = function() {
        return this.leftOffset;
    };
    this.getTopOffset = function() {
        return this.topOffset;
    };
    this.getGridBorder = function() {
        return this.gridBorder;
    };
    this.getColumnCount = function() {
        return this.columnCount;
    };
    this.getRowCount = function() {
        return this.rowCount;
    };
    this.getOuterColors = function() {
        return this.outerColors;
    };
    this.getInnerColors = function() {
        return this.innerColors;
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
};

//position object
function Pos(xcnt, ycnt) {

    this.xpos = xcnt;
    this.ypos = ycnt;

    this.getXpos = function(){
        return this.xpos;
    };

    this.getYpos = function(){
        return this.ypos;
    };

    this.setXpos = function(xpos){
        this.xpos = xpos;
    };

    this.setYpos = function(ypos){
        this.ypos = ypos;
    };
};

function centerBall(config, gamepad) {

    if ('TilesConfig' != config.getName()) {
        throw new Error('Parameter config is not of type TilesConfig!');
    }

    this.iRanda = Math.floor(Math.random() * config.getInnerColors().length);
    this.iRandb = Math.floor(Math.random() * config.getOuterColors().length);

    this.xballcoord = Math.floor(config.getWidth() / 2);
    this.yballcoord = Math.floor(config.getHeight() / 2);
    this.inner      = Math.floor(config.getWidth() / 16);
    this.offcenter  = Math.floor(config.getWidth() / 8);

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
};


//main game handling function
function Tiles(config, info)
{
    this.canvas        = null;
    this.effectsCanvas = null;
    this.core          = null;
    this.base          = new GameBase(config);
    this.status        = '';

    if ('TilesConfig' != config.getName()) {
        throw new Error('Parameter config is not of type TilesConfig!');
    }
    if ('InfoHandler' != info.getName()) {
        throw new Error('Parameter infoHandler is not of type infoHandler!');
    }

    //getters
    this.getName = function() {
        return 'Tiles';
    };
    this.getStatus = function(){
        return this.status;
    };

    this.setStatus = function(status){
        this.status = status;
    };

    //check mandatories
    this.checkPrerequisites = function() {
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
    this.createPad = function()
    {
        this.canvas        = this.base.getCanvas();
        this.effectsCanvas = this.base.getCanvas('effects');

        if (null != this.core) {
            throw new Error('Game core already instantiated!');
        }

        this.core = new TilesCore( config, new Array(this.canvas, this.effectsCanvas) );

        this.core.draw(this.canvas);
        this.setStatus('ready');

        //this.core.switchTiles(4,5);

        // start shuffling process
        this.core.startShuffle();
        this.core.shuffleAllTiles(20);

       /*
        this.core.switchTiles(0,0);
        alert( this.core.emptyTile.getXpos() + ' ' + this.core.emptyTile.getYpos() );

        this.core.switchTiles(1,1);
        alert( this.core.emptyTile.getXpos() + ' ' + this.core.emptyTile.getYpos() );

        this.core.switchTiles(2,2);
        alert( this.core.emptyTile.getXpos() + ' ' + this.core.emptyTile.getYpos() );

        this.core.switchTiles(3,3);
        alert( this.core.emptyTile.getXpos() + ' ' + this.core.emptyTile.getYpos() );
        */

    };

}

// tiles business model
function TilesCore(config, canvasses) {

    this.countOfMoves  = 0;
    this.gamepad       = canvasses[0].getContext('2d');
    this.effectspad    = canvasses[1].getContext('2d');
    this.gameArea      = new Array();
    this.shuffledTiles = new Array();
    this.emptyTile     = null;

    this.shuffleCount  = 0;
    this.isShuffling   = false;
    //this.isShufflingDone = false;

    this.width  = Math.floor( config.getWidth() / config.getColumnCount());
    this.height = Math.floor( config.getHeight() / config.getRowCount());

    this.ballGrad = centerBall(config, this.gamepad);
/*
    this.gameArea     = config.getGameArea();
    this.gamepad      = canvas.getContext('2d');
    this.width        = Math.floor(canvas.width / config.getColumnCount());
    this.height       = Math.floor(canvas.height / config.getRowCount());
*/
    //getters
    this.getCountOfMoves = function() {
        return this.countOfMoves;
    };
    this.isShufflingNow = function() {
        return this.isShuffling;
    };

    this.startShuffle = function() {
        if ( true == this.isShufflingNow() ) {
            throw new Error('Shuffling was already started!');
        }
        this.isShuffling = true;
    };

    this.stopShuffle = function() {
        if ( false == this.isShufflingNow() ) {
            throw new Error('Shuffling was already stopped!');
        }
        this.isShuffling = false;
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

                this.drawField( 'filled', xcounter, ycounter );
                this.gameArea[ycounter * config.getColumnCount() + xcounter] = true;
                this.shuffledTiles[ycounter*config.getColumnCount() + xcounter] = new Pos(xcounter, ycounter);
            }
        }

        // we need one empty space
        this.emptyTile = new Pos(config.getColumnCount() - 1, config.getRowCount() - 1);
        this.drawField('empty', config.getColumnCount() - 1, config.getRowCount() - 1);
        this.gameArea[(config.getColumnCount()-1)*config.getColumnCount() + (config.getRowCount()-1)] = false;
    };

    // draw an empty field
    this.drawField = function( mode, xcounter, ycounter )
    {
        var xcoord = xcounter * this.width + config.getGridBorder();
        var ycoord = ycounter * this.height + config.getGridBorder();

        switch (mode) {

            case 'empty':
                this.gamepad.fillStyle = config.getDeadColor();
                this.gamepad.fillRect( xcoord,
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

    // shadow on top of a field
    this.paleoutField = function( xcounter, ycounter, blFade )
    {
        var xcoord = xcounter * this.width + config.getGridBorder();
        var ycoord = ycounter * this.height + config.getGridBorder();

        // clear effects canvas
        this.effectspad.clearRect(0, 0, this.width, this.height);

        if (blFade) {
            // paint whitewash over the image to achieve a faded effect
            this.effectspad.fillStyle = "rgba(255, 255, 255, 0.43)";
            this.effectspad.fillRect(xcoord,
                ycoord,
                this.width - config.getGridBorder(),
                this.height - config.getGridBorder());
        }
    };

    // place switch filled tile with empty one
    this.switchTiles = function(xFrom, yFrom)
    {
        var xdiff = (this.emptyTile.getXpos() - xFrom);
        var ydiff = (this.emptyTile.getYpos() - yFrom);

        this.gamepad.save();
        this.gamepad.fillStyle = this.ballGrad;
        this.gamepad.translate( xdiff * this.width, ydiff * this.height );

        var xcoordTo = xFrom * this.width + config.getGridBorder();
        var ycoordTo = yFrom * this.height + config.getGridBorder();

        this.gamepad.fillRect( xcoordTo,
            ycoordTo,
            this.width - config.getGridBorder(),
            this.height - config.getGridBorder());

        this.gamepad.restore();
        this.drawField( 'empty', xFrom, yFrom );


        var target = this.emptyTile.getYpos() * config.getRowCount() + this.emptyTile.getXpos();
        var source = yFrom * config.getRowCount() + xFrom;
        var temp   = this.shuffledTiles[source];
        this.shuffledTiles[target] = this.shuffledTiles[source];
        this.shuffledTiles[source] = temp;

        //keep track of empty tile
        this.emptyTile.setXpos(xFrom);
        this.emptyTile.setYpos(yFrom);



      /*
        //var xcoordTo = this.emptyTile.getXpos() * this.width + config.getGridBorder();
        //var ycoordTo = this.emptyTile.getYpos() * this.height + config.getGridBorder();

        var xdiff = (xFrom - this.emptyTile.getXpos());
        var ydiff = (yFrom - this.emptyTile.getYpos());

        alert( xdiff * this.width + ' ' + ydiff * this.height );

        this.gamepad.fillStyle = this.ballGrad;
        this.gamepad.translate( xdiff * this.width, ydiff * this.height );

        //this.drawField('empty', config.getColumnCount() - 1, config.getRowCount() - 1);

       */
        /*
        var oPos = this.shuffledTiles[yTo * config.getRowCount() + xTo];

        //var xcoordTo = xTo * this.width + config.getGridBorder();
        //var ycoordTo = yTo * this.height + config.getGridBorder();
       // var xcoordFill = oPos.getXpos() * this.width + config.getGridBorder();
       // var ycoordFill = oPos.getYpos() * this.height + config.getGridBorder();

        var xcoordFill = oPos.getXpos() * this.width + config.getGridBorder();
        var ycoordFill = oPos.getYpos() * this.height + config.getGridBorder();

        var xdiff = 2; //(xTo - oPos.getXpos());
        var ydiff = 2; //(yTo - oPos.getYpos());

//alert( xcoordFill + ' ' + ycoordFill + ' ' + xdiff + ' ' + ydiff + ' ' + oPos.getXpos() + ' ' + oPos.getYpos());

        alert( xTo + ' ' + yTo + ' ' + oPos.getXpos() + ' ' + oPos.getYpos());

      //  this.gamepad.save();
        //this.gamepad.translate( xdiff * this.width, ydiff * this.height );

        this.gamepad.fillStyle = this.ballGrad;
        this.gamepad.translate( 50, 50 );

        this.gamepad.fillRect(30,30, 50, 50 );
*/
     /*   this.gamepad.fillStyle = config.getNeutralColor(); //this.ballGrad;
        this.gamepad.fillRect(xcoordFill,
            ycoordFill,
            this.width - config.getGridBorder(),
            this.height - config.getGridBorder); */

       // this.gamepad.restore();
    };

    //function runs a check if all tiles are restored to their initial positions
    this.checkTilesPositions = function()
    {
        var blAllOrig = true;

        //run over this.shuffledTiles array and check if they are in the correct position
        for ( var xcnt = 1; xcnt < config.getColumnCount(); xcnt++) {
            for ( var ycnt=1; ycnt < config.getRowCount(); ycnt++) {
                var oPos = this.shuffledTiles[ycnt * config.getRowCount() + xcnt];
                if(    ( xcnt != oPos.getXpos() )
                    || ( ycnt != oPos.getYpos() ) ) {
                    blAllOrig = false;
                }
            }
        }
        return blAllOrig;
    };

    //randomly shuffle all tiles
    //The empty tile is the lower right one when starting.
    // We need to keep track where that one currently resides
    //and randomly chose one of the neighboring tiles (not the diagonally adjacent ones) to be moved (max 4)
    this.shuffleAllTiles = function(iterations)
    {
        this.shuffleCount++;

        // choose coord (x/0 or y/1), choose sign _(+ or 1)
        var iRandCoord = Math.floor( Math.random() * 2);
        var iRandSign  = Math.floor( Math.random() * 2) * 2 - 1;

        var iXPlus = 0;
        var iYPlus = 0;
        if ( 0 == iRandCoord) {
            iXPlus = 1;
        } else {
            iYPlus = 1;
        }

        var iXPosFrom = (this.emptyTile.getXpos() + iRandSign*iXPlus);
        var iYPosFrom = (this.emptyTile.getYpos() + iRandSign*iYPlus);

        var asdf = ( iXPosFrom + ' ' + iYPosFrom + ' --- ' + this.emptyTile.getXpos() + ' ' + this.emptyTile.getYpos() );
        document.getElementById('asdf').innerHTML += asdf + ' </br>';

        if (   ( 0 <= iXPosFrom )
            && ( 0 <= iYPosFrom )
            && ( iXPosFrom < config.getColumnCount())
            && ( iYPosFrom < config.getRowCount())
            &&  this.gameArea[iYPosFrom * config.getRowCount() + iXPosFrom]
        ) {
            /*
            var target = this.emptyTile.getYpos() * config.getRowCount() + this.emptyTile.getXpos();
            var source = iYPosFrom * config.getRowCount() + iXPosFrom;
            var temp   = this.shuffledTiles[source];
            this.shuffledTiles[target] = this.shuffledTiles[source];
            this.shuffledTiles[source] = temp;
*/
            // paint the shuffled tiles
            this.switchTiles(iYPosFrom, iXPosFrom);

/*
            //keep track of empty tile
            this.emptyTile.setXpos(iXPosFrom);
            this.emptyTile.setYpos(iYPosFrom);
*/
            //this.switchTiles(this.emptyTile.getXpos(), this.emptyTile.getYpos());

            /*
            // draw empty files over from tile position
            this.draw( 'empty', iXPosFrom, iYPosFrom );
            this.gameArea[source] = false;
            this.gameArea[target] = true;
            this.emptyTile.setXpos(iXPosFrom);
            this.emptyTile.setYpos(iYPosFrom); */
        }

        if ( this.shuffleCount <= iterations ) {

            setTimeout( this.shuffleAllTiles(iterations), 10 );

            //game = this;
            //setTimeout( function() { game.runSimulation(); }, 10 );

            //setTimeout( 'this.randomShuffleAllTiles(iterations)', 10 );
        } else {
            // shuffling completed
            this.stopShuffle();

            //this.isShuffling = false;
            //blShuffleDone = true;
            //this.messageDiv.innerHTML = '';
            //this.fillTransCanvas( false );
            //this.setStatus('ready');

            alert(this.shuffleCount);
            alert('buttons!');
            // hide shuffle button, show reset button
            //document.getElementById('shuffleButton').style.display = 'none';
            // document.getElementById('resetButton').style.display = 'block';
        }
    }


};

//page load
$(window).load(
    function () {
        try {
            var info   = new InfoHandler('runtimeinfo');
            var config = new TilesConfig(400, 400, 'container');
            game       = new Tiles(config, info);
            game.createPad();

        } catch (err) {
            document.getElementById("errorinfo").innerHTML = err.message;
        }
    }
);


//attach events
$( "#container" ).bind( "click ontouchstart", function(event) {
    try { /*


        //game.selectBall(event);
        //game.checkGame(); */
    } catch(err) {
        document.getElementById("errorinfo").innerHTML = err.message;
    }
});

$( "#start" ).bind( "click ontouchstart", function(event) {
    try {
        alert('start');
        //game.start();
    } catch(err) {
        document.getElementById("errorinfo").innerHTML = err.message;
    }
});

$( "#stop" ).bind( "click ontouchstart", function(event) {
    try {
        alert('stop');
        //game.stop();
    } catch(err) {
        document.getElementById("errorinfo").innerHTML = err.message;
    }
});