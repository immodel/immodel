var _ = require('lodash');

module.exports = function(model) {
  model.attrs = model.attrs || {};
  
  model.attr = function(name, type) {
    if(arguments.length === 1) {
      if(! model.is(this.attrs[name]))
        this.attrs[name] = coerce(model, this.attrs[name]);
      return this.attrs[name];
    }
    
    if('string' === typeof type)
      type = {type: type};
    
    return this.use(function(model) {
      model.complex = true;
      model.attrs[name] = type;
    });
  };
};

function coerce(model, opts) {
  if(! opts) return;
  
  var type = model.is(opts.type)
    ? opts.type
    : model.lookup(opts.type);

  if(! type) throw new Error('type "' + opts.type + '" has not been registered');
  return type.use(_.omit(opts, 'type'), true);
}