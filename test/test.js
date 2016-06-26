//tests

var cli = require('../index.js');


cli()
.delimiter('~ ')
.command('a',function(args,done){
    var p = this;
    setTimeout(function(){ 
      p.writeln('my args: ',JSON.stringify(args,null,2));
      done();
    },1000);
})
.command(['q','questions'],function(args,done){
    var p = this;
    
    var name;
    var quest;
    var color;
    
    p.writeln('What... is your name?');
    p.once('enter',function(str){
      name = str;
      p.writeln('What... is your quest?');
      p.once('enter',function(str){
        quest = str;
        p.writeln('What... is your favorite color?');
        p.once('enter',function(str){
          color = str;
          p.writeln('Looks like you are '+name+' on a quest to '+quest+' and your favorite color is '+color+'.');
          done();
        });   
      });
    });    
})
.command('setup',function(args,done){// program.prompt is a quick way to prompt than writing and listening for enter event
  var p = this;
  p.prompt('What is your email? ',function(email){
    p.write('saving email ('+email+')...');
    setTimeout(function(){
      p.writeln('ok!');
      done();
    },1000)
  });
})
.command('help',function(args,done){// how you can use an empty entry to provide help or whatever
  this.writeln(['available commands: ','q (i.e. questions)','a (show args)','setup','help (show this)'].join('\n   '));
  done();
})
.alias('','help')// show help on empty input
.run('setup');