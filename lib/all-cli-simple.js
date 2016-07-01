/*
todo:
use node's EventListener instead of stupid onX functions
 */

var parseArgs = require('minimist');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var ansiEscapes = require('ansi-escapes');

module.exports = function (inStream, outStream) {

	/*
	notes for implementer:

	you need to call cli.onEnter('str') when a user hits "enter" in your app.
	you need to implement handling the delimiter too

	 */

	var line = '';

	inStream.write = function (s) {
    
    if (self.currentProgram){
      self.currentProgram.emit('data',s);// emit a "data" event on the Program.
    }
    
		var s = (s || '').toString();

		if (self.lockedForKey(s)) {
			return;
		}

		if (s != '\n' && s != '\r') {
			line = line + s;
		} else {
			self.onEnter(line);
			line = '';
			return; // don't print when user hits Enter
		}

		// print to stdout?

		if (self.locked) {
			//console.log('locke');
			return;
		} else {
			outStream.write(s);
		}
	}

	var self = this;

	this.locked = false;

	// cursor lock
	this.cursorLock = {
		left : false,
		right : false,
		up : true,
		down : true
	}

	var _esc = String.fromCharCode(27); // escape character
	this.charMap = {
		left : _esc + '[D',
		right : _esc + '[C',
		down : _esc + '[B',
		up : _esc + '[A'
	}

	this.lockedForKey = function (s) {
		var ret = false;

		_.each(self.charMap, function (val, key) {
			if (val == s) {
				ret = self.cursorLock[key];
				return false;
			}
		});
		return ret;
	}

	this.setlocked = function (l) {
		self.locked = false;
		return self;
	}

	this.rootCtx = true; //are we in the root context?

	this.onEnter = function (s) {
		if (self.rootCtx) {
			self.rootCtx = false;
			self.runCommand(s, function (er) {
				//always exit app context
				self.rootCtx = true;
			});
		} else { //send to program
			if (!self.currentProgram) {
				console.log('woops');
				return; //something went very wrong
			} else {
				//console.log('wop');
				self.currentProgram.emit('enter', s);
			}
		}
	}

	this.writeDelim = function () {
		outStream.write('\r\n' + self.delimiterProp);
		outStream.write(ansiEscapes.cursorForward(self.delimiterLength));
	}

	var ready = false;
	var enqueued = [];
	this.ready = function () {
		ready = true;
		enqueued.forEach(function (cmd) {
			self.run(cmd);
		});
	}

	//external API for running commands
	this.run = function (cmd, cb) {
		if (!ready) {
			enqueued.push(cmd);
			return;
		}
		self.rootCtx = false;
		self.runCommand(cmd, function (er) {
			//always exit app context
			self.rootCtx = true;
		});
	}

	this.programs = {};
	this.currentProgram = null;
	this.delimiterProp = '?';
	this.deliterLength = 1;
	this.delimiter = function (d) {
		self.delimiterProp = d.toString();
		self.delimterLength = self.delimiterProp.length;
		return self;
	}

	this.command = function (name, fn) { //register a command
		var p = new Program(fn);
		oneOrMany(name, function (n) {
			self.programs[n] = p;
		});
		return self;
	}

	// alias "name(s)" to call "other"
	this.alias = function (name, other) {
		oneOrMany(name, function (n) {
			self.programs[n] = self.programs[other];
		});
		return self;
	}

	this.runCommand = function (str, done) {
		self.rootCtx = false; //in case this was called directly
		if (typeof str != 'string') {
			// todo run a _empty command
			invalidCommand(str);
			done(null);
			return self;
		}
		//command "str" was input into the cli
		var args = parseArgs(str.toString().split(' '));
		if (args._.length < 1) {
			done(null);
			return self;
		}

		if (Object.keys(self.programs).length > 0 && typeof args._[0] == 'string') {
			var pname = args._[0];

			if (!self.programs[pname]) {
				invalidCommand(pname);
				return done(null);
			}

			args._.shift(); //remove first arg
			self.currentProgram = self.programs[pname];
			var p = self.currentProgram;
			p.closed = false;
			p._run(args, _.once(function (er) {
					p.closed = true;
					self.writeDelim();
					done(er);
				}));
		} else {
			invalidCommand('<enter>');
			return done(null);
		}

	}

	function invalidCommand(str) {
		outStream.write('invalid command: "' + str + '"\n');
		self.writeDelim();
	}

	// create a program from a function.
	function Program(f) {
		EventEmitter.call(this);
		var program = this;
    
    this.cli = self;

		var spent = false;
		program._run = f;

		program.closed = false;

		program.write = function () {
			if (program.closed) {
				return program;
			}
			var len = arguments.length;
			for (var i = 0; i < len; i++) {
				outStream.write(arguments[i]);
			}
			return program;
		}

		program.writeln = function () {
			var len = arguments.length;
			for (var i = 0; i < len; i++) {
				program.write(arguments[i]);
			}
			program.write('\n');
			return program;
		}

		program.sendEnter = function (s) {
			program.emit('enter', s);
		}

		program.prompt = function (s, f) {
			program.write(s);
			program.once('enter', function (str) {
				f(str);
			});
		}
	}
	util.inherits(Program, EventEmitter);

	return this;
}

// function stub
function fs() {}

// do something for just one variable, or if it's an array, do it for each one
function oneOrMany(thing, fn) {
	if (typeof thing != 'string' && typeof thing.length == 'number') {
		for (var i = 0; i < thing.length; i++) {
			fn(thing[i]);
		}
	} else {
		fn(thing);
	}
}