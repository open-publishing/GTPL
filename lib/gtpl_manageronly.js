/**
* Grin Template Engine (GTPL) (Manager Only)
*
* Authors: Matthias Schmeisser (mjs@grin.com)
* Copyright: 2012 Grin Verlag GmbH
*
* Released under the terms of the GNU General Public License.
* You should have received a copy of the GNU General Public License,
* along with this software. In the main directory, see: LICENSE.txt
* If not, see: http://www.gnu.org/licenses/.
*
*/


(function() {

var gtpl;

try{
    require; //test if commonjs is supported (assume: server-side)
    gtpl = exports;
} catch(e) {
    try{
        window;
        window.gtpl = gtpl = {};
    } catch(e) {
       this.gtpl = gtpl = {};
    }
}

gtpl.DEFAULT_CONFIG = {
    debug_evals : false,
    debug_undefined_evals : false,
    debug_calls : false,
    add_dynamic_script_url: true,
    embed_eval_errors: false,
    root_designator: '_',
    param_designator: '_p',
    global_root_designator: '_ctx',
    remove_wrapping_whitespaces: false, //all wrapping whitespace containing linebreaks.
    escape_evals : false,
    escape_eval_function : escapeHTML,
    double_bracket_evals: false,
    strict_js_syntax_check: true,
    embed_functions: false, // todo: testen
    namespace_root: null,
    overwrite_templates: false,
    overwrite_namespaces: false,
    keep_params: false,
    keep_containers: true,
    string_builder_function_name: 'StringBuilder'
};

gtpl.setdefault = function(obj) {
    if(obj===null||obj===undefined){
        obj={};
    }
    for(var i=1;i<arguments.length;i++){
        var o=arguments[i];
        for(var k in o){
            if(!(k in obj)){
                obj[k]=o[k];
            }
        }
    }
    return obj;
};


gtpl.clone = function(k){var l=arguments.callee;if(arguments.length==1){l.prototype=k;return new l;}};

/*
 * Error Classes
 */
gtpl.object_create = function(obj) {
    if(Object.create === 'function')
        return Object.create(obj);

    function F() {}
    F.prototype = obj;
    return new F();
};


function TemplateError(message, data) {
    function truncate_string(string, maxlen) {
        if (string.length > maxlen)
            return string.substring(0, maxlen - 3) + '...';
        return string;
    }

    this.message = message;
    if(data) {
        this.line = Number(data.line);
        this.col = Number(data.col);
        this.pos = Number(data.pos);
        this.text = truncate_string(data.text || data.full || '', 20);
        this.root = data.root;
        this.params = data.params;
        this.containers = data.containers;
        this.source = data.source;
    }
    try {
        //   ({})(); //not working with node
        } catch(ex) {
        this.stack = ex.stack;
    };
}
TemplateError.prototype = gtpl.object_create(Error.prototype);
TemplateError.prototype.toString = function() {
    var str = this.name+': ' + this.message;
    if(this.line !== undefined )
        str += " (source: " + this.source + ", line: " + this.line + ", col: " + this.col + ", pos: " + this.pos + ")";
    if (this.text)
    str += '\n-->' + this.text;

    if(JSON && JSON.stringify && this.root !== undefined) {
        str += "\nroot: ";
        try {
                str += JSON.stringify(this.root);
        } catch(e) {
            str += '[Cannot dump: ' +e.toString() + ']';
        }
    }
    if (this.stack)
    str += '\n\n' + this.stack;

    return str;
};
gtpl.TemplateError = TemplateError;

function TemplateRenderError(message,data) {
    this.constructor(message,data);
    this.name = 'TemplateRenderError';
};
TemplateRenderError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateRenderError.prototype.constructor = TemplateError;
gtpl.TemplateRenderError = TemplateRenderError;

function TemplateEvaluationError(message,data) {
    this.constructor(message,data);
    this.name = 'TemplateEvaluationError';
};
TemplateEvaluationError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateEvaluationError.prototype.constructor = TemplateError;
gtpl.TemplateEvaluationError = TemplateEvaluationError;

function TemplateUnexpectedUndefinedError(message,data) {
    this.constructor(message,data);
    this.name = 'TemplateUnexpectedUndefinedError';
};
TemplateUnexpectedUndefinedError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateUnexpectedUndefinedError.prototype.constructor = TemplateError;
gtpl.TemplateUnexpectedUndefinedError = TemplateUnexpectedUndefinedError;

function TemplateNoArrayLikeError(message,data) {
    this.constructor(message,data);
    this.name = 'TemplateNoArrayLikeError';
};
TemplateNoArrayLikeError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateNoArrayLikeError.prototype.constructor = TemplateError;
gtpl.TemplateNoArrayLikeError = TemplateNoArrayLikeError;

function TemplateParseError(message,data) {
    this.constructor(message,data);
    this.name = 'TemplateParseError';
};
TemplateParseError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateParseError.prototype.constructor = TemplateError;
gtpl.TemplateParseError = TemplateParseError;

function TemplateNamespaceError(message, data) {
    this.constructor(message,data);
    this.name = 'TemplateNamespaceError';
}
TemplateNamespaceError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateNamespaceError.prototype.constructor = TemplateError;
gtpl.TemplateNamespaceError = TemplateNamespaceError;

function TemplateUnknownTemplateError(message,data) {
    this.constructor(message,data);
    this.name = 'TemplateUnknownTemplateError';
};
TemplateUnknownTemplateError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateUnknownTemplateError.prototype.constructor = TemplateError;
gtpl.TemplateUnknownTemplateError = TemplateUnknownTemplateError;

function BreakContinueException(type) {
	this.type = type;
	this.before = '';
}
gtpl.BreakContinueException = BreakContinueException;

function get_uid() {
    return Math.floor(Math.random() * 100000000000);
}

var keys= Object.keys || function(obj) {var res = []; for(var key in obj) res.push(key); return res;};

function StringBuilder() {
    this.buffer = '';
}
StringBuilder.prototype.append = function(str) {
    this.buffer += str;
};
StringBuilder.prototype.clear = function(str) {
    this.buffer = '';
};
StringBuilder.prototype.toString = function(str) {
    return this.buffer;
};

gtpl.StringBuilder = StringBuilder;

function escapeHTML(txt) {
    return String(txt).replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
gtpl.escapeHTML=escapeHTML;

gtpl.deepCopy = function(data, escapeStringFunction) {
    var recursion_list = [];
    var recursion_key = '_rec' + get_uid();

    escapeStringFunction = escapeStringFunction ||
    function(a) {
        return a;
    };

    function copyData(data) {
        if (data instanceof Array) {
            if (data[recursion_key])
            return data[recursion_key];

            var a = [];
            data[recursion_key] = a;
            recursion_list.push(data);

            for (var i = 0; i < data.length; ++i) {
                a[i] = arguments.callee(data[i]);
            }
            return a;
        }
        if (typeof(data) == "string") {
            return escapeStringFunction ? escapeStringFunction(data) : data;
        }
        else if (data instanceof Function) {
            return data;
        }
        else if (data instanceof Object) {
            if (data[recursion_key])
            return data[recursion_key];

            var o = {};
            data[recursion_key] = o;
            recursion_list.push(data);

            for (var j in data) {
                if (j != recursion_key)
                o[j] = arguments.callee(data[j]);
            }
            return o;
        }
        else {
            return data;
        }
    }

    var res = copyData(data);

    for (var f = 0; f < recursion_list.length; ++f)
    delete recursion_list[f][recursion_key];

    return res;
};


gtpl.create_template_manager = function(config, external_namespaces) {
    config = config || {};
    external_namespaces = external_namespaces || [];

    gtpl.setdefault(config,gtpl.DEFAULT_CONFIG);
    config.namespace_root = '__manager__';

    return new TemplateManager(config, gtpl.clone, external_namespaces);
};

function TemplateManager(__config__,__clone__ /*, external_namespaces*/) {
    this.__config__ = __config__;

    //Import external namespaces into local scope
    for (this.i = 0; this.i < arguments[2].length; ++this.i) { //Todo: Testcases
        this.external_namespace = eval(arguments[2][this.i]);
        this.external_namespace_keys = keys(this.external_namespace);
        for (this.j = 0; this.j < this.external_namespace_keys.length; ++this.j) {
            eval('var ' + this.external_namespace_keys[this.j] + ' = this.external_namespace[this.external_namespace_keys[this.j]];');
        }
    }
    delete this.external_namespace;
    delete this.external_namespace_keys;
    delete this.j;
    delete this.i;

    //Template Scope vars (already set: __config__, all TemplateErrors)
    var __manager__ = this;
    var __templates__ = {};
    var __escapeEval__ = __config__.escape_eval_function;
    var gtpl; //overwrite to disable access to module name in templates

    this.__evalTemplates__ = function() {
        eval(arguments[0]);
    };
}

TemplateManager.prototype.build_namespace = function(template_name, template) {
        var head  = this;
        var ns_parts = template_name;
        var i = 0;
        for(; i< ns_parts.length -1; ++i) {
            if(head[ns_parts[i]] == undefined) {
               head[ns_parts[i]] = {};
            }
            if(head[ns_parts[i]] instanceof Function) {
                if(this.__config__.overwrite_namespaces)
                    head[ns_parts[i]] = {};
                else
                    throw new TemplateNamespaceError("Parts of template namespace already used as template function: " + template_name.join('.'), template);
            }
            head = head[ns_parts[i]];
        }

        if(head[ns_parts[i]] !== undefined && typeof head[ns_parts[i]] != 'function') {
            if(!this.__config__.overwrite_namespaces)
                throw new TemplateNamespaceError("Template name is already part of a namespace: " + template_name.join('.'), template);
        }
        if(head[ns_parts[i]] !== undefined && typeof head[ns_parts[i]] == 'function') {
            if(!this.__config__.overwrite_templates)
                throw new TemplateNamespaceError("Template already exists: " + template_name.join('.'), template);
        }
    };

TemplateManager.prototype.import_templates = function(template_export_string, source) {
            this.__evalTemplates__(template_export_string);
};

})();