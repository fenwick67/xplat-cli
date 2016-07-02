// parse a input line

//regexes
var printing = /[\ -~]/igm;

var backsp = String.fromCharCode(27) + String.fromCharCode(91) + String.fromCharCode(126);

module.exports = function parseLine(s){
  
  //for debugging
  /*
  for (var i = 0; i < s.length; i ++){
    console.log(s.charCodeAt(i));
  }
  */
  
  var ret = '';
  var pos = 0;//cursor position

  var chars = getCodes(s);
  
  //play back the characters on the line
  for (var i = 0; i < chars.length; i ++){
    
    switch (chars[i]){
      case 'backsp':
        ret = ret.substr(0,pos-1) + ret.slice(pos) ;pos--;break;
      case 'del':
        ret = ret.substr(0,pos) + ret.slice(pos+1) ;break;
      case 'right':
        pos++;break;
      case 'left':
        pos--;break;
      case 'home':
        pos = 0;break;
      case 'end':
        pos=ret.length;break;
      default:
        ret = ret.substr(0,pos) +chars[i]+ ret.slice(pos);pos++;break;
    }
    
    //snap to ends
    pos = Math.max(pos,0);
    pos = Math.min(pos,ret.length);
    
  }
  
  //console.log(ret,'(',ret.length,')')
  return {string:ret,cursorPosition:pos};

}

var esc = String.fromCharCode(27);

var backsp = esc + '[~';
var backsp2 = String.fromCharCode(8);
var del = String.fromCharCode(127);
var del2 = esc + '[3~'
var left = esc + '[D'
var right = esc + '[C'
var home = esc + ';~'
var end = esc + ';F'

function getCodes(s){
  var ret = [];
    
  var i = 0;  
  while(s.length){
    var l = 1;    
    if (s.indexOf(backsp) == 0){
      ret.push('backsp');
      l=3;
    }
    else if (s.indexOf(backsp2) == 0){
      ret.push('backsp');
      l=1;
    }
    else if (s.indexOf(del) == 0){
      ret.push('del')
    }
    else if (s.indexOf(del2) == 0){
      ret.push('del')
      l=4;
    }
    else if (s.indexOf(left) == 0){
      ret.push('left');
      l=3;
    }
    else if (s.indexOf(right) == 0){
      ret.push('right');
      l=3;
    }
    else if (s.indexOf(end) == 0){
      ret.push('end');
      l=3;
    }
    else if (s.indexOf(home) == 0){
      ret.push('home');
      l=3;
    }
    else{
      ret.push(s.charAt(0));
    }
    
    s = s.slice(l);
  }
  
  return ret;
  
}

/*
  var backsp = /\27\[~/gm
  var del = /x10/gm
  var left = /\27\[D/gm
  var right = /\27\[C/gm 
*/