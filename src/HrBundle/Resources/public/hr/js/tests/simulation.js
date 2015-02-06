
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
        assert.equal( document.getElementById( testdivA ).innerHTML, messageA );

        var messageB = "BBB";
        var infoB = new InfoHandler( testdivB );
        infoB.showInfo( messageB );
        assert.ok( infoB.getInfoDivId( testdivB ) == testdivB, "Passed!" );
        assert.equal( document.getElementById( testdivB ).innerHTML, messageB );
    }
);

//GolConfig constructor test
QUnit.test( "GolConfig construct fails due to wrong parameters",
    function( assert ) {

        assert.throws(
            function() {
                new GolConfig( 'asdf', 100, testdivA );
            },
            'Parameter width is not numeric!'
        );
        assert.throws(
            function() {
                new GolConfig( 100, 'bla', testdivA );
            },
            'Parameter height is not numeric!'
        );
    }
);

//test GameOfLife constructor test
QUnit.test( "GameOfLife construct ok",
    function( assert ) {

        var info   = new InfoHandler( testdivA );
        var config = new GolConfig( 100, 200, testdivB );
        var game   = new GameOfLife( config, info );

        assert.equal( game.getName(), 'GameOfLife' );
    }
);

//test GameOfLife constructor test
QUnit.test( "GameOfLife construct fails due to wrong parameters",
    function( assert ) {

        var info   = new InfoHandler( testdivA );
        var config = new GolConfig( 100, 200, testdivB );

        assert.throws(
            function() {
                new GameOfLife( info, config );
            },
            'Parameter config is not of type GolConfig!'
        );
    }
);

//test GameOfLife mode switch
QUnit.test( "GolConfig mode switch",
    function( assert ) {

        var config = new GolConfig( 100, 200, testdivB  );

        //verify that the default mode is 'normal'
        assert.equal( config.getMode(), 'normal' );

        //mode switch
        config.switchMode();

        //verify that the mode switch worked
        assert.equal( config.getMode(), 'torus' );

        //mode switch again
        config.switchMode();

        //verify that the mode switch worked
        assert.equal( config.getMode(), 'normal' );
    }
);

//test game of life configuraton
QUnit.test( "GameOfLife configuration",
    function( assert ) {

        var testee = new GolConfig( 100, 200, testdivB );
        var regExp = '^#(?:[0-9a-fA-F]{3}){1,2}$';

        var col     = testee.getDeadColor();
        assert.ok( (null != col.match(regExp)), 'Passed!' );

        var col     = testee.getAliveColor();
        assert.ok( (null != col.match(regExp)), 'Passed!' );

        var col     = testee.getNeutralColor();
        assert.ok( (null != col.match(regExp)), 'Passed!' );

        assert.ok( (0 < testee.getLeftOffset()), 'Passed!' );
        assert.ok( (0 < testee.getTopOffset()), 'Passed!' );

        assert.equal( testee.getColumnCnt(), 6 );
        assert.equal( testee.getRowCnt(), 15 );

        assert.equal( testee.getName(), 'GolConfig' );

    }
);

//test canvas creation
QUnit.test( "GameOfLife canvas creation fails",
    function( assert ) {

        var info   = new InfoHandler( testdivA );
        var config = new GolConfig( 100, 200, '' );
        var game   = new GameOfLife( config, info );

        assert.throws(
            function() {
                var test = game.getCanvas();
            },
            'Parameter config is not of type GolConfig!'
        );
    }
);

//test canvas creation
QUnit.test( "GameOfLife canvas creation ok",
    function( assert ) {

        var info   = new InfoHandler( testdivA );
        var config = new GolConfig( 100, 200, testdivB );
        var game   = new GameOfLife( config, info );

        var canvas = game.getCanvas();
        assert.equal( canvas.id, config.getCanvasId() );
    }
);