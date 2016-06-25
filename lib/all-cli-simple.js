// cli interface


// simplified

/*
program definition:

function program(args,exit){
  var nameP = this;
  this.write('whats ur name?');
  this.on('enter',function(s){
      nameP.write('nice to meet you '+s);
      exit();
  });
    
  exit();
}

 */

var parseArgs = require('minimist');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(inStream,outStream){
    
   /*
   notes for implementer:
   
   you need to call cli.onEnter('str') when a user hits "enter" in your app.
   
   
   */ 
    
   var self = this;
   
   var _outStream = outStream;
   var _inStream = inStream;
   
   this.locked = false;
   
   this.setlocked = function(l){
       self.locked = false;
   }
   
   this.rootCtx = true;//are we in the root context?
   
   this.onEnter = function(s){
     if (self.rootCtx){
       self.rootCtx = false;
       self.runCommand(s,function(er){
         //always exit app context
         self.rootCtx = true;
       });
     }else{//send to program
       if (!self.currentProgram){
           console.log('woops');
           return;//something went very wrong
       }else{
         //console.log('wop');
         self.currentProgram.sendEnter(s);
       }
     }       
   }
   
   self.programs = {};
   this.currentProgram = null;
   this.delimiterProp = '$';
   this.delimiter = function(d){
       self.delimiterProp = d.toString();
       return self;
   }
   
   this.command = function(name,fn){//register a command
     var p = new Program(fn);
     self.programs[name] = p;
     return self;
   }
   
    this.runCommand = function(str,done){
      if (!str){
        // todo run a _empty command
        invalidCommand(str);
        done(null);
        return self;
      }
      //command "str" was input into the cli
      var args = parseArgs(str.toString().split(' ')); 
      if(args._.length < 1){
        done(null);
        return self;
      }
       
      if ( Object.keys(self.programs).length > 0 && args._[0] ){
        var pname = args._[0];
        
        if(!pname){
          invalidCommand('<undefined>');
          return done(null);
        }
        
        if(!self.programs[pname]){
          invalidCommand(pname);
          return done(null);
        }
        
        args._.shift();//remove first arg
        self.currentProgram = self.programs[pname];
        var p = self.currentProgram;
        p.closed = false;
        p._run(args,function(er){
          p.closed = true;
          done(er)
        });
      }else{
        invalidCommand('<enter>');
        return done(null);
      }
       
    }
    
    function invalidCommand(str){
      outStream.write('invalid command: '+str+'\n');
    }
    
 
    
    // create a program from a function.  
    function Program(f){
        var program = this;
        program._run = f;
        
        program.onEnter = program.onEnter || function(s){};
        
        program.closed = false;
        
        program.write = function(){
            if (program.closed){
                return program;
            }
            var len = arguments.length;
            for (var i = 0; i < len; i ++){
                outStream.write(arguments[i]);
            }
            return program;
        }
        
        program.writeln = function(){
          var len = arguments.length;
          for (var i = 0; i < len; i ++){
              program.write(arguments[i]);
          }
          program.write('\n');     
          return program;
        }
        
        program.sendEnter = function(s){
           if (program.onEnter){
               return program.onEnter(s);
           }else{
               return program;
           }
        }
        program.prompt = function(s,f){
          program.write(s);
          program.onEnter = function(str){
            f(str);
          }
        }
    }  
    
      
    return this;
}
