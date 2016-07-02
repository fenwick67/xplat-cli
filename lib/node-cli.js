// cli-node

/*
  Todo: implement cursor


*/
  var keypress = require('keypress');
  var util = require('util');

  var _esc = String.fromCharCode(27);
  
module.exports = function(opts){
  opts = opts || {};//unused right now

    // make `process.stdin` begin emitting "keypress" events 
  keypress(process.stdin);
  // listen for the "keypress" events 
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.name == 'c' && key.ctrl){
      process.exit();
    }
        
    //console.log(key);
    inStream.write(ch|| (_esc + key.code) );//todo handle weird keycombos
  });
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
    
  var outStream = {
    write:function(s){
      process.stdout.write(s.toString());
    }
  }

  var inStream = {
    
  }

  var cli = require('./all-cli-simple')(inStream,outStream);

  var s = '';
  process.stdin.setEncoding('utf8');
  
  process.stdin.resume;
  
  cli.ready();
  
  return cli;
}
