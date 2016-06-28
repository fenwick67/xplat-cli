// cli-node

/*
  Todo: implement cursor


*/
  var keypress = require('keypress');
  var util = require('util');

module.exports = function(opts){
  opts = opts || {};//unused right now

    // make `process.stdin` begin emitting "keypress" events 
  keypress(process.stdin);
  // listen for the "keypress" events 
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.name == 'c' && key.ctrl){
      process.exit();
    }    
    
    inStream.write(ch);//todo handle weird keycombos
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
  
  /*
  process.stdin.on('readable',function(){
    var chunk = process.stdin.read();
    if(!chunk){
      return;
    }
    s = s + ( chunk.toString().replace(/\r/g,'') );
    var brIndex = s.indexOf('\n');
    if ( brIndex > -1) {
      var before = s.substr(0,brIndex);
      cli.onEnter(before);
      s = s.substring(brIndex+1);
    }
  });
  */
  
  process.stdin.resume;
  
  return cli;
}
