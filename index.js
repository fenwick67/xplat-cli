/*

common entry point

*/

// detect node hackily
var isNode = true;
if (typeof window == 'object') {
  isNode = false;
}

if (isNode){
    module.exports = exports = require('./lib/node-cli');
}else{
    module.exports = exports = require('./lib/browser-cli');
}