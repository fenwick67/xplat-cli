// cli-node

module.exports = function(){

    var outStream = {
        write:function(s){
            console.log(s);
        }
    }

    var inStream = {
        
    }

    var cli = require('./all-cli-simple')(inStream,outStream);

    var s = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable',function(){
        var chunk = process.stdin.read();
        if(!chunk){
            return;
        }
        s = s + chunk;
        var brIndex = s.indexOf('\n');
        if ( brIndex > -1) {
            var before = s.substr(0,brIndex-1);
            cli.onEnter(before);
            s = s.substring(brIndex);
        }
    
    });
    
    return cli;

}
