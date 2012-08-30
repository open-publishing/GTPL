var gtpl = require('./gtpl.js');

var data = '';
var out = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	data += chunk;
});

process.stdin.on('end', function () {
	try{
		gtpl.buildTemplate(data,gtpl.DEFAULT_CONFIG);
	}
	catch(e) {
		var error = "line "+ e.line + " column " + e.col + " - Error: "  + e.message;
		process.stdout.write(error + '\n');
	}
});
