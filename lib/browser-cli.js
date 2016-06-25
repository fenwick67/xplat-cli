// browser command line interface using same library

// this example uses some html selectors but honestly it would be arbitrary to use console.log for output, etc

module.exports = function(opts){
  opts=opts||{};
  /*
  opts is:
  {
    lineSelector:'',
    cursorSelector:'',
    termSelector:''
  }  
  */

  var line = document.querySelector(opts.lineSelector||'#term-line');
  var cursor = document.querySelector(opts.cursorSelector||'#term-cursor');
  var term = document.querySelector(opts.termSelector||'#term');
  var parent = term.parentElement;
  
  var outStream = {
    write:function(s){
      term.innerHTML = term.innerHTML + escapeHtml(s);//todo: handle color codes.  Later.      
      //scroll terminal
      parent.scrollTop = parent.scrollHeight;
    }
  }

  var inStream = {
    //lala
  }

  var cli = require('./all-cli-simple')(inStream,outStream); 
  
  line.addEventListener('keydown',function(e){
    if (e.key == 'Enter'){
      //don't print it... I guess???
      e.preventDefault();
      
      //get line
      var str = line.value;
      //write to terminal
      if(cli.rootCtx){
        outStream.write(cli.delimiterProp+str+'\n');
      }else{        
        outStream.write(str+'\n');
      }
      
      cli.onEnter(str);
      //erase line
      line.value = '';
    }
  });
  
  parent.addEventListener('click',snap);
  
  function snap(){
    //snap to the line
    line.focus();
  }
  
  cli.delimiter = function(dstr){
    var esc = escapeHtml(dstr.toString());
    cursor.innerHTML = esc;
    cli.delimiterProp = esc;
    return cli;
  }
  
  cli.delimiter(cli.delimiterProp);//use default for now until overridden
  
  return cli;
}

/*
  code below this was taken from moustache.js, which is really neat and MIT licensed.  Copyright info follows:
  
  The MIT License

  Copyright (c) 2009 Chris Wanstrath (Ruby)
  Copyright (c) 2010-2014 Jan Lehnardt (JavaScript)
  Copyright (c) 2010-2015 The mustache.js community

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}
