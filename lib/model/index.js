var Emitter = require('component-emitter');
var Document = require('../document');
var util = require('util');
var _ = require('lodash');

var types = {};

function createModel() {
  function model(doc) {
    if(! (this instanceof model))
      return new model(doc);

    Document.call(this, doc);
    this.model = model;
    
    // Allow event handlers to manipulate what ends up getting
    // returned here, so plugins can implement things like
    // discriminators
    var evt = {doc: this};
    this.model.emit('init', evt);
    return evt.doc;
  }
  
  model.type = type;
  model.lookup = lookup;
  model.is = is;
  model.use = use;
  
  
  util.inherits(model, Document);
  Emitter(model);
  
  return model;
}

function lookup(name) {
  return types[name];
}

function type(name) {
  types[name] = this;
  return this;
}

function is(type) {
  return type && (type.prototype instanceof Document);
}

function use(fn) {
  fn = fn || function() {};
  if('function' !== typeof fn)
    fn = optsPlugin(fn);
  
  if(this.mutable) {
    fn(this);
    return this;
  }
  
  var model = createModel();
  merge(model, this);
  
  model.mutable = true;
  fn(model);
  model.mutable = false;
  
  return model;
}

function optsPlugin(opts) {
  return function(model) {
    _.each(opts, function(val, key) {
      model = model[key](val);
    });
  };
}

function merge(a, b) {
  return _.merge(a, b, function(a, b) {
    return _.isArray(a) ? a.concat(b) : undefined;
  });
}

module.exports = createModel();