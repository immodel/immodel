var _ = require('lodash');

module.exports = function(model) {
  model.attrs = model.attrs || {};
  
  model.attr = function(name, type) {
    if(arguments.length === 1) {
      // Support wildcard attributes
      if(! this.attrs[name] && this.attrs['*'])
        name = '*';
      
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
  
  model.eachAttr = function(fn) {
    var self = this;
    Object.keys(this.attrs).forEach(function(name) {
      var type = self.attr(name);
      if(name === '*') {
        // Iterate over all of the implicit attrs encompassed
        // by the wildcard attribute
        Object.keys(self.doc || {}).forEach(function(name) {
          if(! self.attrs[name]) {
            fn(name, type);
          }
        });
      } else {
        fn(name, type);
      }
    });
  };
};

function coerce(model, opts) {
  if(! opts) return;
  
  type = model.is(opts.type)
    ? opts.type
    : model.lookup(opts.type);
  
  if(! type) throw new Error('type "' + opts.type + '" has not been registered');
  return type.use(_.omit(opts, 'type'));
}