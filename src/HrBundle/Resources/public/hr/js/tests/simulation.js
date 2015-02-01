
var testdivA = 'for-qunit-tests-A';
var testdivB = 'for-qunit-tests-B';

QUnit.module( "module simulation", {
    beforeEach: function () {
        document.getElementById(testdivA).innerHTML = "";
        document.getElementById(testdivB).innerHTML = "";
    },
    afterEach: function () {
        document.getElementById(testdivA).innerHTML = "";
        document.getElementById(testdivB).innerHTML = "";
    }
});

//test InfoHandler message set
QUnit.test( "InfoHandler set message",
    function( assert ) {

        var messageA = "AAA";
        var infoA = new InfoHandler( testdivA );
        infoA.showInfo( messageA );
        assert.ok( infoA.getInfoDivId( testdivA ) == testdivA, "Passed!" );
        assert.equal( messageA, document.getElementById( testdivA ).innerHTML );

        var messageB = "BBB";
        var infoB = new InfoHandler( testdivB );
        infoB.showInfo( messageB );
        assert.ok( infoB.getInfoDivId( testdivB ) == testdivB, "Passed!" );
        assert.equal( messageB, document.getElementById( testdivB ).innerHTML );
    }
);

//test GameOfLife mode switch
QUnit.test( "GameOfLife mode switch",
    function( assert ) {

        var info = new InfoHandler( testdivA );
        var game = new GameOfLife( info );

        //verify that the default mode is 'normal'
        var start = game.getMode();
        assert.equal( 'normal', start );

        //mode switch
        game.switchMode();

        //verify that the mode switch worked
        var end = game.getMode();
        assert.equal( 'torus', end );
    }
);
