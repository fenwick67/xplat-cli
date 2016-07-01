//tests

var cli = require('../index.js');
var chalk = require('chalk');
chalk.enabled = true;// enable for browser.  The detection feature of Chalk makes it not work out of the box.

cli()
.delimiter('~~~~~~~~')
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
    
    p.writeln('\nWhat... is your name?');
    p.once('enter',function(str){
      name = str;
      p.writeln('\nWhat... is your quest?');
      p.once('enter',function(str){
        quest = str;
        p.writeln('\nWhat... is your favorite color?');
        p.once('enter',function(str){
          color = str;
          p.writeln('\nLooks like you are '+name+' on a quest to '+quest+' and your favorite color is '+color+'.');
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
      p.writeln('\nok!');
      done();
    },1000)
  });
})
.command('help',function(args,done){// how you can use an empty entry to provide help or whatever
  this.writeln(['\navailable commands: ','q (i.e. questions)','a (show args)','setup','help (show this)',"dance (it's a surprise)"].join('\n   '));
  done();
}).command('dance',function(args,done){
  var p = this;
  var art = [chalk.cyan('<( 0_0<) '),chalk.green('<( 0_0 )>'),chalk.bgYellow(' (>0_0 )>'),chalk.bold.red('<( 0_0 )>')];
  var i = 0;
  p.write('\n');
  p.write('<<<<<<<<<<<<<<<<<<<<<<<<<  he dance');//todo: this doesn't really work all the time
  var iv = setInterval(function(){
    p.write('\r' + art[i = ((i+1) %art.length)]);
  },500);
  
  this.once('enter',function(){
    p.writeln("ok... I'll stop...                    \n");
    clearInterval(iv);
    done();
  });
  
})
.alias('','help')// show help on empty input
.run('dance');