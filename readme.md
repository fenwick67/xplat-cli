# xplat-cli

Cross platform command line interface.

Creates a cli that can use nodejs command line, AND works in a browser with Browserify.

Inspired by [Vorpal](https://github.com/dthree/vorpal), which I couldn't get to work in a browser because it's so dependent on `tty` and `readline`.

## API

An example is probably easier than a formal spec.  Look at test/test.js for an example (also try out test/index.html, which is just browserified)

```
var cli = require('xplat-cli')();

cli
  .delimiter('>')// set the delimiter
  .command('get',function(arguments,done){// crate a command called "get"
      var program = this;
      program.writeln('loading...');
      function dot(){
          program.write('.');
      }
      var timer = setInterval(dot,1000);
      setTimeout(function(){
          clearInterval(timer);
          program.writeln(' done!');
          done(null);
      }),5000)
  });
  
 ```
 
## Notes
.delimiter doesn't work in terminal right now
