var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');

var deepCopy = gtpl.deepCopy;
var esc = gtpl.escapeHTML;
var keys = Object.keys || function(obj) {var res = []; for(var i in obj) res.push(i); return res;};


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
s_test = this.s_test || test_suite.s_test;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: Copy & Escape');

//primitives copy
s_test('primitives copy',function() {
    assert.strictEqual( deepCopy('abc')     , 'abc' );
    assert.strictEqual( deepCopy(123)       , 123 );
    assert.strictEqual( deepCopy(null)      , null );
    assert.strictEqual( deepCopy(undefined) , undefined );
});

//function copy: right now, functions are referenced
s_test('function copy',function() {
        function f() {}
        function g() {}

        assert.equal    ( deepCopy(f) , f );
        assert.notEqual ( deepCopy(f) , g );
});


//Array Tests
s_test('Array copy',function() {
        var a1 = [1,2,3];
        var a2 = ['a',null,7,a1];
        var a2_copy = a2;

        assert.notEqual ( deepCopy(a1)           , a1 );
        assert.equal    ( deepCopy(a1).length    , 3 );
        assert.equal    ( deepCopy(a2)[3].length , 3 );
        assert.notEqual ( deepCopy(a2)[3]        , a2[3] );
        assert.equal    ( deepCopy(a2)[3][1]     , 2 );
        assert.strictEqual ( a2     , a2_copy );
});

//Object Tests
s_test('Object copy',function() {
        var a3 = [1,2,3];
        var o1 = {e:1,f:2};
        var o2 = {a:1,b:'2',c:null,d:o1,e:a3};

        assert.equal ( keys(deepCopy(o2)).length , 5 );
        assert.equal ( deepCopy(o2).d.e , 1 );

        //Objects still original
        assert.equal ( keys(o1).length , 2 );
        assert.equal ( keys(o2).length , 5 );
        assert.equal ( a3.length , 3 );
});

//Type consistency
s_test('type consistency',function() {
    function T() { this.n = 123;}
    T.prototype = new Object();
    T.prototype.constructor = T;

    // fails: assert.ok ( deepCopy(new T()) instanceof T );
    assert.ok ( deepCopy(new T()).constructor === T );
});


// Recursion avoidance
s_test('recursion avoidance',function() {
    var r1 = {a:3};
    r1.b = r1;
    r1.c = [r1,r1,r1];
    var r2 = deepCopy(r1);

    var r3 = {c:r1}; //Two step recursion
    r1.d = r3;
    var r4 = deepCopy(r3);

    assert.equal ( r2.b.b.b.a , 3, 'recursive_test1 failed');
    assert.equal ( keys(r1).length , 4, 'recursive_test2 failed' );
    assert.equal ( keys(r1.b.b.b).length , 4, 'recursive_test3 failed' );
    assert.strictEqual ( r1.b.b.b , r1, 'recursive_test4 failed' );
    assert.strictEqual ( r2.b.b.b , r2, 'recursive_test5 failed' );
    assert.notEqual ( r2.b.b.b , r1, 'recursive_test6 failed' );
    assert.equal ( keys(r2).length , 3, 'recursive_test7 failed' );
    assert.equal ( keys(r2.b.b.b).length , 3, 'recursive_test8 failed' );
    assert.equal ( r3.c.d.c.d , r3, 'recursive_test9 failed' );
    assert.strictEqual ( r4.c.d.c.d , r4, 'recursive_test10 failed' );
    assert.notEqual ( r4.c.d.c.d , r3, 'recursive_test11 failed' );
});


//HTML Escaping
s_test('HTML Escaping',function() {
    var s1='&><"\' abc';
    var s2='&amp;&gt;&lt;&quot;&#39; abc';
    var os1 = {a:s1,b:[s1]};

    assert.equal ( deepCopy(s1,esc), s2 );
    assert.equal ( deepCopy(os1.a,esc), s2 );
    assert.equal ( deepCopy(os1.b[0],esc), s2 );
    assert.equal ( os1.a, s1 );
});
