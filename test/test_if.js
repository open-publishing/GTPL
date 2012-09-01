var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: if...elseif...else');

//Real Basics

var templ,json,html;

templ = '1{if true}2{/if}3';
json = null;
html = '123';
e_test('{if true}',templ,json,html);

templ = '1{if false}2{/if}3';
json = null;
html = '13';
e_test('{if false}',templ,json,html);

templ = '1{if 1}2{/if}3';
json = null;
html = '123';
e_test('{if 1}',templ,json,html);

templ = '1{if 0}2{/if}3';
json = null;
html = '13';
e_test('{if 0}',templ,json,html);

templ = '1{if []}2{/if}3';
json = null;
html = '123';
e_test('{if []}',templ,json,html);

templ = '1{if undefined}2{/if}3';
json = null;
html = '13';
e_test('{if undefined}',templ,json,html);

templ = '1{if null}2{/if}3';
json = null;
html = '13';
e_test('{if null}',templ,json,html);

templ = '1{if {}}2{/if}3';
json = null;
html = '123';
e_test('{if {}}',templ,json,html);

templ = '1{if false}4{elseif true}2{/if}3';
json = null;
html = '123';
e_test('{elseif true}',templ,json,html);

templ = '1{if false}4{elseif false}2{/if}3';
json = null;
html = '13';
e_test('{elseif false}',templ,json,html);

templ = '1{if false}4{elseif 1}2{/if}3';
json = null;
html = '123';
e_test('{elseif 1}',templ,json,html);

templ = '1{if false}4{elseif 0}2{/if}3';
json = null;
html = '13';
e_test('{elseif 0}',templ,json,html);

templ = '1{if false}4{elseif []}2{/if}3';
json = null;
html = '123';
e_test('{elseif []}',templ,json,html);

templ = '1{if false}4{elseif undefined}2{/if}3';
json = null;
html = '13';
e_test('{elseif undefined}',templ,json,html);

templ = '1{if false}4{elseif null}2{/if}3';
json = null;
html = '13';
e_test('{elseif null}',templ,json,html);

templ = '1{if false}4{elseif {}}2{/if}3';
json = null;
html = '123';
e_test('{elseif {}}',templ,json,html);

templ = '1{if F(true)}2{/if}3';
json = null;
html = '123';
e_test('{if F(true)}',templ,json,html);

templ = '1{if F(0)}2{/if}3';
json = null;
html = '13';
e_test('{if F(0)}',templ,json,html);

templ = '1{if false}4{elseif F(true)}2{/if}3';
json = null;
html = '123';
e_test('{elseif F(true)}',templ,json,html);

templ = '1{if false}4{elseif F(0)}2{/if}3';
json = null;
html = '13';
e_test('{elseif F(0)}',templ,json,html);

templ = '1{if _.a}2{/if}3';
json = {a:true};
html = '123';
e_test('{if _.a} true',templ,json,html);

templ = '1{if _.a}2{/if}3';
json = {a:false};
html = '13';
e_test('{if F(0)} false',templ,json,html);

templ = '1{if false}4{elseif _.a}2{/if}3';
json = {a:true};
html = '123';
e_test('{elseif _.a} true',templ,json,html);

templ = '1{if false}4{elseif _.a}2{/if}3';
json = {a:false};
html = '13';
e_test('{elseif _.a} false',templ,json,html);

templ = '1{if _.a && 1}2{/if}3';
json = {a:true};
html = '123';
e_test('{if _.a && 1} true',templ,json,html);

templ = '1{if _.a || 1}2{/if}3';
json = {a:false};
html = '123';
e_test('{if _.a || 1} false',templ,json,html);

templ = '1{if\n \t  _ . a   \t\n}2{/if  \n }3';
json = {a:1};
html = '123';
e_test('Obscure format',templ,json,html);

templ = '1{if 0}2{elseif 0}3{elseif 0}4{elseif 1}5{elseif 1}6{else}7{/if}8';
html = '158';
e_test('Nested 1',templ,json,html);

templ = '1{if 1}2{elseif 0}3{elseif 0}4{elseif 1}5{elseif 1}6{else}7{/if}8';
html = '128';
e_test('Nested 2',templ,json,html);

templ = '1{if 0}2{elseif 0}3{elseif 0}4{elseif 0}5{elseif 0}6{else}7{/if}8';
html = '178';
e_test('Nested 3',templ,json,html);

templ = '1{if 1}2{if 1}3{elseif 1}4{else}5{/if}6{elseif 1}7{if 0}8{elseif 1}9{else}a{/if}b{else}c{/if}d';
html = '1236d';
e_test('Nested 4',templ,json,html);

templ = '1{if 0}2{if 1}3{elseif 1}4{else}5{/if}6{elseif 1}7{if 0}8{elseif 1}9{else}a{/if}b{else}c{/if}d';
html = '179bd';
e_test('Nested 5',templ,json,html);

templ = '1{if 0}2{if 1}3{elseif 1}4{else}5{/if}6{elseif 0}7{if 0}8{elseif 1}9{else}a{/if}b{else}c{/if}d';
html = '1cd';
e_test('Nested 6',templ,json,html);

templ = '1{if 0}2{if 1}3{elseif 1}4{else}5{/if}6{elseif 1}7{if 0}8{elseif 1}9{if 0}a{elseif 0}b{elseif 1}c{else}d{/if}e{else}f{/if}g{elseif 1}h{else}i{/if}j';
html = '179cegj';
e_test('Nested 7 (3 level)',templ,json,html);

templ = '1{if 0}2{if 1}3{elseif 1}4{else}5{/if}6{elseif 1}7{if 0}8{elseif 1}9{if 0}a{elseif 0}b{elseif 1}c{else}de{else}f{/if}g{elseif 1}h{else}i{/if}j';
e_throw('Nested Error 1 (missing /if)',templ,json,gtpl.TemplateParseError);

templ = '1{if 0}2{if 1}3{elseif 1}4{else}5{/if}6{elseif 1}78{elseif 1}9{if 0}a{elseif 0}b{elseif 1}c{else}d{/if}e{else}f{/if}g{elseif 1}h{else}i{/if}j';
e_throw('Nested Error 2 (missing if)',templ,json,gtpl.TemplateParseError);


templ = '{if _.a.b  }{/if}';
json = {};
e_throw('TypeError',templ,json,gtpl.TemplateEvaluationError);

templ = '{if erha}{/if} ';
json = [1,'a',null,[2,3,4]];
html = ' 1,a,,2,3,4 ';
e_throw('Reference Error',templ,json,gtpl.TemplateEvaluationError);

templ = ' {if true{/if} ';
e_throw('Syntax Error 1',templ,json,gtpl.TemplateParseError);

templ = ' {if true} ';
e_throw('Syntax Error 2',templ,json,gtpl.TemplateParseError);

templ = ' {iftrue}{/if} ';
e_throw('Syntax Error 3',templ,json,gtpl.TemplateParseError);

templ = ' {elseif true}{/if} ';
e_throw('Syntax Error 4',templ,json,gtpl.TemplateParseError);

templ = ' {if true}{elseif}{/if} ';
e_throw('Syntax Error 5',templ,json,gtpl.TemplateParseError);

templ = ' {{if true}{/if} ';
e_throw('Syntax Error 6',templ,json,gtpl.TemplateParseError);

templ = ' {if true}{/iff} ';
e_throw('Syntax Error 7',templ,json,gtpl.TemplateParseError);

templ = ' {if true}{/elsif}{/if} ';
e_throw('Syntax Error 8',templ,json,gtpl.TemplateParseError);

templ = ' { if true}{/elsif}{/if} ';
e_throw('Syntax Error 9',templ,json,gtpl.TemplateParseError);

templ = ' { if true}{/elsif}{/if} ';
e_throw('Syntax Error 10',templ,json,gtpl.TemplateParseError);

templ = '{if false}{else true}{/if} ';
e_throw('Syntax Error 11',templ,json,gtpl.TemplateParseError);

templ = '{if erha)}{/if} ';
e_throw('Eval Error',templ,json,gtpl.TemplateParseError);

