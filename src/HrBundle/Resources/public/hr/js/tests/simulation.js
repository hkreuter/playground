
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
        assert.equal( 'normal', game.getMode() );

        //mode switch
        game.switchMode();

        //verify that the mode switch worked
        assert.equal( 'torus', game.getMode() );

        //mode switch again
        game.switchMode();

        //verify that the mode switch worked
        assert.equal( 'normal', game.getMode() );
    }
);

//test game of life configuraton
QUnit.test( "GameOfLife configuration",
    function( assert ) {

        var testee = new GolConfig();
        var regExp = '^#(?:[0-9a-fA-F]{3}){1,2}$';

        var col     = testee.getDeadColor();
        var matched = col.match(regExp);
        assert.ok( (null != matched), 'Passed!' );

        var col     = testee.getAliveColor();
        var matched = col.match(regExp);
        assert.ok( (null != matched), 'Passed!' );

        var col     = testee.getNeutralColor();
        var matched = col.match(regExp);
        assert.ok( (null != matched), 'Passed!' );

        assert.ok( (0 < testee.getLeftOffset()), 'Passed!' );
        assert.ok( (0 < testee.getTopOffset()), 'Passed!' );

        var res = testee.getColumnCnt( 295);
        assert.equal( 22, res );

        var res = testee.getRowCnt( 295 );
        assert.equal( 22, res );

    }
);