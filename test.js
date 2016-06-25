//tests

var cli = require('./lib/node-cli.js');


cli()
.delimiter('$_$')
.command('h',function(args,done){
    var p = this;
    setTimeout(function(){ 
      p.writeln('my args: ',JSON.stringify(args,null,2));
      done();
    },1000);
})
.command('q',function(args,done){
    var p = this;
    
    var name;
    var quest;
    var color;
    
    p.writeln('What... is your name?');
    p.onEnter = function(str){
      name = str;
      p.writeln('What... is your quest?');
      p.onEnter = function(str){
        quest = str;
        p.writeln('What... is your favorite color?');
        p.onEnter = function(str){
          color = str;
          p.writeln(`Looks like you are ${name} on a quest to ${quest} and your favorite color is ${color}.`);
          done();
        }        
      };
    }
})
.command('setup',function(args,done){
  var p = this;
  p.prompt('What is your email? ',function(email){
    p.write('saving email ('+email+')...');
    setTimeout(function(){
      p.writeln('ok!');
      done();
    },1000)
  });
});