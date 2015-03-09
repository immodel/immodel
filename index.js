var Emitter = require('component-emitter');
var isArray = require('isarray');
var clone = require('clone');

function BaseModel(value) {
  this.value = value;
  this.__isDocument = true;
}

Emitter(BaseModel);

BaseModel.use = function(fn, opts) {
  fn = fn || function() {};
  if('function' !== typeof fn)
    fn = optsPlugin(fn);

  if(this.mutable) {
    fn.call(this, opts);
    return this;
  }

  var model = createModel();

  extend(model, this);
  model.prototype = clone(this.prototype);
  model.prototype.model = model;

  model.mutable = true;
  fn.call(model, opts);
  model.mutable = false;

  return model;
};

function createModel(root) {
  function model(value) {
    BaseModel.call(this, value);

    // Allow event handlers to manipulate what ends up getting
    // returned here, so plugins can implement things like
    // discriminators
    var evt = {doc: this};
    this.model.emit('init', evt);
    return evt.doc;
  }

  return model;
}


function optsPlugin(opts) {
  return function() {
    var model = this;
    Object.keys(opts).forEach(function(key) {
      model = model[key](opts[key]);
    });
  };
}

function extend(dest, src) {
  Object.keys(src).forEach(function(key) {
    // clone is a noop for functions.
    // i.e. clone(console.log) === console.log
    dest[key] = clone(src[key]);
  });
}

module.exports = BaseModel;