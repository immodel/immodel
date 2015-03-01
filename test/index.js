var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var immodel = require('../');
var model = immodel.model;

require('debug-trace')({always: true});

// Make sure to test all our default plugins
// anytime anything up here changes
immodel.plugins.forEach(function(plugin) {
  var p path.join('..', 'node_modules', plugin, 'test');
  if(fs.existsSync(p)) {
    require(p);
  }
});