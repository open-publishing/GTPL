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
t_throw = this.t_throw || test_suite.t_throw;
print_heading = this.print_heading || test_suite.print_heading;

print_heading('Testing: Multitemplates');

//Real Basics
var t1,t2,t3,t4,t5,json,html;

t1 = '{template T1}Hello{/template}';
json = null;
html = 'Hello';
t_test('basic template', {T1:t1},'T1',json,html);

t1 = '{*Comment*}{template T1}Hello{*inline comment*}{/template}{*comment*}';
json = null;
html = 'Hello';
t_test('comment', {T1:t1},'T1',json,html);

t1 = '   {template T1}Hello{/template} ';
json = null;
html = 'Hello';
t_test('whitespace', {T1:t1},'T1',json,html);

t1 = '{template T1.U1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Subtemplate', {T1:t1},'T1.U1',json,html);

t1 = '{template T1.U1.UU1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Subsubtemplate', {T1:t1},'T1.U1.UU1',json,html);

t1 = '{namespace T1}{template .U1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Namespace 1', {T1:t1},'T1.U1',json,html);

t1 = '{namespace T1.U1}{template .UU1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Namespace 2', {T1:t1},'T1.U1.UU1',json,html);

t1 = '{namespace T1}{template .U1.UU1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Namespace 3', {T1:t1},'T1.U1.UU1',json,html);

t1 = '{namespace UNKNOWN}{namespace T1}{template .U1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Namespace 4', {T1:t1},'T1.U1',json,html);

t1 = '{namespace T2}{template T1.U1}Hello{/template}';
json = null;
html = 'Hello';
t_test('Namespace 5', {T1:t1},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}Hello{/template}{namespace T2}{template .U1}Hello2{/template}';
json = null;
t_test('Namespace 6.1', {T1:t1},'T1.U1',json,'Hello');
t_test('Namespace 6.2', {T1:t1},'T2.U1',json,'Hello2');

t1 = '{namespace T1}{template .U1}{call .U2 root=_}{/template}{template .U2}Hello{/template}';
json = null;
html = 'Hello';
t_test('Call 1', {T1:t1},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{call T1.U2 root=_}{/template}{template .U2}Hello{/template}';
json = null;
html = 'Hello';
t_test('Call 2', {T1:t1},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{call .U2 root=_}{/template}';
t2 = '{namespace T1}{template .U2}Hello{/template}';
json = null;
html = 'Hello';
t_test('Call 3', {T1:t1,T2:t2},'T1.U1',json,html);


t1 = '{namespace T1}{template .U1}{Call T2.U2 root=_}{container C=.U3}{/Call}{/template}{template .U3}Hello{/template}';
t2 = '{template T2.U2}{yield C root=_}{/template}';
json = null;
html = 'Hello';
t_test('Yield 1', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{Call .U2 root=_}{container C=.U3}{/Call}{/template}';
t2 = '{namespace T1}{template .U2}{yield C root=_}{/template}{template .U3}Hello{/template}';
json = null;
html = 'Hello';
t_test('Yield 2', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{Call T2.U2 root=_}{container C=T2.U3}{/Call}{/template}';
t2 = '{namespace T2}{template .U2}{yield C root=_}{/template}{template .U3}Hello{/template}';
json = null;
html = 'Hello';
t_test('Yield 3', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{Call T2.U2 root=_}{container C=.U3}{/Call}{/template}';
t2 = '{namespace T2}{template .U2}{yield C root=_}{/template}{namespace T1}{template .U3}Hello{/template}';
json = null;
html = 'Hello';
t_test('Yield 4', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{Call T2.U2 root=_}{container C=.U3}{/Call}{/template}{namespace T1}{template .U3}x{yield C root=_}x{/template}';
t2 = '{namespace T2}{template .U2}{Yield C root=_}{container C=.U3}{/Yield}{/template}{template .U3}Hello{/template}';
json = null;
html = 'xHellox';
t_test('Yield 5', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{Call T2.U2 root=_}{container C=.U3}{/Call}{/template}{template .U3}Hello{/template}';
t2 = '{template T2.U2}{yield D fallback=T1.U3 root=_}{/template}';
json = null;
html = 'Hello';
t_test('Yield 6', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = '{namespace T1}{template .U1}{Call T2.U2 root=_}{/Call}{/template}';
t2 = '{namespace T2}{template T2.U2}{yield D fallback=.U3 root=_}{/template}{template .U3}Hello{/template}';
json = null;
html = 'Hello';
t_test('Yield 7', {T1:t1,T2:t2},'T1.U1',json,html);

t1 = ' \n {namespace\t \n __ \n}{template\t\n \t\n.__\t\n}Hello{/template}\n\t';
json = null;
html = 'Hello';
t_test('Obscure Syntax 1', {T1:t1},'__.__',json,html);

t1 = ' \n {namespace\t \n __.__ \n}{template\t\n \t\n__.__123\t\n}Hello{/template}\n\t';
json = null;
html = 'Hello';
t_test('Obscure Syntax 2', {T1:t1},'__.__123',json,html);

////////////////// NamespaceErrors

t1='{template U1}0{/template}{template U1}Hello{/template}';
json=null;
html='Hello';
t_test('Namespace Overwrite 1', {T1:t1},'U1',json,html,{overwrite_templates:true});

t1='{namespace T1}{template .U1}0{/template}{template .U1}Hello{/template}';
json=null;
html='Hello';
t_test('Namespace Overwrite 2', {T1:t1},'T1.U1',json,html,{overwrite_templates:true});

t1='{template U1}0{/template}{template U1.UU1}Hello{/template}';
json=null;
html='Hello';
t_test('Namespace Overwrite 3', {T1:t1},'U1.UU1',json,html,{overwrite_namespaces:true});

t1='{namespace T1}{template .U1}0{/template}{template .U1.UU1}Hello{/template}';
json=null;
html='Hello';
t_test('Namespace Overwrite 4', {T1:t1},'T1.U1.UU1',json,html,{overwrite_namespaces:true});

t1='{template U1.UU1}0{/template}{template U1}Hello{/template}';
json=null;
html='Hello';
t_test('Namespace Overwrite 5', {T1:t1},'U1',json,html,{overwrite_namespaces:true});

t1='{namespace T1}{template .U1.UU1}0{/template}{template .U1}Hello{/template}';
json=null;
html='Hello';
t_test('Namespace Overwrite 6', {T1:t1},'T1.U1',json,html,{overwrite_namespaces:true});

t1='{template U1}{/template}{template U1}{/template}';
t_throw('Namespace Error 1', {T1:t1},'T1.U1',json,gtpl.TemplateNamespaceError);

t1='{namespace T1}{template .U1}{/template}{template .U1}{/template}';
t_throw('Namespace Error 2', {T1:t1},'T1.U1',json,gtpl.TemplateNamespaceError);

t1='{template U1}{/template}{template U1.UU1}{/template}';
t_throw('Namespace Error 3', {T1:t1},'T1.U1',json,gtpl.TemplateNamespaceError);

t1='{namespace T1}{template .U1}{/template}{template .U1.UU1}{/template}';
t_throw('Namespace Error 4', {T1:t1},'T1.U1',json,gtpl.TemplateNamespaceError);

t1='{template T1.U1.UU1}{/template}{template T1.U1}{/template}';
t_throw('Namespace Error 5', {T1:t1},'T1.U1',json,gtpl.TemplateNamespaceError);

t1='{namespace T1}{template .U1.UU1}{/template}{template .U1}{/template}';
t_throw('Namespace Error 6', {T1:t1},'T1.U1',json,gtpl.TemplateNamespaceError);


////////////

t1='{template}{/template}';
t_throw('Syntax Error 1', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template U1.}{/template}';
t_throw('Syntax Error 2', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template .U1}{/template}';
t_throw('Syntax Error 3', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template T1.U1.}{/template}';
t_throw('Syntax Error 4', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template T1..U1}{/template}';
t_throw('Syntax Error 5', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template 1a}{/template}';
t_throw('Syntax Error 6', {T1:t1},'T1.1a',json,gtpl.TemplateParseError);

t1='{template _}{/template}';
t_throw('Syntax Error 7', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{templateT}{/template}';
t_throw('Syntax Error 8', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='Hallo';
t_throw('Syntax Error 9', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template U1}';
t_throw('Syntax Error 10', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template U1}{template U2}{/template}{/template}';
t_throw('Syntax Error 11', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template U1}{namespace A}{/template}';
t_throw('Syntax Error 12', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1}{/template}';
t_throw('Syntax Error 13', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace .T1}';
t_throw('Syntax Error 14', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1.}';
t_throw('Syntax Error 15', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1..T2}';
t_throw('Syntax Error 16', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace 1a}';
t_throw('Syntax Error 17', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace _}';
t_throw('Syntax Error 18', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace}';
t_throw('Syntax Error 19', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1}{/namespace}';
t_throw('Syntax Error 20', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1. U1}';
t_throw('Syntax Error 21', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template import}{/template}';
t_throw('Forbidden Keyword Error 1', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1.import}{/template}';
t_throw('Forbidden Keyword Error 2', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{template T1.template.T3}{/template}';
t_throw('Forbidden Keyword Error 3', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace import}';
t_throw('Forbidden Keyword Error 4', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1.import}';
t_throw('Forbidden Keyword Error 5', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);

t1='{namespace T1.call.T3}';
t_throw('Forbidden Keyword Error 6', {T1:t1},'T1.U1',json,gtpl.TemplateParseError);
