# xplat-cli

Cross platform command line interface.

Creates a cli that can use nodejs command line, browser side stuff, and mooooore!

## API

an example is probably easier than a formal spec...

```
var cli = require('xplat-cli')();

cli
  .delimiter('>')
  .writeln('Welcome!')
  .command('get',function(arguments,done){
      var getProc = this;
      this.writeln('loading...');
      function dot(){
          getProc.write('.');
      }
      var timer = setInterval(dot,1000);
      setTimeout(function(){
          clearInterval(timer);
          getProc.writeln(' done!');
          done(null);
      }),5000)
  });
  
  // later
  cli.removeCommand('get')  
 
 ```
 
prompt()