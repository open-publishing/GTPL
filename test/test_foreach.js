var assert= assert || require('assert');
var gtpl= gtpl || require('../lib/gtpl');
var test_suite = test_suite || require('./test_suite.js');

var deepCopy = gtpl.deepCopy;
var esc = gtpl.escapeHTML;


e_test = this.e_test || test_suite.e_test;
e_throw = this.e_throw || test_suite.e_throw;
s_test = this.s_test || test_suite.s_test;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: foreach');

var templ,json,html;


templ = '{foreach $n in [1,2,3]}{$n}{/foreach}';
json = null;
html = '123';
e_test('{foreach $n in [1,2,3]}',templ,json,html);

templ = '{_.n}x{foreach $n in _.n}{$n}{_.n}{/foreach}x{_.n}';
json = {n:[1,2,3]};
html = '1,2,3x11,2,321,2,331,2,3x1,2,3';
e_test('{foreach n in _.n}',templ,json,html);

templ = '{foreach $n in _.n}{$n}X{ifempty}Y{/foreach}';
json = {n:[]};
html = 'Y';
e_test('{ifempty}',templ,json,html);

templ = '{foreach n in _.map(function(i){return i+1;})}{n}{/foreach}';
json = [1,2,3];
html = '234';
e_test('{foreach n in _.map(...)}',templ,json,html);

templ = '{foreach n in _.slice(-2)}{n}{/foreach}';
json = [1,2,3];
html = '23';
e_test('{foreach n in _.slice(-2)}',templ,json,html);

templ = '{foreach n in [1,2,3]}{n$index}{/foreach}';
json = null;
html = '012';
e_test('n$index',templ,json,html);

templ = '{foreach n in [1,2,3]}{n$first}{/foreach}';
json = null;
html = 'truefalsefalse';
e_test('n$first',templ,json,html);

templ = '{foreach n in [1,2,3]}{n$last}{/foreach}';
json = null;
html = 'falsefalsetrue';
e_test('n$last',templ,json,html);

templ = '{foreach n in [1,2,3]}{n$length}{/foreach}';
json = null;
html = '333';
e_test('n$length',templ,json,html);

templ = '{foreach n in [1,2,3]}{n}{continue}{n}{/foreach}';
json = null;
html = '123';
e_test('continue',templ,json,html);

templ = '{foreach n in [1,2,3]}{n}{break}{n}{/foreach}';
json = null;
html = '1';
e_test('break',templ,json,html);

templ = '{foreach _ in $}{_}{/foreach}';
json = [1,2,3];
html = '123';
e_test('Root Designator',templ,json,html,{root_designator:'$'});

templ = 'x{foreach\n \t  n   in\t_ . a   \n}{ \t n }{continue  }Y{break  }{/foreach  \n }x';
json = {a:[1,2,3]};
html = 'x123x';
e_test('Obscure format',templ,json,html);

templ = '{foreach a in _.a}{foreach b in a}{a$length}{a$first}{b$last}{a[0]}{b}{/foreach}{/foreach}';
json = {a:[[1,2,3,4],["a","b","c"],[]]};
html = '3truefalse113truefalse123truefalse133truetrue143falsefalseaa3falsefalseab3falsetrueac';
e_test('Nested 1',templ,json,html);

templ = '{foreach a in _}{foreach b in a}b{ifempty}B{/foreach}{ifempty}A{/foreach}';
json = [];
html = 'A';
e_test('Nested 2 (ifempty)',templ,json,html);

templ = '{foreach a in _}{foreach b in a}b{ifempty}B{/foreach}{ifempty}A{/foreach}';
json = [[],[1,2,3]];
html = 'Bbbb';
e_test('Nested 3 (ifempty)',templ,json,html);

templ = '{foreach a in _}l1:{a$length} {foreach b in a}l2:{a$length}{b$length} {foreach c in b}l3:{a$length}{b$length}{c$length} {ifempty}l3:E {/foreach}{ifempty}l2:E {/foreach}{ifempty}l1:E {/foreach}';
json = [[[1,2,3]],[]];
html = 'l1:2 l2:21 l3:213 l3:213 l3:213 l1:2 l2:E ';
e_test('Nested 4 (3 levels)',templ,json,html);

templ = '{foreach a in _}{foreach b in a}{b}{continue}X{/foreach}Y{continue}Z{/foreach}';
json = [[1,2,3],[4,5,6]];
html = '123Y456Y';
e_test('Nested 5 (continue)',templ,json,html);

templ = '{foreach a in _}{foreach b in a}{b}{break}X{/foreach}Y{break}Z{/foreach}';
json = [[1,2,3],[4,5,6]];
html = '1Y';
e_test('Nested 6 (break)',templ,json,html);

// test continue, break in {apply}

templ = '{foreach a in [1,2,3]}{foreach b in [4,5,6]}{ifempty}{ifempty}{/foreach}';
e_throw('Nested Error 1 (missing /foreach)',templ,json,gtpl.TemplateParseError);

templ = '{foreach a in [1,2,3]}{ifempty}{/foreach}{ifempty}{/foreach}';
e_throw('Nested Error 2 (missing foreach)',templ,json,gtpl.TemplateParseError);

templ = '{foreach _.a.b  }{/foreach}';
json = {};
e_throw('Syntax Error',templ,json,gtpl.TemplateParseError);

templ = '{foreach errrg in erga}{/foreach} ';
e_throw('Reference Error',templ,json,gtpl.TemplateEvaluationError);

templ = '{foreach [1,2,3]}{/foreach} ';
e_throw('Syntax Error 1 (missing "as...")',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in}{/foreach} ';
e_throw('Syntax Error 2 (only "as...")',templ,json,gtpl.TemplateParseError);

templ = '{foreach nin [1,2,3]}{/foreach} ';
e_throw('Syntax Error 3',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in[1,2,3]}{/foreach} ';
e_throw('Syntax Error 4',templ,json,gtpl.TemplateParseError);

templ = '{foreachn in [1,2,3]}{/foreach} ';
e_throw('Syntax Error 5',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in [1,2,3]}';
e_throw('Syntax Error 6',templ,json,gtpl.TemplateParseError);

templ = '{ifempty}';
e_throw('Syntax Error 7',templ,json,gtpl.TemplateParseError);

templ = '{ifempty}{/foreach}';
e_throw('Syntax Error 8',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in [1,2,3]}{ifempty true}{/foreach}';
e_throw('Syntax Error 9',templ,json,gtpl.TemplateParseError);

templ = '{continue}';
e_throw('Syntax Error 10',templ,json,gtpl.TemplateParseError);

templ = '{break}';
e_throw('Syntax Error 11',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in [1,2,3]}{ifempty}{continue}{/foreach}';
e_throw('Syntax Error 12',templ,json,gtpl.TemplateParseError);

templ = '{foreach n  in [1,2,3]}{ifempty}{break}{/foreach}';
e_throw('Syntax Error 13',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in [1,2,3]}{continue true}{/foreach}';
e_throw('Syntax Error 14',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in [1,2,3]}{break true}{/foreach}';
e_throw('Syntax Error 15',templ,json,gtpl.TemplateParseError);

templ = '{foreach _ctx in [1,2,3]}{/foreach}';
e_throw('Syntax Error 16',templ,json,gtpl.TemplateParseError);

templ = '{foreach $ in [1,2,3]}{/foreach}';
e_throw('Syntax Error 17',templ,json,gtpl.TemplateParseError,{root_designator:'$'});

templ = '{foreach in in [1,2,3]}{/foreach}';
e_throw('Forbidden Keyword Error 1',templ,json,gtpl.TemplateParseError);

templ = '{foreach import in [1,2,3]}{/foreach}';
e_throw('Forbidden Keyword Error 2',templ,json,gtpl.TemplateParseError);

templ = '{foreach foreach in [1,2,3]}{/foreach}';
e_throw('Forbidden Keyword Error 3',templ,json,gtpl.TemplateParseError);

templ = '{foreach literal in [1,2,3]}{/foreach}';
e_throw('Forbidden Keyword Error 4',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in [1,2,3]}{n}{/foreach}{n}';
e_throw('Scope Error 1',templ,json,gtpl.TemplateEvaluationError);

templ = '{foreach n in [4,5,6]}{n}{foreach m in [1,2,3]}{n}{/foreach}{m}{/foreach}';
e_throw('Scope Error 2',templ,json,gtpl.TemplateEvaluationError);

templ = '{foreach n in [4,5,6]}{n}{foreach m in [1,2,3]}{break}{/foreach}{m}{/foreach}';
e_throw('Scope Error 3',templ,json,gtpl.TemplateEvaluationError);

templ = '{foreach a in _.a}{foreach a in a}{/foreach}{/foreach}';
e_throw('Shadow Error 1',templ,json,gtpl.TemplateParseError);

templ = '{foreach a in _.a}{foreach b in a}{foreach a in b}{/foreach}{/foreach}{/foreach}';
e_throw('Shadow Error 2',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in erha)}{/foreach} ';
e_throw('Eval Error',templ,json,gtpl.TemplateParseError);

templ = '{foreach n in new Object({a:1,b:2})}{n}{ifempty}Y{/foreach}{n}';
e_throw('NonArray Error 1',templ,json,gtpl.TemplateNoArrayLikeError);

templ = '{foreach n in null}{n}{ifempty}Y{/foreach}';  //todo: null erlauben??
e_throw('NonArray Error 2',templ,json,gtpl.TemplateNoArrayLikeError);

templ = '{foreach n in "abc"}1{n}{/foreach}';
e_throw('NonArray Error 3',templ,json,gtpl.TemplateNoArrayLikeError);
