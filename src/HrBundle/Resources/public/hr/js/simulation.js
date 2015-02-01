/*
* Conways Game of Life implementation by HR
* Last change 2015-01-31 by HR
*
* For now: all rights reserved.
 */


function gameoflife()
{

    // set the border mode, default is normal (dead cells outside)
    function changeMode()
    {
        var mode = gol_parameters('sMode');
        if ( 'torus' == mode) {
            mode = 'normal';
        } else {
            mode = 'torus'
        }
        //showInfo( currentState );
    }

    //following code is executed when function is called
    //reset();
    return this;
}

//status information
function InfoHandler( infodivname )
{
    this.infodiv = document.getElementById( infodivname );
    if ( ! this.infodiv instanceof HTMLDivElement ) {
        throw "Cannot access infodiv!"
    }

    //show status information
    this.showInfo = function showInfo( message )
    {
        //alert( this.infodiv.id)
        this.infodiv.innerHTML = message;
    }

    this.getInfoDivId = function getInfoDivId()
    {
        return this.infodiv.id;
    }
}

/*
//show status information
InfoHandler.prototype.showInfo = function showInfo( message )
{
    this.infodiv.innerHTML = message;
}
*/


$( window ).load(
    function() {
        try {
            var game = gameoflife();

            var info = new InfoHandler( 'runtimeinfo' );
            info.showInfo( 'asdfasdf' );

            var moreinfo = new InfoHandler( 'subinfo' );
            info.showInfo( 'xxxxxx' );

            //game.createPad(100, 200);
            //game.changeMode();
        }
        catch(err) {
            document.getElementById("runtimeinfo").innerHTML = err.message;
        }
    }
)
