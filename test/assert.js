// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var assert = {};
try{
    require;
    assert=exports;
}
catch(e) {

}


if (!JSON) {
    var JSON = {};
    JSON.stringify = function(a) {return a;};
}


assert.AssertionError = function (options) {
    if (typeof options == "string")
        options = {"message": options};
    this.name = "AssertionError";
    this.message = options.message;
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = options.operator;
};

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}


assert.AssertionError.prototype = Object.create(Error.prototype);

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name+":", this.message].join(' ');
  } else {
    return [ this.name+":"
           , JSON.stringify(this.expected )
           , this.operator
           , JSON.stringify(this.actual)
           ].join(" ");
  }
};


function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

assert.fail = fail;

assert.ok = function ok(value, message) {
  if (!!!value) fail(value, true, message, "==", assert.ok);
};

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, "==", assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, "!=", assert.notEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, "===", assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as determined by !==.
// assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, "!==", assert.notStrictEqual);
  }
};

function _throws (shouldThrow, block, err, message) {
  var exception = null,
      threw = false,
      typematters = true;

  message = message || "";

  //handle optional arguments
  if (arguments.length == 3) {
    if (typeof(err) == "string") {
      message = err;
      typematters = false;
    }
  } else if (arguments.length == 2) {
    typematters = false;
  }

  try {
    block();
  } catch (e) {
    threw = true;
    exception = e;
  }

  if (shouldThrow && !threw) {
    fail( "Missing expected exception"
        + (err && err.name ? " ("+err.name+")." : '.')
        + (message ? " " + message : "")
        );
  }
  if (!shouldThrow && threw && typematters && exception instanceof err) {
    fail( "Got unwanted exception"
        + (err && err.name ? " ("+err.name+")." : '.')
        + (message ? " " + message : "")
        );
  }
  if ((shouldThrow && threw && typematters && !(exception instanceof err)) ||
      (!shouldThrow && threw)) {
    throw exception;
  }

  return exception;
};

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  return _throws.apply(this, [true, arguments[0],arguments[1],arguments[2]]);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  return _throws.apply(this, [false, arguments[0],arguments[1],arguments[2]]);
};