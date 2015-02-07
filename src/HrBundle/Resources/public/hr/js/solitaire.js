/**
 * Solitaire implementation by HR
 *
 * Created by HR on 08/02/15.
 *
 * For now: all rights reserved.
 */


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

$(window).load(
    function () {
        if ('Tests for Conways Game of Life' != document.title) {
            try {
                info   = new InfoHandler('runtimeinfo');
                config = new GolConfig(570, 570, 'container');
                game   = new GameOfLife(config, info);
                game.createPad();
            } catch (err) {
                document.getElementById("errorinfo").innerHTML = err.message;
            }
        }
    }
);