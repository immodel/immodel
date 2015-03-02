var model = exports.model = require('./lib/model');

exports.bootstrap = function(replace) {
  replace = replace || {};

  // Write it all out so that it works with browserify
  model = model.use(replace['getter-setter'] || require('getter-setter'));
  model = model.use(replace.cast || require('cast'));
  model = model.use(replace.methods || require('methods'));
  model = model.use(replace.attrs || require('attrs'));
  model = model.use(replace.validation || require('validation'));
  model = model.use(replace.required || require('required'));
  model = model.use(replace.defaults || require('defaults'));
  model = model.use(replace.discriminators || require('discriminators'));

  (replace.types || require('types'))(model);

  
  return (exports.model = model);
};