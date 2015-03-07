var Emitter = require('component-emitter');
var Document = require('./document');
var util = require('util');
var _ = require('lodash');

var types = {};

function createModel() {
  function model(value) {
    Document.call(this, value);
    this.model = model;
    
    // Allow event handlers to manipulate what ends up getting
    // returned here, so plugins can implement things like
    // discriminators
    var evt = {doc: this};
    this.model.emit('init', evt);
    return evt.doc;
  }
  
  model.prototype = _.clone(Document.prototype);
  model.type = type;
  model.lookup = lookup;
  model.is = is;
  model.use = use;
  
  model.__isModel = true;
  
  Emitter(model);
  
  return model;
}

function lookup(name) {
  return types[name];
}

function type(name, constructor) {
  types[name] = constructor || this;
  return this;
}

function is(type) {
  return !! (type && type.__isModel);
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
  _.extend(model.prototype, this.prototype);

  model.mutable = true;
  fn(model);
  model.mutable = false;
  
  return model;
}

function optsPlugin(opts) {
  return function(model) {
    Object.keys(opts).forEach(function(key) {
      model = model[key](opts[key]);
    });
  };
}

function merge(a, b) {
  return _.merge(a, b, function(a, b) {
    return _.isArray(a) ? a.concat(b) : undefined;
  });
}

module.exports = createModel();