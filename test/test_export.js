var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');

var keys = Object.keys || function(obj) {var res = []; for(var i in obj) res.push(i); return res;};


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
s_test = this.s_test || test_suite.s_test;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: Export & Import');

s_test('basic export & import',function() {
    var tm1 = gtpl.create_template_manager();
    var tm2 = gtpl.create_template_manager();

    tm1.add('{template A}123{/template}');

    assert.strictEqual( tm1.A() , '123');
    assert.throws( function(){tm2.A()} , TypeError);

    var s;

    assert.doesNotThrow( function() {s = tm1.export_templates('A');});
    assert.doesNotThrow( function() {tm2.import_templates(s);});

    assert.strictEqual( tm2.A() , '123');
    assert.notStrictEqual( tm1.A , tm2.A);
});

s_test('namespace export & import',function() {
    var tm1 = gtpl.create_template_manager();
    var tm2 = gtpl.create_template_manager();

    tm1.add('{template A.B}123{/template}{template A.C}456{/template}{template D.E}777{/template}');

    assert.strictEqual( tm1.A.B() , '123');
    assert.strictEqual( tm1.D.E() , '777');
    assert.throws( function(){tm2.A.B()} , TypeError);

    var s;

    assert.doesNotThrow( function() {s = tm1.export_templates('A');});
    assert.doesNotThrow( function() {tm2.import_templates(s);});

    assert.strictEqual( tm2.A.B() , '123');
    assert.strictEqual( tm2.A.C() , '456');
    assert.throws( function(){tm2.D.E()} , TypeError);
    assert.notStrictEqual( tm1.A , tm2.A);
    assert.notStrictEqual( tm1.A.B , tm2.A.B);
});

s_test('full export & import',function() {
    var tm1 = gtpl.create_template_manager();
    var tm2 = gtpl.create_template_manager();

    tm1.add('{template A.B}123{/template}{template A.C}456{/template}{template D.E}777{/template}');

    assert.strictEqual( tm1.A.B() , '123');
    assert.strictEqual( tm1.D.E() , '777');
    assert.throws( function(){tm2.A.B()} , TypeError);

    var s;

    assert.doesNotThrow( function() {s = tm1.export_templates();});
    assert.doesNotThrow( function() {tm2.import_templates(s);});

    assert.strictEqual( tm2.A.B() , '123');
    assert.strictEqual( tm2.A.C() , '456');
    assert.strictEqual( tm2.D.E() , '777');
    assert.notStrictEqual( tm1.A , tm2.A);
    assert.notStrictEqual( tm1.A.B , tm2.A.B);
    assert.notStrictEqual( tm1.D.E , tm2.D.E);
});

s_test('with call',function() {
    var tm1 = gtpl.create_template_manager();
    var tm2 = gtpl.create_template_manager();

    tm1.add('{template A.B}123{/template}{template A.C}{call A.B root=null}{/template}');

    assert.strictEqual( tm1.A.C() , '123');
    assert.throws( function(){tm2.A.B()} , TypeError);

    var s;

    assert.doesNotThrow( function() {s = tm1.export_templates('A');});
    assert.doesNotThrow( function() {tm2.import_templates(s);});

    assert.strictEqual( tm2.A.C() , '123');
});

s_test('w/ custom namespace',function() {
    var NS = {F1:function(){return '123'}, S2: 'aaa'};
    var NS2 = {F2:function(){return '000'}, S2: 'abc'};
    var tm1 = gtpl.create_template_manager(null,[NS,NS2]);
    var tm2 = gtpl.create_template_manager(null,[NS,NS2]);
    var tm3 = gtpl.create_template_manager();

    tm1.add('{template A.B}{F1()}{S2}{F2()}{/template}');

    assert.strictEqual( tm1.A.B() , '123abc000');

    var s;
    assert.doesNotThrow( function() {s = tm1.export_templates('A');});
    assert.doesNotThrow( function() {tm2.import_templates(s);});
    assert.doesNotThrow( function() {tm3.import_templates(s);});

    assert.strictEqual( tm2.A.B() , '123abc000');
    assert.throws( function(){tm3.A.B()} , ReferenceError);
});

s_test('Export Error',function() {
    var tm1 = gtpl.create_template_manager();

    tm1.add('{template A.B}{F1()}{/template}');
    assert.throws( function(){tm1.export_templates('B')} , gtpl.TemplateNamespaceError);
});

s_test('Overwrite Error',function() {
    var tm1 = gtpl.create_template_manager(null);
    var tm2 = gtpl.create_template_manager({overwrite_namespaces:true,overwrite_templates:true});
    var tm3 = gtpl.create_template_manager();

    tm1.add('{template A.B}{F1()}{/template}');

    var s;
    assert.doesNotThrow( function() {s = tm1.export_templates('A');});
    assert.doesNotThrow( function() {tm2.import_templates(s);});
    assert.doesNotThrow( function() {tm3.import_templates(s);});

    assert.doesNotThrow( function() {tm2.import_templates(s);});
    assert.throws( function() {tm3.import_templates(s);}, gtpl.TemplateNamespaceError);

    assert.doesNotThrow( function() {s = tm1.export_templates('A.B');});
    assert.doesNotThrow( function() {tm2.import_templates(s);});
    assert.throws( function() {tm3.import_templates(s);}, gtpl.TemplateNamespaceError);
});

s_test('export meta',function() {
    var tm1 = gtpl.create_template_manager();
    var tm2 = gtpl.create_template_manager();

    tm1.add('{template A.B}{meta M1="abc"}{/template}');

    assert.strictEqual( tm1.A.B.__meta__.M1 , 'abc');
    var s;

    assert.doesNotThrow( function() {s = tm1.export_templates();});
    assert.doesNotThrow( function() {tm2.import_templates(s);});

    assert.strictEqual( tm2.A.B.__meta__.M1 , 'abc');
});
