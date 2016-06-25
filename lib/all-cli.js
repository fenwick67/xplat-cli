//all CLIs inherit from this base class

//node-cli

var parseArgs = require('minimist');

module.exports = function(inStream,outStream){
    
   /*
   notes for implementer:
   
   you need to call cli.enter('str') when a user hits "enter" in your app.
   
   */ 
    
   var self = this;
   
   var _outStream = outStream;
   var _inStream = inStream;
   
   this.locked = false;
   
   this.setlocked = function(l){
       self.locked = false;
   }
   
   this.rootCtx = true;//are we in the root context?
   
   this.enter = function(s){
       if (self.rootCtx){
         self.runCommand(s);
       }else{//send to program
         if (!self.currentProgram){
             return;//something went very wrong
         }else{
             self.currentProgram._send(s);
         }
       }       
   }
   
   this.programs = {};
   this.currentProgram = null;
   this.delimiterProp = '$';
   this.delimiter = function(d){
       self.delimiterProp = d.toString();
       return self;
   }    
   this.command = function(name,fn){//register a command
     inheritProgramMethods(fn);//fn will inherit methods for write, writeln etc.
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
       
       if (this.programs.length > 0 && [args._[0]]){
           var pname = args._[0];
           args._.unshift();//remove first arg
           this.programs[pname](args,done);
       }else{
           invalidCommand(args._[0]);
       }
       
   }
   function invalidCommand(str){
       outStream.write('invalid command: '+str);
   }   
   
    function inheritProgramMethods(f){
        var program = f;
        
        program.prompts = [];
        
        program.write = function(){
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
        
        program.prompt = function(s){
            program.prompts.push(s);
            return program;
        }
         
                    
    }
      
    return this;
}
