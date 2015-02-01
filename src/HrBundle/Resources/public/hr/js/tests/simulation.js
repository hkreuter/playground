
//dummy assert
QUnit.test( "dummy test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});


QUnit.test( "InfoHandler test", function( assert ) {

    var testdiv = 'for-qunit-tests-A';
    var info = new InfoHandler( 'for-qunit-tests-A' );

    assert.ok( info.getInfoDivId( testdiv ) == testdiv, "Passed!" );
});