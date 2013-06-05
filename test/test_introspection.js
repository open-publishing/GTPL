var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');

var deepCopy = gtpl.deepCopy;
var esc = gtpl.escapeHTML;
global.keys = Object.keys || function(obj) {var res = []; for(var i in obj) res.push(i); return res;};


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
s_test = this.s_test || test_suite.s_test;
t_test = this.t_test || test_suite.t_test;
m_test = this.m_test || test_suite.m_test;
t_throw = this.t_throw || test_suite.t_throw;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: Introspection');

//Real Basics
var t1,t2,t3,t4,t5,json,html;

t1 = '{template T1}Hello{/template}';
html = 'Hello';
t_test('names introspection 1', {T1:t1},'T1',null,html, {introspection_mode:'names'});
m_test('names introspection 2', {T1:t1}, function(tm) {
	assert.equal(tm.T1.__self__.name, 'T1');
	assert.equal(tm.T1.__self__.namespace, '');
	assert.equal(keys(tm.T1.__self__).length, 2);
}, {introspection_mode:'names'});

t1 = '{namespace N1.N2}{template .T1.T2}Hello{/template}';
html = 'Hello';
t_test('names introspection 3', {T1:t1},'N1.N2.T1.T2',null,html, {introspection_mode:'names'});
m_test('names introspection 4', {T1:t1}, function(tm) {
	assert.equal(tm.N1.N2.T1.T2.__self__.name, 'N1.N2.T1.T2');
	assert.equal(tm.N1.N2.T1.T2.__self__.namespace, 'N1.N2');
	assert.equal(keys(tm.N1.N2.T1.T2.__self__).length, 2);
}, {introspection_mode:'names'});

t1 = '{namespace N1}{template .T1}name: "{__manager__.N1.T1.__self__.name}", namespace: "{__manager__.N1.T1.__self__.namespace}"{/template}';
html = 'name: "N1.T1", namespace: "N1"';
t_test('inside accessor', {T1:t1},'N1.T1',null,html, {introspection_mode:'names'});


t1 = '{namespace N1} {template .T1}Hello{/template}  ';
html = 'Hello';
t_test('full introspection 1', {T1:t1},'N1.T1',null,html, {introspection_mode:'full'});
m_test('full introspection 2', {T1:t1}, function(tm) {
	assert.equal(tm.N1.T1.__self__.name, 'N1.T1');
	assert.equal(tm.N1.T1.__self__.namespace, 'N1');
	assert.equal(tm.N1.T1.__self__.source, 'T1');
	assert.equal(tm.N1.T1.__self__.pos_start, 15);
	assert.equal(tm.N1.T1.__self__.pos_end, 45);
	assert.equal(tm.N1.T1.__self__.line_start, 1);
	assert.equal(tm.N1.T1.__self__.line_end, 1);
	assert.equal(tm.N1.T1.__self__.code, t1);
	assert.equal(keys(tm.N1.T1.__self__).length, 8);
}, {introspection_mode:'full'});