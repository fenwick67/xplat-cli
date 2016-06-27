// cli-node

/*
  Todo: implement cursor


*/

module.exports = function(opts){
  opts = opts || {};//unused right now

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
  process.stdin.resume;
  
  return cli;

}
