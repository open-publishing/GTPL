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

print_heading('Testing: Meta');

//Real Basics
var t1,t2,t3,t4,t5,json,html;

t1 = '{template T1}{meta M1="World"}Hello{/template}';
html = 'Hello';
t_test('basic meta 1', {T1:t1},'T1',null,html);
m_test('basic meta 2', {T1:t1}, function(tm) {
	assert.equal(tm.T1.__meta__.M1, 'World');
	assert.equal(keys(tm.T1.__meta__).length, 1);
});

t1 = '{template T1}Hello{/template}';
html = 'Hello';
m_test('basic meta 3', {T1:t1}, function(tm) {
	assert.equal(keys(tm.T1.__meta__).length, 0);
});

t1 = '{template T1}{meta M1="World"}Hello{/template}';
html = 'Hello';
m_test('add_metaobject disabled', {T1:t1}, function(tm) {
	assert.equal(tm.T1.__meta__, undefined);
}, {add_metaobject:false});

t1 = '{template T1}{meta M1="World"}{__manager__.T1.__meta__.M1}{/template}';
html = 'World';
t_test('inside accessor', {T1:t1},'T1',null,html);

t1 = '{template T1}{meta M2="Welt"}{meta M1="World"}{meta M2=123}{__manager__.T1.__meta__.M1}{__manager__.T1.__meta__.M2}{/template}';
html = 'World123';
t_test('override', {T1:t1},'T1',null,html);

t1 = '{template T1}{meta M1="World \\"}{} "}{meta M2=\'Welt {}"" \'}{__manager__.T1.__meta__.M1}{__manager__.T1.__meta__.M2}{/template}';
html = 'World "}{} Welt {}"" ';
t_test('types 1 (strings)', {T1:t1},'T1',null,html);

t1 = '{template T1}{meta M1= true }{meta M2=false }{meta M3=  null}{JSON.stringify(__manager__.T1.__meta__)}{/template}';
html = '{"M1":true,"M2":false,"M3":null}';
t_test('types 2 (bool,null)', {T1:t1},'T1',null,html);

t1 = '{template T1}{meta M1= 123.45 }{meta M2= -1.23e-2 }{meta M3=-Infinity}{__manager__.T1.__meta__.M1} {__manager__.T1.__meta__.M2} {__manager__.T1.__meta__.M3}{/template}';
html = '123.45 -0.0123 -Infinity';
t_test('types 3 (numbers)', {T1:t1},'T1',null,html);

t1 = '{template T1} \t\n {meta M1=123.45 } {meta M2=null} \n ABC{/template}';
html = ' \n ABC';
t_test('whitespaces', {T1:t1},'T1',null,html);

t1 = '{template T1}ABC{meta M1="a"}{/template}';
t_throw('Syntax Error 1', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{if true}{meta M1="a"}{/if}{/template}';
t_throw('Syntax Error 2', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta}{/template}';
t_throw('Syntax Error 3', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta a=}{/template}';
t_throw('Syntax Error 4', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta a="{/template}';
t_throw('Syntax Error 5', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{meta M1="a"}{template T1}{/template}';
t_throw('Syntax Error 6', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta M1=12s}{/template}';
t_throw('Syntax Error 7', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta M1=12 3}{/template}';
t_throw('Syntax Error 8', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta AS#=12}{/template}';
t_throw('Syntax Error 9', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta M1=undefined}{/template}';
t_throw('Syntax Error 10', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta M1=[1,2,3]}{/template}';
t_throw('Syntax Error 11', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta M1={"a":1}}{/template}';
t_throw('Syntax Error 12', {T1:t1},'T1',null,gtpl.TemplateParseError);

t1 = '{template T1}{meta M1="a"=1}{/template}';
t_throw('Syntax Error 13', {T1:t1},'T1',null,gtpl.TemplateParseError);
