var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');

var deepCopy = gtpl.deepCopy;
var esc = gtpl.escapeHTML;
global.keys = Object.keys || function(obj) {var res = []; for(var i in obj) res.push(i); return res;};


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
s_test = this.s_test || test_suite.s_test;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: cycle');

var templ,json,html;


templ = '{cycle [1,2,3]}';
json = null;
html = '1';
e_test('cycle [1,2,3]',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle [1,2,3]}{/foreach}';
json = null;
html = '12312';
e_test('cycle [1,2,3] * 5',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle [1,2,3]}{cycle [6,7]}{/foreach}';
json = null;
html = '1627361726';
e_test('2 * cycle',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle [1,2,3]}{foreach t in [4,4,4,4]}{cycle [6,7]}{/foreach} {/foreach}';
json = null;
html = '16767 26767 36767 16767 26767 ';
e_test('nested cycle',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle _.i}{/foreach}';
json = {i:[1,2,3]};
html = '12312';
e_test('json array',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle _.i}{cycle _.i}{/foreach}';
json = {i:[1,2,3]};
html = '1122331122';
e_test('json array 2',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle keys(_)}{/foreach}';
json = {a:1,b:2,c:3};
html = 'abcab';
e_test('function evaluation',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{if 2 % n$index}{cycle _.i}{/if}{/foreach}';
json = {i:[1,2,3]};
html = '12';
e_test('with skips',templ,json,html);

templ = '{foreach n in [5,5,5,5,5]}{cycle \n \t _.cycle \n \t}{/foreach}';
json = {cycle:[1,2,3]};
html = '12312';
e_test('Obscure Syntax',templ,json,html);

templ = '{cycle null}';
json = null;
e_throw('Error: cycle null',templ,json,gtpl.TemplateNoArrayLikeError);

templ = '{cycle new Object({a:1})}';
json = null;
e_throw('Error: cycle Object',templ,json,gtpl.TemplateNoArrayLikeError);

templ = '{foreach n in [5,5,5,5,5]}{cycle \'abc\'}{/foreach}';
json = null;
e_throw('Error: cycle string',templ,json,gtpl.TemplateNoArrayLikeError);


templ = '{cycle _.a.b}';
json = {};
e_throw('TypeError',templ,json,gtpl.TemplateEvaluationError);

templ = '{cycle erga}';
e_throw('Reference Error',templ,json,gtpl.TemplateEvaluationError);

templ = '{cycle [1,2,3]}{/cycle} ';
e_throw('Syntax Error 1 (/cycle)',templ,json,gtpl.TemplateParseError);

templ = '{/cycle [1,2,3]}';
e_throw('Syntax Error 2 (/cycle)',templ,json,gtpl.TemplateParseError);

templ = '{cycle erha)}';
e_throw('Eval Error',templ,json,gtpl.TemplateParseError);
