/*

common entry point

*/

if (!window){
    //it's node!
    module.exports = exports = require('./lib/node-cli');
}else{
    module.exports = exports = require('./lib/browser-cli');
}