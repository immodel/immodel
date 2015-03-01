var model = require('./lib/model');

// Offer access to the native model so people can use their own
// versions of the plugins with it if they choose
exports.raw = model;
  
// Provide a bootstrapped model that has all the major features
// out of the box
exports.model = model
  .use(require('getter-setter'))
  .use(require('cast'))
  .use(require('methods'))
  .use(require('attrs'))
  .use(require('validation'))
  .use(require('required'))
  .use(require('defaults'))
  .use(require('discriminators'));
  

// These can be overriden by simply calling .type() on model
// again, so its ok to add them globally
require('types')(exports.model);


// This exists primarily for tests to easily swap out
// a module with their local copy.  This code is not
// compatible with browserify, so it is not recommended
// to be used unless you want to sacrifice client-side
// compatibility
var plugins = [
  'getter-setter', 
  'cast', 
  'methods', 
  'attrs', 
  'validation', 
  'required', 
  'defaults',
  'discriminators'
];

exports.plugins = plugins;

exports.bootstrap = function(replace) {
  replace = replace || {};

  var strapped = model;
  plugins.forEach(function(plugin) {
    strapped = strapped.use(replace[plugin] || require(plugin));
  });

  replace.types && replace.types(strapped);
  return strapped;
};