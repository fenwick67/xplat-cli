//tests

var cli = require('./lib/node-cli.js');


cli()
.command('hello',function(args,done){
    console.log(args);
    console.log('this',this);
    this.write('world!');
    done();
});