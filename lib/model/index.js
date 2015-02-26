var Emitter = require('component-emitter');
var Document = require('../document');
var util = require('util');
var clonefn = require('clone-fn');
var _ = require('lodash');

var types = {};

function createModel(from, inheritConstructor) {
  var model;
  
  if(from) {
    model = inheritConstructor 
      ? clonefn(from) 
      : createModel();
      
    if(! is(model))
      util.inherits(model, Document);

    merge(model, from);
    return model;
  }
  
  model = function(doc) {
    if(! (this instanceof model)) {
      return (new model(doc));
    }

    Document.call(this, doc);
    this.model = model;
    this.model.emit('init', this);
  };
  
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

function type(name, opts) {
  var model = this;
  
  if(opts && opts.discriminator) {
    var key = opts.discriminator.key;
    var discriminatees = opts.discriminator.types;

    var discriminator = createModel(function(doc) {
      var name = doc[key];
      var type = discriminatees.indexOf(name) === -1
        ? model
        : types[name];

      return type.apply({}, arguments);
    }, true);

    _.extend(discriminator, model);
    types[name] = discriminator;
  } else {
    types[name] = model;
  }

  return types[name];
}

function is(type) {
  return type && (type.prototype instanceof Document);
}

function use(fn, inheritConstructor) {
  fn = fn || function() {};
  if('function' !== typeof fn)
    fn = useOpts(fn);
  
  if(this.mutable) {
    fn(this);
    return this;
  }
  
  var model = createModel(this, inheritConstructor);
   
  model.mutable = true;
  fn(model);
  model.mutable = false;
  
  return model;
}

function useOpts(opts) {
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
