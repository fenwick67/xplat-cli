// browser command line interface using same library

// this example uses some html selectors but honestly it would be arbitrary to use console.log for output, etc


// set terminal buffer size to a reasonable number
var DEF_TERM_SIZE = 2000;
var AnsiToHtml = require('ansi-to-html');

var Convert = require('ansi-to-html');
var convert = new Convert({stream:true});


module.exports = function(opts){
  
  var termBufferSize = DEF_TERM_SIZE;
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
  
  var unescapedText = '';
  
  if (opts.bufferSize){
    termBufferSize = opts.bufferSize;
  }
  
  var outStream = {
    write:function(s){
      
      // todo:
      // keep a reference of cursor position
            
      unescapedText = unescapedText + s;// write to text    
      unescapedText = collapseCR(unescapedText);// collapse carriage returns
      
      if (unescapedText.length > termBufferSize){// limit buffer size
        unescapedText = unescapedText.slice(-1 * termBufferSize);
      }
      // escape then apply ansi colors when showing
      term.innerHTML = convert.toHtml(escapeHtml(unescapedText));      
            
      // scroll terminal
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

// collapse carriage returns

function collapseCR(str){
 
  //99% of the time there's no CR
  if (str.indexOf('\r') < 0){
    return str;
  }
  
  var lines = str.split('\n');
  
  lines.forEach(function(line,idx){
    var line = line;
    
    //transform each line
    var r = line.split('\r');
    var s = r[0];//start with the first part
    for (var i = 1; i < r.length; i ++){
      var part = r[i];
      // todo: ignore non-printing characters
      //this regex?   /[\u001b]\[\d*;*\d*m/
      var printLength = part.replace(/[\u001b]\[\d*;*\d*m/ig,'').length;
      
      //get printing length in existing line
      var existingPrintLength = s.replace(/[\u001b]\[\d*;*\d*m/ig,'').length;
      
      s = part + s.slice(printLength + s.length - existingPrintLength);
    }
    
    lines[idx] = s;
  });
  
  return lines.join('\n');
}


/*
  code below this was taken from moustache.js, which is really neat and MIT licensed.  I modified it slightly.  Copyright info follows:
  
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
  "/": '&#x2F;',
  " ": '&nbsp;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}