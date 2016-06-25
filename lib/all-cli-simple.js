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
           //exit app context
           self.rootCtx = true;
         });
       }else{//send to program
         if (!self.currentProgram){
             return;//something went very wrong
         }else{
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
     inheritProgramMethods(fn);//fn will inherit methods for write, writeln etc.
     console.log('write',fn.write);
     self.programs[name] = fn;
     return self;
   }
   
    this.runCommand = function(str,done){
      if (!str){
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
        
        if(!self.programs[pname]){
          invalidCommand(pname);
          return;
        }
        
        args._.unshift();//remove first arg
        self.currentProgram = self.programs[pname];
        
        self.currentProgram(args,done);
      }else{
        invalidCommand(pname);
      }
       
    }
    
    function invalidCommand(str){
      outStream.write('invalid command: '+str);
    }
    
    //program constructor
    function Program(){
      
    }
    
    function inheritProgramMethods(f){
        var program = f;
        //util.inherits(f,EventEmitter);
        
        program.onEnter = program.onEnter || null;
        
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
          program.write.call(this,arguments);
          program.write('\n');     
          return program;
        }
        
        program.sendEnter = function(s){
           if (program.onEnter){
               return program.onEnter(s);
           }else{
               return;
           }
        }                          
    }
    
    
      
    return this;
}
