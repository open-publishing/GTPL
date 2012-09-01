var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');

var deepCopy = gtpl.deepCopy;
var esc = gtpl.escapeHTML;


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
s_test = this.s_test || test_suite.s_test;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: literal');

var templ,json,html;


templ = '{literal}{}{/literal}';
json = null;
html = '{}';
e_test('basic {}',templ,json,html);

templ = '{literal}{literal}{if true}{foreach n in [1,2,3]}{template ABC}{call ABC root=_}{cycle}{/if}{/foreach}{rdelim}{ldelim}{/template}{/literal}';
json = null;
html = '{literal}{if true}{foreach n in [1,2,3]}{template ABC}{call ABC root=_}{cycle}{/if}{/foreach}{rdelim}{ldelim}{/template}';
e_test('embedded Instructions',templ,json,html);

templ = '{ldelim}{rdelim}';
json = null;
html = '{}';
e_test('ldelim, rdelim',templ,json,html);


templ = '{literal \n }{}{/literal\t}';
json = null;
html = '{}';
e_test('Obscure Syntax 1',templ,json,html);

templ = '{ldelim \n }{rdelim\t}';
json = null;
html = '{}';
e_test('Obscure Syntax 2',templ,json,html);

templ = '{literal}{literal}{/literal}';
json = null;
html= '{literal}';
e_test('Nested literal',templ,json,html);

templ = '{literal}';
json = null;
e_throw('Syntax Error 1',templ,json,gtpl.TemplateParseError);

templ = '{/literal}';
json = null;
e_throw('Syntax Error 2',templ,json,gtpl.TemplateParseError);

templ = '{literal true}{/literal}';
json = null;
e_throw('Syntax Error 3',templ,json,gtpl.TemplateParseError);

templ = '{literal}{/literal true}';
json = null;
e_throw('Syntax Error 4',templ,json,gtpl.TemplateParseError);

templ = '{rdelim true}';
json = null;
e_throw('Syntax Error 5',templ,json,gtpl.TemplateParseError);

templ = '{ldelim true}';
json = null;
e_throw('Syntax Error 6',templ,json,gtpl.TemplateParseError);

templ = '{rdelim}{/rdelim}';
json = null;
e_throw('Syntax Error 7',templ,json,gtpl.TemplateParseError);

templ = '{ldelim}{/ldelim}';
json = null;
e_throw('Syntax Error 8',templ,json,gtpl.TemplateParseError);

templ = '{literal}{/literal}{/literal}';
json = null;
e_throw('Syntax Error 9',templ,json,gtpl.TemplateParseError);

templ = '{literal}{literal}{/literal}{/literal}';
json = null;
e_throw('Syntax Error 10',templ,json,gtpl.TemplateParseError);

