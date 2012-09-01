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

function t_wrap(templs) {
    var res = [];
    var tkeys = keys(templs);
    for(var i in tkeys) {
        templs[tkeys[i]] = '{template ' + tkeys[i] + '}' + templs[tkeys[i]] + '{/template}';
    }
    return templs;
}


print_heading('Testing: Call & Yield');

//Real Basics
var t1,t2,t3,t4,t5,json,html;

t1 = 'a{call T2 root=_}b';
t2 = '{_.a}';
json = {a:1};
html = 'a1b';
t_test('basic call', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2}b';
t2 = '{_.a}';
json = {a:1};
html = 'a1b';
t_test('basic call (no root)', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2 root=_.a}b';
t2 = '{_.b}';
json = {a:{b:1}};
html = 'a1b';
t_test('new root', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2 root=\'abc\'}b';
t2 = '{_}';
json = null;
html = 'aabcb';
t_test('literal root', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2 root=keys(_)}b';
t2 = '{_[1]}';
json = {a:1,b:2,c:3};
html = 'abb';
t_test('function root', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2 root={root:[1,2,3]}}b';
t2 = '{_.root[1]}';
json = null;
html = 'a2b';
t_test('literal root2', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{call T2 root=_.a}{_ctx.b}';
t2 = '{_.b}{_ctx.b}';
json = {a:{b:1},b:2};
html = '122';
t_test('Global Root', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2 root=\'abc\'}{call T2 root=123}b';
t2 = '{_}';
json = null;
html = 'aabc123b';
t_test('two calls', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call T2 root=_.a}b';
t2 = '{_.b}{call T3 root=_.c}';
t3 = '{_.d}';
json = {a:{b:1,c:{d:2}}};
html = 'a12b';
t_test('three nested calls', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{param P1="FOO"}{/Call}';
t2 = '{_p.P1}';
json = {a:1};
html = 'FOO';
t_test('param 1', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{Call T2}{param P1="FOO"}{/Call}';
t2 = '{_p.P1}';
json = {a:1};
html = 'FOO';
t_test('param 1 (no root)', t_wrap({T1:t1,T2:t2}),'T1',json,html);


t1 = '{param P1="BAR"}{call T2 root=_}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'undefinedBAR';
t_test('param 2', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{param P1="BAR"}{call T2 root=_}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'BARBAR';
t_test('param 3', t_wrap({T1:t1,T2:t2}),'T1',json,html,{keep_params:true});

t1 = '{param P1="BAR"}{call T2}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'BARBAR';
t_test('param 3 (no root)', t_wrap({T1:t1,T2:t2}),'T1',json,html,{keep_params:true});

t1 = '{param P1="BAR"}{Call T2 root=_}{param P1="FOO"}{/Call}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'FOOBAR';
t_test('param 4', t_wrap({T1:t1,T2:t2}),'T1',json,html,{keep_params:true});

t1 = '{param P1="BAR"}{call T2 root=_}{_p.P1}';
t2 = '{_p.P1}{param P1="FOO"}{_p.P1}';
json = {a:1};
html = 'BARFOOBAR';
t_test('param 5', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:true});

t1 = '{param P1="BAR"}{Call T2 root=_}{param P1="BAZ"}{/Call}{_p.P1}';
t2 = '{_p.P1}{param P1="FOO"}{_p.P1}';
json = {a:1};
html = 'BAZFOOBAR';
t_test('param 6', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:true});

t1 = '{param P1="BAR"}{call T2 root=_}{Call T2 root=_}{param P1="BAZ"}{/Call}{_p.P1}';
t2 = '{_p.P1}{param P1="FOO"}{_p.P1}';
json = {a:1};
html = 'BARFOOBAZFOOBAR';
t_test('param 7', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:true});

t1 = '{param P1="BAR"}{call T2 root=_}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'undefinedBAR';
t_test('param 8', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:false});

t1 = '{param P1="BAR"}{call T2 root=_}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'undefinedBAR';
t_test('param 8b (default)', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{param P1="BAR"}{Call T2 root=_}{param P1="FOO"}{/Call}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'FOOBAR';
t_test('param 9', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{param P1=_p.P1||_}{if _p.P1>1}{Call T1 root=_}{param P1=_p.P1-1}{/Call}{/if}{_p.P1}';
json = 5;
html = '12345';
t_test('param 10', t_wrap({T1:t1}),'T1',json,html, {keep_params:true});

t1 = '{param P1=_p.P1||_}{if _p.P1>1}{Call T1 root=_}{param P1=_p.P1-1}{param P1=_p.P1-1}{/Call}{/if}{_p.P1}';
json = 5;
html = '135';
t_test('param 11', t_wrap({T1:t1}),'T1',json,html, {keep_params:true});

t1 = '{param P1="BAR"}{Call T2 root=_}{param P1="FOO"}{/Call}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'FOOBAR';
t_test('param 12', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{Call T2 root=_}{param P1="FOO"}{param P1="BAR"}{/Call}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'BARundefined';
t_test('param 13', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{param P1="BAR"}{Call T2 root=_}{/Call}{_p.P1}';
t2 = '{_p.P1}';
json = {a:1};
html = 'undefinedBAR';
t_test('param 14', t_wrap({T1:t1,T2:t2}),'T1',json,html);


t1 = '{Call T2 root=_}{param P1 = 6}{/Call}'; //todo: inherit in {call}?
t2 = '{_p.P1}{call T3 root=_}{_p.P1}';
t3 = '{_p.P1}';
json = {a:1};
html = '6undefined6';
t_test('param 15', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{yield TT root=_}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('basic yield', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{yield TT}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('basic yield (no root)', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{yield TT root=_}{yield TD root=_}';
t3 = 'y{_.a}y';
t4 = 'z{_.a}z';
json = {a:1};
html = '1y1yz1z';
t_test('2 yields', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{yield TT root=_}{yield TT root=_}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1yy1y';
t_test('2 identical yields', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{yield TT root=_}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
json = {a:1};
html = '1y1z1zy';
t_test('inherited yields 1', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{yield TT}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
json = {a:1};
html = '1y1z1zy';
t_test('inherited yields 1 (no root)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);


t1 = '{Call T2 root=_}{container TD=T4}{/Call}';
t2 = '{_.a}{call T3 root=_}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
json = {a:1};
html = '1y1z1zy';
t_test('inherited yields 2', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{yield TD root=_} {Yield TT root=_}{container TD=T5}{/Yield}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
t5 = 'x{_.a}x';
json = {a:1};
html = '1z1z y1x1xy';
t_test('inherited yields 3 (overwrite)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4,T5:t5}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{yield TD root=_} {Yield TT root=_}{container TD=T5}{/Yield}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
t5 = 'x{_.a}x';
json = {a:1};
html = '1z1z y1x1xy';
t_test('inherited yields 3a (default)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4,T5:t5}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{Yield TT root=_}{container TD=T5}{/Yield} {yield TD root=_} ';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
t5 = 'x{_.a}x';
json = {a:1};
html = '1y1x1xy z1z ';
t_test('inherited yields 4 (no overwrite)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4,T5:t5}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{/Yield}';
t3 = 'x';
json = {a:1};
html = 'x';
t_test('inherit yield 5 (Yield)', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT}{/Yield}';
t3 = 'x';
json = {a:1};
html = 'x';
t_test('inherit yield 5 (Yield, no root)', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);


t1 = '{Call T2 root=_}{container TD=T3}{/Call}';
t2 = '{_.a}{yield TT fallback=T3 root=_}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback 1', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{yield TT fallback=T2 root=_}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback 2', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TD=T3}{/Call}';
t2 = '{_.a}{Yield TT fallback=T3 root=_}{/Yield}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback 3', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{Yield TT fallback=T2 root=_}{/Yield}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback 4', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TD=T3}{/Call}';
t2 = '{_.a}{Yield TT fallback=T3 root=_}{container TT=T2}{/Yield}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback 5', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TD=T3}{/Call}';
t2 = '{_.a}{yield TT fallback=T3}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback 6', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{call T2 root=_}';
t2 = '{_.a}{yield TT fallback=noop root=_}';
json = {a:1};
html = '1';
t_test('yield fallback noop 1', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{call T2 root=_}';
t2 = '{_.a}{Yield TT fallback=noop root=_}{/Yield}';
json = {a:1};
html = '1';
t_test('yield fallback noop 2', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{yield TT fallback=noop root=_}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback noop 3', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{_.a}{Yield TT fallback=noop root=_}{/Yield}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('yield fallback noop 4', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);


t1 = '{Call T2 root=_}{container TT=T3}{param P1=5}{/Call}'; //todo: inherit in {yield}?
t2 = '{_p.P1}{Yield TT root=_}{container TT=T4}{param P1=6}{/Yield}{_p.P1}';
t3 = '{_p.P1}{yield TT root=_}{_p.P1}';
t4 = '{_p.P1}';
json = {a:1};
html = '56undefined65';
t_test('inherit yield 6 (params)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);

t1 = '{Call T2 root=_}{foreach B in [1,2,3,4]}{if B == 3}{container TT=T3}{break}{else}{container TT=T4}{/if}{/foreach}{/Call}';
t2 = '{_.a}{yield TT root=_}';
t3 = 'y{_.a}y';
t4 = 'unknown';
json = {a:1};
html = '1y1y';
t_test('inline statements', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);

t1 = '{Call T2 root=_}{foreach B in [1,2,3,4]}{if B == 3}{param P1=B$index}{break}{else}{param P2=B*5}{/if}{/foreach}{/Call}';
t2 = '{_p.P1}{_p.P2}';
json = {a:1};
html = '210';
t_test('inline statements 2', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{foreach B in [1,2,3,4]}{if B == 3}{container TT=T4}{break}{else}{container TT=T5}{/if}{/foreach}{/Yield}';
t3 = 'x{yield TT root=_}x';
t4 = 'y{_.a}y';
t5 = 'unknown';
json = {a:1};
html = 'xy1yx';
t_test('inline statements 3 (yield)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4,T5:t5}),'T1',json,html);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{foreach B in [1,2,3,4]}{if B == 3}{param P1=B$index}{break}{else}{param P2=B*5}{/if}{/foreach}{/Yield}';
t3 = '{_p.P1}{_p.P2}';
json = {a:1};
html = '210';
t_test('inline statements 4 (yield)', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = '{Call T2 root=_} {foreach B in [1,2,3,4]}\t\n{if B == 3}  {container TT=T3} {break} {else} {container TT=T4} {/if} {/foreach}  {/Call}';
t2 = '{_.a}{yield TT root=_}';
t3 = 'y{_.a}y';
t4 = 'unknown';
json = {a:1};
html = '1y1y';
t_test('inline statements 5', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,html);

t1 = '{Call T2 root=_}  {foreach B in [1,2,3,4]}\t\n{if B == 3} {param P1=B$index} {break} {else} {param P2=B*5} {/if}  {/foreach}\n{/Call}';
t2 = '{_p.P1}{_p.P2}';
json = {a:1};
html = '210';
t_test('inline statements 6', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2}{Container TT}y{/Container}{/Call}c';
t2 = '1{yield TT root=_}2';
json = null;
html = 'a1y2c';
t_test('inline container 1', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:true});

t1 = 'a{Call T2}{Container TT}{_.a}{_y.a}{/Container}{/Call}c';
t2 = '1{yield TT root={a:4}}2';
json = {a:3};
html = 'a1342c';
t_test('inline container 2', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2}{Container TT use_yield_root=yes}{_.a}{/Container}{/Call}c';
t2 = '1{yield TT root={a:4}}2';
json = {a:3};
html = 'a142c';
t_test('inline container 3', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2}{Container TT use_yield_root=no}{_.a}{/Container}{/Call}c';
t2 = '1{yield TT root={a:4}}2';
json = {a:3};
html = 'a132c';
t_test('inline container 4', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2 root={a:4}}{Container TT}{_.a}{_y.a}{/Container}{/Call}c';
t2 = '1{yield TT}2';
json = {a:3};
html = 'a1342c';
t_test('inline container 5', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2  root={a:4}}{Container TT use_yield_root=yes}{_.a}{/Container}{/Call}c';
t2 = '1{yield TT}2';
json = {a:3};
html = 'a142c';
t_test('inline container 6', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2}{Container TT}{_.a}{/Container}{/Call}c';
t2 = '1{yield TT root={a:4}}2';
json = {a:3};
html = 'a142c';
t_test('inline container 7', t_wrap({T1:t1,T2:t2}),'T1',json,html, {use_yield_root:true});

t1 = 'a{Call T2}{Container TT}c{yield TD}c{/Container}{/Call}a';
t2 = 'y{Yield TT}{Container TD}x{/Container}{/Yield}y';
json = null;
html = 'aycxcya';
t_test('inline container 8', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2 root=1}{Container TT}c{yield TD root=3}{_}{_y}{yield TD}c{/Container}{/Call}a';
t2 = 'y{Yield TT root=2}{Container TD}{_}{_y}{/Container}{/Yield}{_}y';
json = 0;
html = 'ayc130210c1ya';
t_test('inline container 9', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2 root=1}{Container TT}c{yield TD root=3}{_}{_y}{yield TD root=_y}c{/Container}{/Call}a';
t2 = 'y{Yield TT root=2}{container TD=T3}{/Yield}{_}y';
t3 = '{_}'
json = 0;
html = 'ayc3022c1ya';
t_test('inline container 10', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html);

t1 = 'a{Call T2 root=_}{Container TT}{_.a}{_y.a}{/Container}{Container TD}i{_.a}{_y.a}i{/Container}{/Call}c';
t2 = 'y{yield TT root={a:4}}{yield TD root={a:0}}{yield TT root={a:9}}y';
json = {a:3};
html = 'ay34i30i39yc';
t_test('inline container 11', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{Call T2}{Container TT}c{/Container}{/Call}x{Call T2}{/Call}a';
t2 = 'y{yield TT fallback=T3}y';
t3 = 't';
json = null;
html = 'aycyxytya';
t_test('inline container 12', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html, {keep_params:true});

t1 = 'a{param a=0}{Call T2}{param a=1}{Container TT}c {_p.a}{_yp.a} c{/Container}{/Call} {_p.a}a';
t2 = 'y{Yield TT}{param a=3}{/Yield} {_p.a}y';
json = null;
html = 'ayc 13 c 1y 0a';
t_test('inline container params 1', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:true});

t1 = 'a{param a=0}{Call T2}{param a=1}{Container TT}c {_p.a}{_yp.a||"x"} c{/Container}{/Call} {_p.a}a';
t2 = 'y{param a=3}{Yield TT}{/Yield} {_p.a}y';
json = null;
html = 'ayc 1x c 3y 0a';
t_test('inline container params 2', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:false});

t1 = 'a{param a=0}{Call T2}{param a=1}{Container TT}c {_p.a}{_yp.a} c{/Container}{/Call} {_p.a}a';
t2 = 'y{yield TT} {_p.a}y';
json = null;
html = 'ayc 11 c 1y 0a';
t_test('inline container params 3', t_wrap({T1:t1,T2:t2}),'T1',json,html, {keep_params:true});

t1 = 'a{param a=0}{Call T2}{param a=1}{Container TT use_yield_root=yes}c {_p.a} c{/Container}{/Call} {_p.a}a';
t2 = 'y{Yield TT}{param a=3}{/Yield} {_p.a}y';
json = null;
html = 'ayc 3 c 1y 0a';
t_test('inline container params 4', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{foreach i in [1,2,3]}{Call T2}{Container TT}{i}{i$first}{/Container}{/Call}{/foreach}';
t2 = 'x {yield TT root=_} x';
json = null;
html = 'x 1true xx 2false xx 3false x';
t_test('inline container foreach', t_wrap({T1:t1,T2:t2}),'T1',json,html);



t1 = '{Call T2 root=$.a}{param P1=$.b}{container TT=T3}{/Call}{$.b}{$$.b}{$p.P1}';
t2 = '{$.b}{$$.b}{$p.P1}{Yield TT root=$$}{param P1=$.b}{/Yield}';
t3 = '{$.b}{$$.b}{$p.P1}';
json = {a:{b:1},b:2};
html = '12222122undefined';
t_test('Designated Names', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,html,{root_designator:'$',param_designator: '$p', global_root_designator:'$$'});

t1 = 'a{call \t \n T2 \t\n\t root \t= \n [\'root\',\'call\'] \t \n}b';
t2 = '{_[0]}';
json = {a:1};
html = 'arootb';
t_test('Obscure Syntax', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = 'a{call _2 root=_}b';
t2 = 'x';
json = null;
html = 'axb';
t_test('Obscure Syntax 2', t_wrap({T1:t1,_2:t2}),'T1',json,html);

t1 = '{Call \n \t T2 \n root\t=\n_ }\t{container root2 \n=\tcall2 \n} \n{/Call }';
t2 = '{_.a}{yield \t root2 \t\n\nfallback\t\n=\nT1\n root\t = \n_\t}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_test('Obscure Syntax 3', t_wrap({T1:t1,T2:t2,call2:t3}),'T1',json,html);

t1 = 'a{call _2    }b';
t2 = 'x';
json = null;
html = 'axb';
t_test('Obscure Syntax 4', t_wrap({T1:t1,_2:t2}),'T1',json,html);

t1 = 'a{Call T2}{Container \n TT\t  use_yield_root=no\n}y{/Container  }{/Call}c';
t2 = '1{yield TT root=_}2';
json = null;
html = 'a1y2c';
t_test('Obscure Syntax inline', t_wrap({T1:t1,T2:t2}),'T1',json,html);

t1 = '{call T2 root=_}';
t2 = '{call T1 root=_}';
json = null;
t_throw('Recursive Error', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateEvaluationError);

t1 = '{call UNKNOWN root=_}';
json = {a:1};
t_throw('Invalid target', t_wrap({T1:t1}),'T1',json,gtpl.TemplateUnknownTemplateError);

t1 = '{Call UNKNOWN root=_}{container TT=T3}{/Call}';
t_throw('Invalid target 2', t_wrap({T1:t1}),'T1',json,gtpl.TemplateUnknownTemplateError);

t1 = '{call T2 root=_}'; //todo: empty yield erlaubt?
t2 = '{_.a}{yield TT root=_}';
json = {a:1};
t_throw('Invalid target 3 (empty yield)', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateUnknownTemplateError);

t1 = '{Call T2 root=_}{container TT=T3}{container TD=T4}{/Call}';
t2 = '{_.a}{yield TT root=_}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
json = {a:1};
t_throw('Invalid target 4 (!keep_containers)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,gtpl.TemplateUnknownTemplateError, {keep_containers:false});

t1 = '{Call T2 root=_}{container TD=T4}{/Call}';
t2 = '{_.a}{call T3 root=_}';
t3 = 'y{_.a}{yield TD root=_}y';
t4 = 'z{_.a}z';
json = {a:1};
t_throw('Invalid target 5 (!keep_containers)', t_wrap({T1:t1,T2:t2,T3:t3,T4:t4}),'T1',json,gtpl.TemplateUnknownTemplateError, {keep_containers:false});

t1 = '{call T2 root=_}'; //todo: empty yield erlaubt?
t2 = '{_.a}{Yield TT root=_}{/Yield}';
json = {a:1};
t_throw('Invalid target 6 (empty Yield)', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateUnknownTemplateError);

t1 = '{Call T2 root=_}{container TT=T2}{/Call}';
t2 = '{_.a}{yield TT fallback=T3 root=_}';
json = {a:1};
html = '1y1y';
t_throw('Invalid target 7', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateUnknownTemplateError);

t1 = '{Call T2 root=_}{container TT=T4}{/Call}';
t2 = '{_.a}{yield TT fallback=T3 root=_}';
t3 = 'y{_.a}y';
json = {a:1};
html = '1y1y';
t_throw('Invalid target 8', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateUnknownTemplateError);

t1 = '{call T2. root=_}';
t2 = 'a';
t_throw('SyntaxError 1', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call 1AB root=_}';
t2 = 'a';
t_throw('SyntaxError 2', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call call root=_}';
t2 = 'a';
t_throw('SyntaxError 3', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call A..B root=_}';
t2 = 'a';
t_throw('SyntaxError 4', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

//allow omitting root
//t1 = '{call T2}';
//t2 = 'a';
//t_throw('SyntaxError 5', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 root= }';
t2 = 'a';
t_throw('SyntaxError 6', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 root=_}{container A=B}';
t2 = 'a';
t_throw('Syntax Error 7', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 root=_}{container A=B}{/call}';
t2 = 'a';
t_throw('Syntax Error 8', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 root=_}{param A=3}{/call}';
t2 = 'a';
t_throw('Syntax Error 9', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container A=B}{/call}';
t2 = 'a';
t_throw('Syntax Error 10', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container A=B}{/Yield}';
t2 = 'a';
t_throw('Syntax Error 11', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}Unallowed{/Call}';
t2 = 'a';
t_throw('Syntax Error 12', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{1+1}{/Call}';
t2 = 'a';
t_throw('Syntax Error 13', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{if true}unallowed{/if}{/Call}';
t2 = 'a';
t_throw('Syntax Error 14', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{foreach I in [1,2]}{cycle [1,2]}{/foreach}{/Call}';
t2 = 'a';
t_throw('Syntax Error 15', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{if true}{ldelim}{/if}{/Call}';
t2 = 'a';
t_throw('Syntax Error 16', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{if true}{rdelim}{/if}{/Call}';
t2 = 'a';
t_throw('Syntax Error 17', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{if true}{literal}hehe{/literal}{/if}{/Call}';
t2 = 'a';
t_throw('Syntax Error 20', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{call T2 root=_}{/Call}';
t2 = 'a';
t_throw('Syntax Error 21', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{yield T2 root=_}{/Call}';
t2 = 'a';
t_throw('Syntax Error 22', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T2 root=_}{/Call}';
t2 = 'a';
t_throw('Syntax Error 23', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container 1T=T2}{/Call}';
t2 = 'a';
t_throw('Syntax Error 25', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container .TT=T2}{/Call}';
t2 = 'a';
t_throw('Syntax Error 26', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield 1AB root=_}';
t3 = 'a';
t_throw('SyntaxError 27', t_wrap({T1:t1,T2:t2, T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield TT. root=_}';
t3 = 'a';
t_throw('SyntaxError 29', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield .TT root=_}';
t3 = 'a';
t_throw('SyntaxError 30', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

//t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
//t2 = '{yield TT}';
//t3 = 'a';
//t_throw('SyntaxError 31', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield TT root= }';
t3 = 'a';
t_throw('SyntaxError 32', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield TT root=_}{container A=B}';
t3 = 'a';
t_throw('Syntax Error 33', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield T2 root=_}{container A=B}{/yield}';
t3 = 'a';
t_throw('Syntax Error 34', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{yield TT root=_}{param A=3}{/yield}';
t3 = 'a';
t_throw('Syntax Error 35', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{container A=B}{/yield}';
t3 = 'a';
t_throw('Syntax Error 36', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{container A=B}{/Call}';
t3 = 'a';
t_throw('Syntax Error 37', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}Unallowed{/Yield}';
t3 = 'a';
t_throw('Syntax Error 38', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{1+1}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 39', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{if true}unallowed{/if}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 40', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{foreach I in [1,2]}{cycle [1,2]}{/foreach}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 41', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{if true}{ldelim}{/if}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 42', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{if true}{rdelim}{/if}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 43', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{if true}{literal}hehe{/literal}{/if}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 44', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{call T2 root=_}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 45', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{yield T2 root=_}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 46', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{container TT=T2 root=_}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 47', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{container 1T=T2}{/Yied}';
t3 = 'a';
t_throw('Syntax Error 48', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container TT=T3}{/Call}';
t2 = '{Yield TT root=_}{container .TT=T2}{/Yield}';
t3 = 'a';
t_throw('Syntax Error 49', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Yield T2 root=_ fallback=BLA}{/Yield}';
t_throw('Syntax Error 53', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 keep_params=yes root=_}';
t_throw('Syntax Error 54', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{yield T2 fallback=TD fallback=TT root=_}';
t_throw('Syntax Error 59', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Yield T2 fallback:=TT root=_}{/Yield}';
t_throw('Syntax Error 60', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 fallback=T root=_}';
t_throw('Syntax Error 62', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 fallback=T root=_}{/Call}';
t_throw('Syntax Error 62', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{yield T2 fallback= root=_}';
t_throw('Syntax Error 65', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{yield T2 fallback=T..T root=_}';
t_throw('Syntax Error 66', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{yield T2 fallback=1A root=_}';
t_throw('Syntax Error 67', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2root=_}';
t2 = 'a';
t_throw('SyntaxError 68', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{yield T2 fallback=TTroot=_}';
t2 = 'a';
t_throw('SyntaxError 70', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{call T2 root=_ root=_}';
t2 = 'a';
t_throw('SyntaxError 71', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container yield=T3}{/Call}';
t2 = '{yield yield root=_}';
t3 = 'a';
t_throw('Forbidden Keyword Error 1', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container import=T3}{/Call}';
t2 = '{yield import root=_}';
t3 = 'a';
t_throw('Forbidden Keyword Error 2', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{container Call=T3}{/Call}';
t2 = '{yield Call root=_}';
t3 = 'a';
t_throw('Forbidden Keyword Error 3', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call call root=_}{container TT=T3}{/Call}';
t2 = '{yield TT root=_}';
t3 = 'a';
t_throw('Forbidden Keyword Error 4', t_wrap({T1:t1,call:t2,T3:t3}),'T1',json,gtpl.TemplateParseError);


t1 = '{Call T2 root=_}{Container TT use_yield_root=yes}{_y}{/Container}{/Call}';
t2 = '{yield TT root={a:4}}';
json = {a:3};
t_throw('Undefined _y error', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateEvaluationError);

t1 = '{Call T2 root=_}{Container TT}{/Container}{/Call}';
t2 = '{yield TT}{_y}';
json = {a:3};
t_throw('Undefined _y error', t_wrap({T1:t1,T2:t2}),'T1',json,gtpl.TemplateEvaluationError);

t1 = '{Call T2}{container TD=T3}{/Call}';
t2 = '{yield TD}';
t3 = '{_y}'
json = 0;
t_throw('Undefined _y error', t_wrap({T1:t1,T2:t2,T3:t3}),'T1',json,gtpl.TemplateEvaluationError);

t1 = '{Call T2 root=_}{Container A}{/Call}';
t_throw('Syntax Error inline 1', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container A=B}{/Container}{/Call}';
t_throw('Syntax Error inline 2', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container A}{/Container}a{/Call}';
t_throw('Syntax Error inline 3', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Container A}{/Container}';
t_throw('Syntax Error inline 4', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container A}{container B=C}{/Container}{/Call}';
t_throw('Syntax Error inline 5', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container A use_yield_root=}{/Container}{/Call}';
t_throw('Syntax Error inline 2', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container A use_yield_root=bla}{/Container}{/Call}';
t_throw('Syntax Error inline 2', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container use_yield_root=yes A}{/Container}{/Call}';
t_throw('Syntax Error inline 2', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

t1 = '{Call T2 root=_}{Container 1AA}{/Container}{/Call}';
t_throw('Syntax Error inline 2', t_wrap({T1:t1}),'T1',json,gtpl.TemplateParseError);

