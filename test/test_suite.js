var print_result, print_heading = {};

try{
    require; //test if commonjs is supported (assume: server-side)
    print_result = print_result_stdout;
    print_heading = print_heading_stdout;
    assert=require('./assert.js');
    gtpl=require('../lib/gtpl.js');
} catch(e) {
    //no commonjs implementation, we assume a browser
    require = function(path) {
        //var module = path.match(/[^/]*(?=\.js$)/)[0];

        return this;
    };

    exports = this;
    global = this;

    print_result = print_result_html;
    print_heading = print_heading_html;
}

//test function
global.F = function(b) {return b};


function print_result_html(msg,failed,result) {
    var html = '<tr><td>' + msg + '</td>';
    if(failed)
        html += '<td style="color: red;">[FAILED]</td><td>' + failed + '</td>';
    else
        html += '<td style="color: green;">[OK]</td><td></td>';

    if(result)
        html += '<td style="color: gray; font-size:75%;">'+result+'</td><td></td>';

    html += '</tr>';

    $(html).appendTo('table:last');
}

function print_heading_html(str) {
    var html = '<h3>'+str+'</h3><table></table>';
    $(html).appendTo('#content');
}

function print_result_stdout(msg,failed,result) {
    var str = msg;
    for(var i = 0; i< 35-msg.length;++i)
        str += ' ';
    if(failed)
        str += ' [FAILED] ' + failed;
    else
        str += ' [OK]';

    if(result) {
    str += ' ' + result.toString().replace(/\s/g," ");
    }

    console.log(str);
}

function print_heading_stdout(str) {
    console.log(str);
}



exports.print_heading = print_heading;
exports.print_result = print_result;


function res_ns(ns,start_templ) {
    var parts = start_templ.split('.');
    var res = ns;
    for (var i in parts) {
        res = res[parts[i]];
    }
    return res;
}

function compile(templs, debug_evals, config) {
    config = config || {};
    if(debug_evals) {
        config.debug_evals = true;
        config.debug_calls = true;
    }
    else {
        config.debug_evals = false;
        config.debug_calls = false;
    }
    var tm = gtpl.create_template_manager(config);

    for(var t_name in templs) {
        tm.add(templs[t_name],t_name);
    }
    return tm;
}

function run(templs, start_templ, json, debug_evals,config) {
    config = config || {};
    var tm = compile(templs, debug_evals, config);

    if(config.escape_evals)
        return res_ns(tm,start_templ)(json);
    else
        return res_ns(tm,start_templ)(gtpl.deepCopy(json,gtpl.escapeHTML));
}

function e_test(msg,templ,json,html,config) {
    templ = '{template t}' + templ + '{/template}';
    t_test(msg,{t:templ},'t',json,html,config);
}

function e_throw(msg,templ,json,exc,config) {
    templ = '{template t}' + templ + '{/template}';
    t_throw(msg,{t:templ},'t',json,exc,config);
}

function s_test(msg,func) {
    try{
        var result = func();
        print_result(msg,false,result);
    } catch(e) {
        print_result(msg,e.toString());
    }
}

function t_test(msg, templs,start_templ,json,html,config) {
    config = config || {};
    try{
        assert.equal(run(templs,start_templ,json,true,config), html);
        assert.equal(run(templs,start_templ,json,false,config), html);
        print_result(msg);
    } catch(e) {
        print_result(msg,e.toString());
    }
}

function t_throw(msg, templs,start_templ,json,exc,config) {
    config = config || {};
    try{
        var result = assert.throws( function() { run(templs,start_templ,json,true,config); },exc);
        print_result(msg,false,result);
    } catch(e) {
        print_result(msg,e.toString());
    }
}

function m_test(msg, templs, func, config) {
    config = config || {};
    try{
        func(compile(templs,true,config));
        func(compile(templs,false,config));
        print_result(msg);
    } catch(e) {
        print_result(msg,e.toString());
    }
}

exports.e_test=e_test;
exports.e_throw=e_throw;
exports.s_test=s_test;
exports.t_test=t_test;
exports.t_throw=t_throw;
exports.run=run;
