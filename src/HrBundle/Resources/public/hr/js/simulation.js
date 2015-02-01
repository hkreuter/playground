/*
* Conways Game of Life implementation by HR
* Last change 2015-01-31 by HR
*
* For now: all rights reserved.
 */


function GameOfLife( infoHandler ) {

    this.mode = 'normal';
    var info = infoHandler;


    // set the border mode, default is normal (dead cells outside)
    this.switchMode = function() {
        if ( 'torus' == this.mode) {
            this.mode = 'normal';
        } else {
            this.mode = 'torus'
        }
    };

    this.getMode = function() {
        return this.mode;
    }

    //following code is executed when function is called
    //reset();
    return this;
}

//status information
function InfoHandler( infodivname ) {
    this.infodiv = document.getElementById( infodivname );
    if ( ! this.infodiv instanceof HTMLDivElement ) {
        throw "Cannot access infodiv!"
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
                var info = new InfoHandler( 'runtimeinfo' );
                var game = new GameOfLife( info );


                //game.createPad(100, 200);
                //game.changeMode();
            }
            catch(err) {
                document.getElementById("runtimeinfo").innerHTML = err.message;
            }
        }
    }
)
