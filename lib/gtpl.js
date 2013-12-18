/**
* Grin Template Engine (GTPL)
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
	yield_root_designator: '_y',
	yield_param_designator: '_yp',
	truncate_whitespaces: null, //'relaxed' -> ws wrapping textnodes, 'aggressive' -> all linebreaks and wrapping ws inside of textnodes
	escape_evals : false,
	escape_eval_function : escapeHTML,
	double_bracket_evals: false,
	check_js_expression_function: check_javascript_syntax,
	embed_functions: false, // todo: testen
	namespace_root: null,
	overwrite_templates: false,
	overwrite_namespaces: false,
	keep_params: false,
	keep_containers: true,
	use_yield_root: false,
	add_metaobject: true,
	introspection_mode: 'names',
	empty_template_name: 'noop',
	string_builder_function_name: 'StringBuilder',
	provide_root_keys: false
};

gtpl.CODE_DEBUG_OFFSET=5;


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

function check_javascript_syntax(js_string) {
	//// Uncomment this if to check for object literals.  
	// try {
	// 	eval(js_string/*.replace(/\\/g,"\\\\")*/); // Ususal Syntax Errors, and things like Object literals {a:1,b:2}.
	// }
	// catch(e) {
	// 	if (e instanceof SyntaxError)
	// 		return e.type + ' ' + e.arguments + '"';
	// }

	try{
		eval('(' + js_string + ')'); // Constructs like {1} and longer statements (1;2;) which pass normal evals
		eval('gtpl.__garbage__ = (' + js_string + ')');
	}
	catch(e) {
		if (e instanceof SyntaxError)
			return e.type + ' ' + e.arguments + '"';
	}
	return undefined;
}
gtpl.check_javascript_syntax = check_javascript_syntax;


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
		this.text = truncate_string(data.text || data.full || '', 40);
		this.root = data.root;
		this.params = data.params;
		this.containers = data.containers;
		this.source = data.source;
		this.code = data.code;
		this.code_start_line = data.code_start_line || 1;
	}
	try {
		throw new Error('Aaarghhh!!!');
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

	// if(JSON && JSON.stringify && this.root !== undefined) {
	// 	str += "\nroot: ";
	// 	try {
	// 		str += JSON.stringify(this.root);
	// 	} catch(e) {
	// 		str += '[Cannot dump: ' +e.toString() + ']';
	// 	}
	// }
	// if (this.stack)
	// str += '\n\n' + this.stack;

	// if(this.code)
	//    str += this.code_to_string();

	return str;
};

TemplateError.prototype.code_to_string = function() {
	if(!this.code) 
		return;

	var start_offset = this.code_start_line -1;

	var lines = this.code.split('\n')
	var first_line = Math.max(1,this.line - start_offset - gtpl.CODE_DEBUG_OFFSET);
	var last_line = Math.min(this.line+gtpl.CODE_DEBUG_OFFSET-start_offset,lines.length);

	
	var result = '';

	for(var i=first_line; i<=last_line; ++i) {
		if(lines[i-1]) {
			result += (i+start_offset == this.line) ? '> ' : '  ';
			result += (i+start_offset) + ':\t' + lines[i-1] + '\n';
		}
	}

	return result;
}

TemplateError.prototype.extract_code = function(data) {
	if(data && data.myself && data.myself.__self__ && data.myself.__self__.code) {
		this.code=data.myself.__self__.code;
		this.code_start_line=Math.max(1,data.myself.__self__.line_start-gtpl.CODE_DEBUG_OFFSET);
	}
}

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
	this.extract_code(data);
};
TemplateEvaluationError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateEvaluationError.prototype.constructor = TemplateError;
gtpl.TemplateEvaluationError = TemplateEvaluationError;

function TemplateUnexpectedUndefinedError(message,data) {
	this.constructor(message,data);
	this.name = 'TemplateUnexpectedUndefinedError';
	this.extract_code(data);
};
TemplateUnexpectedUndefinedError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateUnexpectedUndefinedError.prototype.constructor = TemplateError;
gtpl.TemplateUnexpectedUndefinedError = TemplateUnexpectedUndefinedError;

function TemplateNoArrayLikeError(message,data) {
	this.constructor(message,data);
	this.name = 'TemplateNoArrayLikeError';
	this.extract_code(data);
};
TemplateNoArrayLikeError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateNoArrayLikeError.prototype.constructor = TemplateError;
gtpl.TemplateNoArrayLikeError = TemplateNoArrayLikeError;

function TemplateParseError(message,data) {
	this.constructor(message,data);
	this.name = 'TemplateParseError';
	this.extract_code(data);
};
TemplateParseError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateParseError.prototype.constructor = TemplateError;
gtpl.TemplateParseError = TemplateParseError;

function TemplateNamespaceError(message, data) {
	this.constructor(message,data);
	this.name = 'TemplateNamespaceError';
	this.extract_code(data);
}
TemplateNamespaceError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateNamespaceError.prototype.constructor = TemplateError;
gtpl.TemplateNamespaceError = TemplateNamespaceError;

function TemplateUnknownTemplateError(message,data) {
	this.constructor(message,data);
	this.name = 'TemplateUnknownTemplateError';
	this.extract_code(data);
};
TemplateUnknownTemplateError.prototype = gtpl.object_create(TemplateError.prototype);
TemplateUnknownTemplateError.prototype.constructor = TemplateError;
gtpl.TemplateUnknownTemplateError = TemplateUnknownTemplateError;

function BreakContinueException(type) {
	this.type = type;
	this.before = '';
}
gtpl.BreakContinueException = BreakContinueException;

/*
 *  Parser Scope. Includes Tokenizer-Scope, Builder-Scope, Compiler-Scope
 *  and a bunch of private members
 */
(function() {

function TemplateNode() {};
function IfNode() {};
function ForeachNode() {};
function BreakContNode() {};
function YieldNode() {};
function CallNode() {};
function TextNode() {};
function EvalNode() {};
function ContainerNode() {};
function InlineContainerNode() {};
function ParamNode() {};
function CycleNode() {};

var COMMENT_EXPR = '{*';

var INSTRUCTION_KEYWORDS = array_to_set([
	'template',
	'if',
	'elseif',
	'else',
	'foreach',
	'break',
	'continue',
	'call',
	'Call',
	'yield',
	'Yield',
	'param',
	'container',
	'Container',
	'ifempty',
	'cycle',
	'namespace',
	'meta'
]);

var DELIM_KEYWORDS = array_to_set(['ldelim', 'rdelim']);

var INSTRUCTION_CLOSING_KEYWORDS = array_to_set([
	'template',
	'if',
	'Call',
	'Yield',
	'foreach',
	'Container'
]);

var RESERVED_GTPL_ATTRIBUTES = array_to_set([
	'root',
	'fallback',
	'use_yield_root',
	'in'
]);

var RESERVED_JAVASCRIPT_KEYWORDS = array_to_set([
	'break', 'else', 'new', 'var', 'case', 'finally', 'return', 'void', 'catch', 'for', 'switch', 'while', 'continue',
	'function', 'this', 'with', 'default', 'if', 'throw', 'delete', 'in', 'try', 'do', 'instanceof', 'typeof', 'abstract',
	'enum', 'int', 'short', 'boolean',
	//Reserved words for future use:
	'export', 'interface', 'static', 'byte', 'extends', 'long', 'super', 'char', 'final', 'native', 'synchronized',
	'class', 'float', 'package', 'throws', 'const', 'goto', 'private', 'transient', 'debugger', 'implements',
	'protected', 'volatile', 'double', 'import', 'public'
]);

var LITERAL_KEYWORD = 'literal';
var LITERAL_CLOSING_KEYWORD = 'literal';

//Popular Template Names which can be hardly forbidden. The list is only applied on the dotted Tempalate parts (".Container")
var KEYWORD_WHITELIST = array_to_set([
	'Container'
]);

function parse_error(message, data) {
	throw new TemplateParseError(message, data);
};

var EX_EOF = {};

function TAB(depth) {
	var indent = '';
	for (var i = 0; i < depth; ++i)
	indent += '\t';

	return indent;
}

var LB = '\n';
var SP = ' ';

function is_alphanumeric_char(ch) {
	ch = ch.charCodeAt(0);
	return (ch >= 48 && ch <= 57) ||
	(ch >= 65 && ch <= 90) ||
	(ch >= 97 && ch <= 122);
};

function is_letter_char(ch) {
	ch = ch.charCodeAt(0);
	return (ch >= 65 && ch <= 90) ||
	(ch >= 97 && ch <= 122);
};

function is_identifier_char(ch) {
	return is_alphanumeric_char(ch) || ch == "$" || ch == "_";
};

function is_digit(ch) {
	ch = ch.charCodeAt(0);
	return ch >= 48 && ch <= 57;
};


function is_whitespace_char(ch) {
	return ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n';
}

function tokenizer(input,config,source) {
	var S = {
		text: input.replace(/\r\n?|[\n\u2028\u2029]/g, "\n"),
		pos: 0,
		tokpos: 0,
		line: 1,
		tokline: 1,
		col: 0,
		tokcol: 0
	};

	function peek(n) {
		n = n || 0;
		return S.text.charAt(S.pos + n);
	};

	function peek_string(str) {
		for (var i = 0; i < str.length; ++i) {
			if (peek(i) != str.charAt(i))
			return false;
		}
		return true;
	}

	function skip_whitespace() {
		while (is_whitespace_char(peek()))
		next();
	};

	function token(type, obj, close) {
		obj = obj || {};
		obj.type = type;
		//obj.value =value;
		obj.full = S.text.substring(S.tokpos, S.pos);
		obj.close = close;
		obj.line = S.tokline;
		obj.col = S.tokcol;
		obj.pos = S.tokpos;
		obj.source = source;
		obj.code = S.text;

		return obj;
	};

	function create_node(type, data) {
		var node = new type();
		for (var key in data) {
			node[key] = data[key];
		}
		return node;
	}

	function parse_statement_error(err) {
		parse_error(err, {line: S.tokline, col: S.tokcol, pos: S.tokpos, text: S.text.substring(S.tokpos), source:source, code: S.text});
	};

	function parse_text_error(err) {
		parse_error(err, {line: S.line, col: S.col, pos: S.pos, text: S.text.substring(S.pos), source:source, code: S.text});
	};

	function next(signal_eof) {
		var ch = S.text.charAt(S.pos++);
		if (signal_eof && !ch)
		throw EX_EOF;
		if (ch == "\n") {
			++S.line;
			S.col = 0;
		} else {
			++S.col;
		}
		return ch;
	};

	function eof() {
		return ! S.peek();
	};

	function start_token() {
		S.tokline = S.line;
		S.tokcol = S.col;
		S.tokpos = S.pos;
	};

	function read_while(pred) {
		var ret = "",
		ch = peek(),
		i = 0;
		while (ch && pred(ch, i++)) {
			ret += next();
			ch = peek();
		}
		return ret;
	};


	function read_text() {
		var str = read_while(function(ch) {
			if (ch == '}') parse_text_error('Unexpected "}" in text block');
			return ch != '{';
		});

		var type = str.match(/^\s*$/) ? 'whitespaces' : 'text';

		return token(type, create_node(TextNode, {
			text: str
		}));
	}

	function read_comment() {
		next();
		return with_eof_error("Unterminated comment",
		function() {
			var i = find("*}", true),
			//text = S.text.substring(S.pos, i),
			text = read_while(function() {
				return S.pos < i + 2;
			});

			return token("comment");
		});
	}

	function read_string() {
		return with_eof_error("Unterminated string constant",
		function() {
			var quote = next(),
			ret = "";
			for (;;) {
				var ch = next(true);
				if (ch == "\\") {
					ch += next(true);
				}
				else if (ch == quote) break;
				ret += ch;
			}
			return quote + ret + quote;
		});
	};

	// Security issue: Don't pass anything like 'gtpl=null'
	function check_js_expression(js_string) {
		var error = config.check_js_expression_function(js_string);
		if(error) {
			throw parse_statement_error("Javascript Expression check failed:" + error);
		}
	}


	function read_js_expression_until_bracket(prefix, suffix) {
		//javascript expression, terminated with a '}'
		return with_eof_error("Unbalanced brackets",
		function() {
			skip_whitespace();
			if(peek()=='}')
				parse_statement_error('Javascript expression expected');
			var level = 0,
			ret = prefix || '';
			for (;;) {

				if (peek() == '"' || peek() == "'")
				ret += read_string();

				var ch = peek();
				//var ch = next(true);
				if (ch == '}' && level == 0) break;
				if (ch == '}')--level;
				if (ch == '{') {
					//if(peek(1) == '/')
					//       parse_statement_error('Unexpected beginning of Closing Statement (or unallowed regexp)');
					++level;
				}
				ret += next(true);
			}
			ret += suffix || '';
			check_js_expression(ret);
			return ret;
		});
	}

	function read_js_primitive_literal_until_bracket() {
		//primitive literal, terminated with a '}'
		return with_eof_error("Unbalanced brackets",
		function() {
			var ret = '';

			skip_whitespace();
			if(peek()=='}')
				parse_statement_error('Javascript primitive literal expected');

			if (peek() == '"' || peek() == "'") {
				ret += read_string();
			}
			else {
				ret = read_while(function(ch) {
					return !is_whitespace_char(ch) && ch !== '}';
				});
				if(ret === '' || (ret !== 'null' && ret !== 'true' && ret !== 'false' && isNaN(Number(ret))))
					parse_statement_error('Javascript primitive literal expected');
			}
			return ret;
		});
	}

	function read_js_objectliteral() {
		if (next(true) != '{')
		parse_statement_error('Object literal expected');
		//next(true);
		var probe = 'var _temp_ = {___prObe___:null,';
		//to ensure the expression is a objliteral: "{var i = 0;}" would also be a valid expression
		var block = read_js_expression_until_bracket(probe, '}');
		next(true);
		// '}'
		return '{' + block.substring(probe.length);
	}

	function read_statement_tail() {
		skip_whitespace();
		var ch = next(true);
		if (ch != '}')
		parse_statement_error('Invalid character before end of statement: "' + ch + '"');
	}

	function read_delim_statement(keyword) {
		read_statement_tail();
		return token(keyword, create_node(TextNode, {
			text: (keyword == 'ldelim' ? '{': '}')
		}));
	}

	function read_simple_statement(keyword, node_type) {
		read_statement_tail();

		if (node_type)
		return token(keyword, create_node(node_type, {}));
		else
		return token(keyword);
	}

	function read_if_statement(keyword) {
		skip_whitespace();
		var cond = read_js_expression_until_bracket();
		read_statement_tail();
		return token(keyword, create_node(IfNode, {
			cond: cond
		}));
	}

	function read_name() {
		var ch = peek();
		var ret = '';
		if (!is_identifier_char(ch) || is_digit(ch))
		parse_statement_error('Invalid character in name: "' + ch + '"');

		while (is_identifier_char(ch)) {
			next(true);
			ret += ch;
			ch = peek();
		}

		return ret;
	}

	function peek_name() {
		var i = 0;
		var ch = peek(i);
		var ret = '';
		if (!is_identifier_char(ch) || is_digit(ch))
		return false;

		while (is_identifier_char(ch)) {
			ret += ch;
			ch = peek(++i);
		}

		return ret;
	}

	function check_reserved_name(str,use_whitelist) {
		if(use_whitelist && KEYWORD_WHITELIST[str]) {
			return;
		}

		if(INSTRUCTION_KEYWORDS[str] || DELIM_KEYWORDS[str] ||
				LITERAL_KEYWORD == str || RESERVED_GTPL_ATTRIBUTES[str] || RESERVED_JAVASCRIPT_KEYWORDS[str] ||
				str == config.root_designator || str == config.param_designator || str == config.global_root_designator) {
			parse_statement_error('Forbidden or unexpected identifier: "' + str + '"');
		}
	}

	function read_container_name() {
		var name= read_name();
		check_reserved_name(name,false);
		return name;
	}

	function read_template_name() {
		var parts = [];
		var global_namespace = true;

		if (peek() != '.') {
			global_namespace = false;
			var name = read_name();
			check_reserved_name(name);
			parts.push(name);
		}

		while (peek() == '.') {
			next(true);
			var name = read_name();
			check_reserved_name(name,true);
			parts.push(name);
		}
		return [global_namespace,parts];
	}


	function read_template_statement() {
		skip_whitespace();
		if(peek() == '}')
			parse_statement_error('Template name expected');
		var template_struct = read_template_name();
		read_statement_tail();
		return token('template', create_node(TemplateNode, {
			use_namespace : template_struct[0],
			template_name: template_struct[1]
		}));
	}

	function read_namespace_statement() {
		skip_whitespace();
		if(peek() == '}')
			parse_statement_error('Namespace name expected');
		var template_struct = read_template_name();
		if(template_struct[0]) {
			parse_statement_error('Namespace name must not begin with "."');
		}

		read_statement_tail();
		return token('namespace', {
			namespace: template_struct[1]
		});
	}

	function read_assignment(read_lhs, read_rhs) {
		var lhs = read_lhs();
		skip_whitespace();

		var ch = next(true);
		if (ch != '=')

		parse_statement_error('Unexpected character in assignment: "' + ch + '"');

		skip_whitespace();

		var rhs = read_rhs();

		return [lhs, rhs];
	}

	function read_call_statement(with_body) {
		var root = config.root_designator;

		skip_whitespace();

		if(peek() == '}')
			parse_statement_error('Template name expected');

		var template_struct = read_template_name();

		skip_whitespace();

		if (peek_name() =='root') {
			root = read_assignment(read_name, read_js_expression_until_bracket)[1];
		}

		read_statement_tail();

		return token(with_body ? 'Call':'call', create_node(CallNode, {
			template_name: template_struct[1],
			use_namespace: template_struct[0],
			root: root,
			with_body: with_body
		}));
	}

	function read_yield_statement(with_body) {
		var yield_name = null;
		var fallback = [null,null];
		var root = config.root_designator;

		skip_whitespace();

		if(peek() == '}') {
			parse_statement_error('Yield name expected');
		}
		
		yield_name = read_container_name();

		skip_whitespace();

		if (peek_name() =='fallback') {
			fallback = read_assignment(read_name, read_template_name)[1];
			skip_whitespace();
		}

		if (peek_name() =='root') {
			root = read_assignment(read_name, read_js_expression_until_bracket)[1];
		}

		read_statement_tail();

		return token(with_body? 'Yield' : 'yield', create_node(YieldNode, {
			yield_name: yield_name,
			root: root,
			use_fallback: fallback[1] !== null,
			template_name: fallback[1],
			use_namespace: fallback[0],
			with_body: with_body
		}));
	}

	function read_container_statement() {
		skip_whitespace();

		if(peek() == '}')
			parse_statement_error('Container assignment expected');


		var assignment = read_assignment(read_container_name, read_template_name);

		read_statement_tail();

		return token('container', create_node(ContainerNode, {
			yield_name: assignment[0],
			template_name: assignment[1][1],
			use_namespace: assignment[1][0]
		}));
	}

	function read_inline_container_statement() {
		skip_whitespace();

		if(peek() == '}')
			parse_statement_error('Inline container name expected');


		var container_name = read_container_name();
		var use_yield_root = null;

		skip_whitespace();

		if(peek_name() === 'use_yield_root') {
			val = read_assignment(read_name, read_name)[1];
			if (val != 'yes' && val != 'no')
				parse_statement_error("use_yield_root=[yes|no] expected");
			use_yield_root = val == 'yes';
		}

		if(use_yield_root === null) {
			use_yield_root = config.use_yield_root;
		}

		read_statement_tail();

		return token('Container', create_node(InlineContainerNode, {
			container_name: container_name,
			use_yield_root : use_yield_root
		}));
	}



	function read_param_statement() {
		skip_whitespace();

		if(peek() == '}')
			parse_statement_error('Param assignment expected');

		var assignment = read_assignment(read_name, read_js_expression_until_bracket);
		read_statement_tail();

		return token('param', create_node(ParamNode, {
			name: assignment[0],
			value: assignment[1]
		}));
	}

	function read_meta_statement() {
		skip_whitespace();

		if(peek() == '}')
			parse_statement_error('Meta assignment expected');

		var assignment = read_assignment(read_name, read_js_primitive_literal_until_bracket);
		read_statement_tail();

		return token('meta', {
			name: assignment[0],
			value: assignment[1]
		});
	}


	function read_foreach_statement() {
		skip_whitespace();
		var iter = read_name();
		check_reserved_name(iter);

		if (!iter || !is_whitespace_char(next(true)))
		parse_statement_error('invalid iterator name');

		skip_whitespace();

		if (read_name() != 'in')
		parse_statement_error('"in" expected after iterator name');

		if (!is_whitespace_char(next()))
		parse_statement_error('Syntax Error');
		skip_whitespace();

		var expr = read_js_expression_until_bracket();
		read_statement_tail();
		return token('foreach', create_node(ForeachNode, {
			iter: iter,
			expr: expr
		}));
	}

	function read_cycle_statement() {
		skip_whitespace();

		var expr = read_js_expression_until_bracket();
		read_statement_tail();
		return token('cycle', create_node(CycleNode, {
			expr: expr
		}));
	}

	function read_eval_statement() {
		var double_bracket_mode = false;
		if(peek() == '{' && config.double_bracket_evals) {
			double_bracket_mode = true;
			next();
		}

		var expr = read_js_expression_until_bracket();
		read_statement_tail();

		if(double_bracket_mode && next(true) != '}')
			parse_statement_error('One more closing bracket expected.');


		return token('eval', create_node(EvalNode, {
			expr: expr,
			double_bracket_mode: double_bracket_mode
		}));
	}

	function read_statement() {
		return with_eof_error("Unbalanced brackets",
		function() {
			var keyword_candidate = peek_name();

			if (Object.prototype.hasOwnProperty.call(INSTRUCTION_KEYWORDS, keyword_candidate)) {

				read_name();
				if(!is_whitespace_char(peek()) && !peek() == '}')
					parse_statement_error('Syntax Error');

				switch (keyword_candidate) {
				case 'template':
					return read_template_statement();
				case 'if':
					return read_if_statement(keyword_candidate);
				case 'elseif':
					return read_if_statement(keyword_candidate);
				case 'else':
					return read_simple_statement('else');
				case 'foreach':
					return read_foreach_statement();
				case 'break':
					return read_simple_statement('break', BreakContNode);
				case 'continue':
					return read_simple_statement('continue', BreakContNode);
				case 'call':
					return read_call_statement(false);
				case 'Call':
					return read_call_statement(true);
				case 'yield':
					return read_yield_statement(false);
				case 'Yield':
					return read_yield_statement(true);
				case 'ifempty':
					return read_simple_statement('ifempty');
				case 'param':
					return read_param_statement();
				case 'container':
					return read_container_statement();
				case 'Container':
					return read_inline_container_statement();
				case 'cycle':
					return read_cycle_statement();
				case 'namespace':
					return read_namespace_statement();
				case 'meta':
					return read_meta_statement();
				}
				//token_name = keyword_candidate;
				//skip_whitespace();
			}
			else if (keyword_candidate == LITERAL_KEYWORD) {
				read_name();
				if(!is_whitespace_char(peek()) && !peek() == '}')
					parse_statement_error('Syntax Error');
				return read_literal_statement();
			}
			else if (Object.prototype.hasOwnProperty.call(DELIM_KEYWORDS, keyword_candidate)) {
				read_name();
				if(!is_whitespace_char(peek()) && !peek() == '}')
					parse_statement_error('Syntax Error');

				return read_delim_statement(keyword_candidate);
			}

			// Default: Eval Statement
			return read_eval_statement();
		});
	}

	function read_closing_statement() {
		if (next() != '/')
		parse_statement_error('Closing delimiter ("/") expected');

		var keyword_candidate = read_while(is_alphanumeric_char);

		if (keyword_candidate == LITERAL_CLOSING_KEYWORD)
		parse_statement_error('Unexpected Closing Literal Statement');
		if (!Object.prototype.hasOwnProperty.call(INSTRUCTION_CLOSING_KEYWORDS, keyword_candidate)) {
			if( keyword_candidate == 'call' || keyword_candidate == 'yield')
				parse_statement_error('Unknown Closing Statement, you may want to use {Call}{/Call} or {Yield}{/Yield}');
			else
				parse_statement_error('Unknown Closing Statement');
		}

		read_statement_tail();

		return token(keyword_candidate, null, true);
	}

	function read_literal_statement() {
		read_statement_tail();

		return with_eof_error("Unterminated literal statement",
		function() {
			var index = find('{/' + LITERAL_KEYWORD, true),
			text = read_while(function() {
				return S.pos < index;
			});

			for (var i = 0; i < 2 + LITERAL_KEYWORD.length; ++i) next();

			read_statement_tail();

			return token("literal", create_node(TextNode, {
				text: text
			}));
		});

	}

	function find(what, signal_eof) {
		var pos = S.text.indexOf(what, S.pos);
		if (signal_eof && pos == -1) throw EX_EOF;
		return pos;
	};

	function handle_bracket() {
		next();
		var ch = peek();
		if (ch == '*')
		return read_comment();

		if (ch == '/')
		return read_closing_statement();

		return read_statement();
	}

	function with_eof_error(eof_error, cont) {
		try {
			return cont();
		} catch(ex) {
			if (ex === EX_EOF) parse_statement_error(eof_error);
			else throw ex;
		}
	}


	function next_token() {
		start_token();
		var ch = peek();
		if (!ch) return token("eof");
		if (ch == '{') return handle_bracket();
		return read_text();
		//parse_statement_error("Unexpected character '" + ch + "'");
	};

	return next_token;
};

gtpl.tokenizer = tokenizer;

/*
 * Build Template Scope
 */
(function() {
	var S={};

	gtpl.buildTemplate = function($TEXT,config,source) {
		S = {
			input: tokenizer($TEXT, config, source),
			token: null,
			in_param_body: false,
			in_loop: 0,
			iternames : [],
			namespace: [],
			current_param_and_container_scope: {}
		};
		S.token = next();

		var templates = [];
		while (!eof()) {
			if(is('whitespaces')) {
				next();
				continue;
			}
			expect(is('template') || is('namespace'),'{template} or {namespace} statement expected');
			if(is('namespace'))
				S.namespace = S.token.namespace;
			else {
				templates.push(build_node(S.token));
			}
			next();
		}
		return templates;
	};

	function next(dont_skip_comments) {
		S.token = S.input();
		if (!dont_skip_comments && S.token.type == "comment")
		return next();

		return S.token;
	};

	function build_node() {
		if (S.token.close == true)
			unexpected();

		return S.token.build();
	}

	function is_standard_statement() {
		if (S.token.close == true)
			parse_error('Unexpected Closing Statement',S.token);

		switch (S.token.type) {
		case "text":
		case "literal":
		case "ldelim":
		case "rdelim":
		case "call":
		case "yield":
		case "Call":
		case "Yield":
		case "eval":
		case "cycle":
			return !S.in_param_body;
		case "container":
		case "Container":
			return S.in_param_body;
		case "if":
		case "foreach":
		case "param":
		case "whitespaces":
			return true;
		case "break":
		case "continue":
			return S.in_loop > 0;
		default:
			return false;
		}
	}

	function unexpected() {
		if (S.token.type == 'eof')
		parse_error('Unexpected EOF', S.token);
		else
		parse_error('Unexpected Statement', S.token);
	}

	function close(type) {
		return S.token.type == type && S.token.close == true;
	}

	function is(type) {
		return S.token.type == type && !S.token.close;
	}

	function eof() {
		return S.token.type == 'eof';
	}

	function expect(cond, err) {
		if (!cond) {
			err = err || '';
			if(eof())
				parse_error('Unexpected EOF. ' + err, S.token);
			else if(S.in_param_body)
				parse_error('Unexpected Statement in {Call} or {Yield} context. ' + err, S.token);
			else
				parse_error('Unexpected Statement. ' + err, S.token);
		}
	}

	function concat_namespace(node) {
		if(node.use_namespace) {
			if(!S.namespace.length)
				parse_error('No namespace defined.', node);
			node.template_name = S.namespace.concat(node.template_name);
		}
	}

	TemplateNode.prototype.build = function() {
		this.nodes = [];
		this.meta_nodes = [];
		this.namespace = S.namespace;

		this.contains_param_node=false;
		this.contains_container_node=false;

		S.current_param_and_container_scope = this;

		concat_namespace(this);

		next();

		//read meta nodes and ignore interposed whitespaces
		while (is('meta') || is('whitespaces')) {
			if(is('meta')) {
				this.meta_nodes.push(S.token);
				this.nodes = [];
			}
			else {
				this.nodes.push(build_node());
			}
			next();
		}

		while (!close('template')) {
			expect(is_standard_statement(),'Missing "{/template}"?');
			this.nodes.push(build_node());
			next();
		}

		//add end of closing template token position 
		this.last_pos = S.token.pos + S.token.full.length;
		this.last_line = S.token.line;

		return this;
	};

	IfNode.prototype.build = function() {
		this.true_branch = [];
		this.false_branch = [];

		next();
		while (!close('if') && !is('elseif') && !is('else')) {
			expect(is_standard_statement(),'Missing "{/if}"?');
			this.true_branch.push(build_node());
			next();
		}
		if (is('elseif')) {
			this.with_elseif = true;
			this.false_branch.push(build_node());
		}
		else if (is('else')) {
			next();
			while (!close('if')) {
				expect(is_standard_statement(),'Missing "{/if}"?');
				this.false_branch.push(build_node());
				next();
			}
		}

		return this;
	};

	ForeachNode.prototype.build =function() {
		this.nodes = [];
		this.ifempty_nodes = [];

		for(var i = 0; i< S.iternames.length; ++i) {
			if(this.iter == S.iternames[i])
				parse_error('Unallowed shadowing of iterator name "'+ this.iter + '".', S.token);
		}

		S.in_loop++;
		S.iternames.push(this.iter);

		next();
		while (!close('foreach') && !is('ifempty')) {
			expect(is_standard_statement(),'Missing "{/foreach}"?');
			this.nodes.push(build_node());
			next();
		}

		S.in_loop--;

		if (is('ifempty')) {
			next();
			while (!close('foreach')) {
				expect(is_standard_statement(),'Missing "{/foreach}"?');
				this.ifempty_nodes.push(build_node());
				next();
			}
		}

		S.iternames.pop();

		return this;
	};

	YieldNode.prototype.build =
	CallNode.prototype.build = function() {
		if(this.type == 'call' || this.type == 'Call' || this.use_fallback) {
			concat_namespace(this);
		}
		if (this.with_body) {
			var outside_param_and_container_scope = S.current_param_and_container_scope;
			S.current_param_and_container_scope = this;
			S.in_param_body = true;

			next();

			this.nodes = [];
			while (!close(this.type)) {
				expect(is_standard_statement()); // respects in_param_body mode
				this.nodes.push(build_node());
				next();
			}

			S.in_param_body = false;
			S.current_param_and_container_scope = outside_param_and_container_scope;
		}
		return this;
	};

	ParamNode.prototype.build = function(){
		S.current_param_and_container_scope.contains_param_node = true;
		return this;
	};

	ContainerNode.prototype.build = function(){
		concat_namespace(this);
		S.current_param_and_container_scope.contains_container_node = true;
		return this;
	};

	InlineContainerNode.prototype.build = function() {
		S.current_param_and_container_scope.contains_container_node = true;

		var outside_current_param_and_container_scope = S.current_param_and_container_scope;
		S.current_param_and_container_scope = this;

		next();
		S.in_param_body = false;

		this.contains_param_node=false;
		this.contains_container_node=false;

		this.nodes = [];
		while(!close(this.type)) {
			expect(is_standard_statement(),'Missing "{/Container}"?');
			this.nodes.push(build_node());
			next();
		}

		S.in_param_body = true;
		S.current_param_and_container_scope = outside_current_param_and_container_scope;

		return this;
	};

	TextNode.prototype.build = function(){
		if(is('whitespaces') && S.in_param_body)
			this.ignore = true;
		return this;
	};

	BreakContNode.prototype.build = function(){return this;};
	CycleNode.prototype.build = function(){return this;};
	EvalNode.prototype.build = function(){return this;};
})();


/*
 * Compile Template Scope
 */
(function() {
	var config,source;

	gtpl.compile = function(template_node,config_,source_) {
		config = config_;
		source = source_;
		return template_node.compile();
	};

	TemplateNode.prototype.compile = function(d) {
		d = d || 0;

		var function_name = get_full_template_string(this.template_name);

		var res = TAB(d) + format('{0} = function __myself__({1}, {2}, {3}, __sb__, __containers__, __cycle__) {' ,
			function_name,
			config.root_designator,
			config.param_designator,
			config.global_root_designator) + LB;


		res += TAB(d+1) + format('var __output__ = __sb__ || new {0}();',
			config.string_builder_function_name) + LB; 

		if(config.embed_functions) {
			res += TAB(d+1) + format('var __clone__ = {0};', gtpl.clone.toString()) + LB;

			if(config.escape_evals)
				res += TAB(d+1) + format('var __escapeEval__ = {0};', config.escape_eval_function) + LB;
		}

		res += TAB(d+1) + compose_argument_init_statement(this.contains_container_node, '__containers__') + LB;
		res += TAB(d+1) + compose_argument_init_statement(this.contains_param_node, config.param_designator) + LB;

		res += TAB(d+1) + format('{0} = {0} || {1};',
			config.global_root_designator,
			config.root_designator) + LB;

		if(config.provide_root_keys) {
			res += TAB(d+1) + format('with((typeof {0} == "object" && {0}) ? {0} : {}) {',
				config.root_designator) + LB;
			++d;
		}

		for(var i=0;  i < this.nodes.length; ++i) {
			res += this.nodes[i].compile(d+1);
		}

		if(config.provide_root_keys) {
			res += TAB(d+1) + '}' + LB;
			--d;
		}

		res += TAB(d+1) + 'if (!__sb__) return __output__.toString();' + LB;
		res += TAB(d) + '};' + LB;

		if(config.add_metaobject) {
			res += TAB(d) + format('{0}.__meta__ = {};', function_name) + LB;
			for(var j=0; j< this.meta_nodes.length; ++j) {
				res += TAB(d) + format('{0}.__meta__["{1}"]={2};' + LB,
					function_name,
					this.meta_nodes[j].name,
					this.meta_nodes[j].value);
			}
		}

		if(config.introspection_mode == 'names') {
			res += TAB(d) + format('{0}.__self__ = {name: "{1}", namespace: "{2}"};', 
				function_name, this.template_name.join('.'), this.namespace.join('.')) + LB;
		}
		else if(config.introspection_mode == 'full') {
			res += TAB(d) + format('{0}.__self__ = {name: "{1}", namespace: "{2}", source: "{3}", pos_start: {4}, pos_end: {5}, line_start: {6}, line_end: {7}, code: "{8}"};', 
				function_name, this.template_name.join('.'), this.namespace.join('.'), this.source, this.pos, this.last_pos, this.line, this.last_line,
				this.code.split('\n').slice(Math.max(0,this.line-1-gtpl.CODE_DEBUG_OFFSET),this.last_line+gtpl.CODE_DEBUG_OFFSET).join('\n')
				.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\t/g,'\\t')) + LB;
		}

		return res;
	};

	TextNode.prototype.compile = function(d) {
		var text = this.text;
		if(this.ignore)
			return '';

		if(config.truncate_whitespaces === 'relaxed') // Todo: testcases
			text = text.replace(/^\s*\n\s*/,' ').replace(/\s*\n\s*$/,' ');
		else if(config.truncate_whitespaces === 'aggressive')
			text = text.replace(/\s*\n\s*/g,' ');

		text = text.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\t/g,'\\t');

		if(text.length) //Todo: testcases
			return TAB(d) + format("__output__.append( '{0}' );", text) + LB;
		else
			return '';
	};

	EvalNode.prototype.compile = function(d) {
		if(config.escape_evals && !this.double_bracket_mode)
			return TAB(d) + format('__output__.append( __escapeEval__( {0} ));', compose_evaluation_code(this.expr,this)) + LB;
		else
			return TAB(d) + format('__output__.append( {0} );', compose_evaluation_code(this.expr,this)) + LB;
	};

	IfNode.prototype.compile = function(d) {
		var res = '';
		if(config.debug_evals) {
			res += TAB(d) + '(function() {' + LB;
			d++;
			res += TAB(d) + format('var __cond__ = {0};', compose_evaluation_code(this.cond, this)) + LB;
			res += TAB(d) + 'if(__cond__) {' + LB;
		}
		else {
			res += TAB(d) + format('if( {0} ) {', this.cond) + LB;
		}

		for(var i=0, l=this.true_branch.length; i<l; ++i) {
			res += this.true_branch[i].compile(d + 1);
		}
		res += TAB(d) + '}' + LB;

		if(this.false_branch.length) {
			res += TAB(d) + 'else {' + LB;
			for(var j=0; j < this.false_branch.length; ++j) {
				res += this.false_branch[j].compile(d + 1);
			}
			res += TAB(d) + '}' + LB;
		}

		if(config.debug_evals) {
			d--;
			res += TAB(d) + '})();' + LB;
		}
		return res;
	};

	ForeachNode.prototype.compile = function(d) {
		var res = '';
		res += TAB(d) + format('(function({0}$list){',this.iter) + LB;

		if(config.debug_evals) {
			res += TAB(d+1) + compose_is_array_like_code(this.iter + '$list',this) + '' + LB;
		}

		res += TAB(d+1) + format('var {0}, {0}$first, {0}$last, {0}$index = 0, {0}$length = {0}$list.length;', this.iter) + LB; 
		res += TAB(d+1) + format('for(; {0}$index < {0}$length ; ++{0}$index) {', this.iter) + LB;
		res += TAB(d+2) + format('{0} = {0}$list[{0}$index];', this.iter) + LB;
		res += TAB(d+2) + format('{0}$first = {0}$index == 0;', this.iter) + LB;
		res += TAB(d+2) + format('{0}$last = {0}$index == {0}$length -1;', this.iter) + LB;

		if(config.debug_evals) {
			res += TAB(d+2) + 'try {' + LB;
			++d;
		}

		for(var i=0; i < this.nodes.length; ++i) {
			res += this.nodes[i].compile(d + 2);
		}

		if(config.debug_evals) {
			--d;
			res += TAB(d+2) + '} catch(e) {' + LB;
			res += TAB(d+3) + 'if(e instanceof BreakContinueException) {' + LB;
			res += TAB(d+4) + 'if(e.type == "break") return;' + LB;
			res += TAB(d+3) + '} else throw e;' + LB;
			res += TAB(d+2) + '}' + LB;
		}

		res += TAB(d+1) + '}' + LB;

		if(this.ifempty_nodes.length) {
			res += TAB(d+1) + format('if (!{0}$length) {', this.iter) + LB;
			for(var j=0; j<this.ifempty_nodes.length; ++j) {
				res += this.ifempty_nodes[j].compile(d + 2);
			}
			res += TAB(d+1) +'}' + LB;
		}
		res += TAB(d) + format('}({0}));', 
			compose_evaluation_code(this.expr,this)) + LB;
		return res;
	};

	BreakContNode.prototype.compile = function(d) {
		if(config.debug_evals) {
			return TAB(d) + format('throw new BreakContinueException("{0}");', this.type) + LB;
		}
		else
			return TAB(d) + this.type + ';' + LB;
	};

	CycleNode.prototype.compile = function(d) {
		var uid = 'c' + get_uid();
		var res = '';
		res =  TAB(d) + '__cycle__ = __cycle__ || {};' + LB;
		res += TAB(d) + format('if(!__cycle__["{0}"]) {', uid) + LB;
		res += TAB(d+1) + format('__cycle__["{0}"] = [ 0 , {1} ];', 
			uid,
			compose_evaluation_code(this.expr,this)) + LB;

		if(config.debug_evals)
			res += TAB(d+1) + compose_is_array_like_code(format('__cycle__["{0}"][1]', uid),this) + LB;

		res += TAB(d) + '}' + LB;
		res += TAB(d) + format('__output__.append( __cycle__["{0}"][1][__cycle__["{0}"][0]++ % __cycle__["{0}"][1].length]);', uid) + LB;

		return res;
	};

	CallNode.prototype.compile = function(d) {
		//XXX this.with_body mode missing
		var res = '';
		var function_name = get_full_template_string(this.template_name);

		if(config.debug_calls) {
			res += TAB(d+1) + compose_template_exist_call(function_name,this) + LB;
		}

		if(this.with_body) {
			res += TAB(d) + format('(function({0}, __containers__) {', config.param_designator) + LB;
			res += TAB(d+1) + compose_argument_init_statement(this.contains_container_node, '__containers__') + LB;
			res += TAB(d+1) + compose_argument_init_statement(this.contains_param_node, config.param_designator) + LB;

			for(var j=0; j<this.nodes.length; ++j) {
				res += this.nodes[j].compile(d+1);
			}

			res += TAB(d+1) + format('{0} ({1}, {2}, {3}, __output__, __containers__);',
				function_name,
				compose_evaluation_code(this.root,this),
				config.param_designator,
				config.global_root_designator) + LB;	

			res += TAB(d) + format('}( {0}, {1} ));', 
			config.keep_params ? config.param_designator : '{}',
			config.keep_containers ? '__containers__' : '{}' ) + LB; 
		}
		else {
			res += TAB(d) + format('{0} ({1}, {2}, {3}, __output__, {4});',
				function_name,
				compose_evaluation_code(this.root,this),
				config.keep_params ? config.param_designator : '{}',
				config.global_root_designator,
				config.keep_containers ? '__containers__' : '{}' ) + LB;
		}

		return res;
	};

	YieldNode.prototype.compile = function(d) {
		var res = '';

		if(this.use_fallback) {
			var fallback_function_name = get_full_template_string(this.template_name);
			var fallback_do_nothing = (get_full_template_string([config.empty_template_name]) == fallback_function_name);
		}
		if(config.debug_calls) {
			if(this.use_fallback) {
				if(!fallback_do_nothing)
					res += TAB(d) + compose_template_exist_call(fallback_function_name,this) + LB;
			}
			else
				res += TAB(d) + compose_container_exist_call(format('__containers__["{0}"]',this.yield_name),this) + LB;
		}

		if(this.with_body) {
			res += TAB(d) + format('(function({0}, __containers__) {', config.param_designator) + LB;

			if(this.use_fallback && fallback_do_nothing) //this may be solved more elegant
				res += TAB(d+1) + 'if(!arguments[2]) return;';

			res += TAB(d+1) + compose_argument_init_statement(this.contains_container_node, '__containers__') + LB;
			res += TAB(d+1) + compose_argument_init_statement(this.contains_param_node, config.param_designator) + LB;

			for(var j=0; j<this.nodes.length; ++j) {
				res += this.nodes[j].compile(d+1);
			}
			res += TAB(d+1) + format('arguments[2] ( {0}, {1}, {2}, __output__, __containers__);',
				compose_evaluation_code(this.root,this),
				config.param_designator,
				config.global_root_designator) + LB;
			res += TAB(d) + format('}( {0}, {1}, __containers__[ "{2}" ] || {3} ));',
			config.keep_params? config.param_designator : '{}',
			config.keep_containers?'__containers__':'{}',
			this.yield_name,
			(this.use_fallback && !fallback_do_nothing) ? fallback_function_name : 'undefined' ) + LB;
		}
		else {
			var function_call_body = format('{0}, {1}, {2}, __output__, {3}',
				compose_evaluation_code(this.root,this),
				config.keep_params? config.param_designator : '{}',
				config.global_root_designator,
				config.keep_containers?'__containers__':'{}');

			if(this.use_fallback) {
				res += TAB(d) + format('if(__containers__[ "{0}" ])', this.yield_name) + LB;
				res += TAB(d+1) + format('__containers__[ "{0}" ]( {1} );', this.yield_name, function_call_body) + LB;
				if(!fallback_do_nothing) {
					res += TAB(d) + 'else' + LB;
					res += TAB(d+1) + format('{0}( {1} );', fallback_function_name, function_call_body) + LB;
				}
			}
			else {
				res += TAB(d) + format('__containers__[ "{0}" ]( {1} )', this.yield_name, function_call_body) + LB;
			}
		}

		return res;
	};

	ParamNode.prototype.compile = function(d) {
		return TAB(d) + format('{0}[ "{1}" ] = {2};', config.param_designator, this.name, compose_evaluation_code(this.value,this)) + LB;
	};

	ContainerNode.prototype.compile = function(d) {
		var res = '';
		var template_name = get_full_template_string(this.template_name);

		if(config.debug_calls) {
			res += TAB(d) + compose_template_exist_call(template_name,this) + LB;
		}

		res += TAB(d) + format('__containers__[ "{0}" ] = {1};', this.yield_name, template_name) + LB;
		return res;
	};

	InlineContainerNode.prototype.compile = function(d) {
		var res = '';

		res += TAB(d) + format('__containers__[ "{0}" ] = function({1}, {2}, {3}, __yield_sb__, __containers__, __cycle__) {' ,
			this.container_name,
			this.use_yield_root ? config.root_designator : config.yield_root_designator,
			this.use_yield_root ? config.param_designator : config.yield_param_designator,
			config.global_root_designator) + LB;


		res += TAB(d+1) + compose_argument_init_statement(this.contains_container_node, '__containers__') + LB;
		res += TAB(d+1) + compose_argument_init_statement(this.contains_param_node, config.param_designator) + LB;

		for(var i=0;  i < this.nodes.length; ++i) {
			res += this.nodes[i].compile(d+1);
		}

		res += TAB(d) + '};' + LB;

		return res;
	};


	function get_full_template_string(template_name) {
		var res  =  '';
		if(config.namespace_root)
			res += config.namespace_root + '.';

		res += template_name.join('.');
		return res;
	}

	function compose_container_exist_call(container_expr, token) {
		return format('if( !{0} ) throw new TemplateUnknownTemplateError("Container not defined: {1}", {2});',
			container_expr,
			token.yield_name,
			compose_token_object(token));
	}

	function compose_template_exist_call(full_template_name, token) {
		return format('try{ if(!({0} instanceof Function)) throw {}; } catch(e) {throw new TemplateUnknownTemplateError("Template not found: \\"{0}\\"", {1}); }', 
			full_template_name, 
			compose_token_object(token));
	}

	function compose_is_array_like_code(iter,token) {
		//strings are not supported by IE
		//todo: add support for iterable dom elements,
		return format('if(typeof({0}) != "object" || {0} === null || typeof({0}.length) != "number") throw new TemplateNoArrayLikeError("Expression not arrayLike", {1});', 
			iter,
			compose_token_object(token));
	}

	function compose_evaluation_code(expr, token) {
		if(config.debug_evals) {
			var catch_str;
			if(config.embed_eval_errors && token.type == 'eval') {
				catch_str = format('return (new TemplateEvaluationError(e, {0})).toString();', compose_token_object(token));
			}
			else {
				catch_str = format('throw new TemplateEvaluationError(e, {0});', compose_token_object(token));
			}

			var undef_str = '';
			if(config.debug_undefined_evals && token.type == 'eval') {
				if(config.embed_eval_errors) {
					undef_str = format("if(__temp__ === undefined) return new TemplateUnexpectedUndefinedError('Expression evaluates to undefined.', {0}).toString();", compose_token_object(token));
				}
				else {
					undef_str = format("if(__temp__ === undefined) throw new TemplateUnexpectedUndefinedError('Expression evaluates to undefined.', {0});", compose_token_object(token));
				}
			}

			return format("(function(){ var __temp__; try { eval('__temp__ = {0}'); } catch(e) { {1} } {2} return __temp__;}())",
				expr.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\s/g," "),
				catch_str,
				undef_str);
		}

		else
			return expr;
	}

	function compose_token_object(token) {
		return format('{"line":{0}, "col":{1}, "pos":{2}, "text":"{3}", "source":"{4}", "root":{5}, "params":{6}, "containers":__containers__, "myself":__myself__}', 
			token.line,
			token.col,
			token.pos,
			token.full.substring(token.tokpos, 30).replace(/"/g,'\\"').replace(/\s/g," "),
			token.source,
			config.root_designator,
			config.param_designator);
	}

	function compose_argument_init_statement(with_clone,designator) {
		if(with_clone)
			return format('{0} = __clone__({0} || {});', designator);
		else
			return format('{0} = {0} || {};', designator);
	}

})();

})();

function get_uid() {
	return Math.floor(Math.random() * 100000000000);
}

function array_to_set(a) {
	var set = {};
	for(var item in a) {
		set[a[item]] = true;
	}
	return set;
}

var keys= Object.keys || function(obj) {var res = []; for(var key in obj) res.push(key); return res;};

function format(str /*, ... */) {
	var args = Array.prototype.slice.call(arguments,1);
	return str.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
}



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

function TemplateManager(__config__,__clone__, __external_namespaces__) {
	this.__config__ = __config__;

	//Template Scope vars (already set: all function arguments, all TemplateErrors)
	var __manager__ = this;
	var __templates__ = {};
	var __escapeEval__ = __config__.escape_eval_function;
	var gtpl; //shadowing, to disable access to module name in templates

	//Import external namespaces into local scope.
	if(__external_namespaces__ && __external_namespaces__.length) {
		eval(this.create_import_external_namespaces_code(__external_namespaces__));
	}

	this.__evalTemplates__ = function() {
		eval(arguments[0]);
	};
}

TemplateManager.prototype.create_import_external_namespaces_code = function(external_namespaces) {
	var eval_string = '';
	var source_ptr = '__external_namespaces__';

	for (var i = 0; i < external_namespaces.length; ++i) {
		for (var key in external_namespaces[i]) {
			eval_string += format('var {0} = {1}[{2}].{0};',
				key,
				source_ptr,
				i);
		}
	}
	return eval_string;
}

TemplateManager.prototype.add = function(input_string,source) {
	//Step 1: Build all ASTs
	var ASTs = gtpl.buildTemplate(input_string, this.__config__, source);

	for(var i = 0; i<ASTs.length; ++i) {
		var AST = ASTs[i];

		//Step 2: Translate all AST's to javascript code
		var compilation = gtpl.compile(AST, this.__config__, source);

		if(this.__config__.add_dynamic_script_url) {
			compilation += '\n//@ sourceURL=Template::'+AST.template_name.join('.') + (source? '::'+source:'');
		}

		//Step 3: Construct missing namespaces in template manager
		this.build_namespace(AST.template_name, AST);

		// Step 4: import template code into TemplateManager
		this.__evalTemplates__(compilation);
	}
};

TemplateManager.prototype.build_namespace = function(template_path, template_AST) {
	var namespace_path = template_path.slice(0,-1);
	var template_name = template_path.slice(-1)[0];
	var head  = this;
	var ns_nodename;

	for(var i = 0; i< namespace_path.length; ++i) {
		ns_nodename = namespace_path[i];

		if(head[ns_nodename] === undefined) {
			head[ns_nodename] = {};
		}
		if(typeof head[ns_nodename] === 'function') {
			if(this.__config__.overwrite_namespaces)
				head[ns_nodename] = {};
			else
				throw new TemplateNamespaceError("Subset of template namespace path already used as template function: " + template_path.join('.'), template_AST);
		}
		head = head[ns_nodename];
	}

	head = head[template_name];

	if(typeof head === 'object') {
		if(!this.__config__.overwrite_namespaces)
			throw new TemplateNamespaceError("Template name is already part of a namespace: " + template_path.join('.'), template_AST);
	}
	if(typeof head == 'function') {
		if(!this.__config__.overwrite_templates)
			throw new TemplateNamespaceError("Template already exists: " + template_path.join('.'), template_AST);
	}
};

TemplateManager.prototype.export_templates = function(/*namespace_string_or_list_or_undefined*/) {
	var that = this;
	var head = this;
	var namespace_path;

	if(arguments[0] === undefined)
		namespace_path = [];
	else if(typeof(arguments[0]) == 'string')
		namespace_path = arguments[0].split('.');
	else //array
		namespace_path = arguments[0];

	for(var i = 0; i<namespace_path.length; ++i) {
		if(head[namespace_path[i]] == undefined) {
			throw new TemplateNamespaceError("Export namespace is not defined: "+ namespace_path.join('.'));
		}
		head = head[namespace_path[i]];
	}


	function extract_templates(namespace_or_template , namespace_path) {
		var result = '';

		if(namespace_or_template instanceof Function) {
			result += format('__manager__.build_namespace("{0}".split("."));\n __manager__.{0} = {1};\n',
				namespace_path.join('.'),
				namespace_or_template.toString()
			);
			if(that.__config__.add_metaobject && JSON && JSON.stringify) {
				result += format('__manager__.{0}.__meta__ = {1};\n', 
					namespace_path.join('.'),
					JSON.stringify(namespace_or_template.__meta__));
			}
			if(that.__config__.introspection_mode && JSON && JSON.stringify) {
				result += format('__manager__.{0}.__self__ = {1};\n', 
					namespace_path.join('.'),
					JSON.stringify(namespace_or_template.__self__));
			}

		}
		else {
			for(var key in namespace_or_template) {
				if(namespace_or_template == that && (key == '__config__' || key == '__evalTemplates__' || !namespace_or_template.hasOwnProperty(key)))
					continue;

				result += extract_templates(namespace_or_template[key], namespace_path.concat(key));
			}
		}
		return result;
	}

	return extract_templates(head,namespace_path);
};

TemplateManager.prototype.import_templates = function(template_export_string, source) {
			this.__evalTemplates__(template_export_string);
};

gtpl.TemplateManager = TemplateManager;

})();
